# backend/app/main.py
import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.database import get_engine, AsyncSessionLocal
from app.api.routes import upload, articles, generate, archive

# Логирование
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("autoredactor")

# Создаём папку
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Запуск приложения...")
    app.state.db_available = False
    app.state.engine = None

    try:
        engine = get_engine()  # ← с ретраями!
        app.state.engine = engine
        # Bind engine to AsyncSessionLocal
        AsyncSessionLocal.configure(bind=engine)
        app.state.db_available = True
        logger.info("✅ База данных готова")
    except Exception as e:
        logger.error(f"⚠️ База данных недоступна: {e}")
        logger.warning("Приложение продолжит работу с ограниченным функционалом")
        # Не падаем - позволяем приложению запуститься

    yield

    logger.info("Остановка — закрываем соединения...")
    if app.state.engine:
        try:
            await app.state.engine.dispose()
        except Exception as e:
            logger.error(f"Ошибка при закрытии БД: {e}")

app = FastAPI(
    title="AI Journal Editor",
    description="AI-powered journal editor",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Роутеры
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(articles.router, prefix="/api/articles", tags=["articles"])
app.include_router(generate.router, prefix="/api/generate", tags=["generate"])
app.include_router(archive.router, prefix="/api/archive", tags=["archive"])

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.get("/")
def root():
    return {"message": "AI Journal Editor API", "docs": "/docs"}

@app.get("/health")
async def health():
    """Health check endpoint - returns 200 even if DB is down"""
    db_status = "disconnected"

    if app.state.db_available:
        try:
            from sqlalchemy import text
            async with AsyncSessionLocal() as db:
                await db.execute(text("SELECT 1"))
            db_status = "connected"
        except Exception as e:
            logger.warning(f"Health check DB query failed: {e}")
            db_status = "error"

    return {
        "status": "healthy",
        "database": db_status,
        "message": "Service is running" + (" (database unavailable)" if db_status != "connected" else "")
    }
