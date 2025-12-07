# backend/app/main.py
import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.database import get_engine
from app.api.routes import upload, articles, generate, archive

# Логирование
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("autoredactor")

# Создаём папку для загрузок
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Глобальные объекты, которые заполнятся в lifespan
engine = None
SessionLocal = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global engine, SessionLocal
    logger.info("Запуск backend...")
    try:
        engine = get_engine()  # ← с ретраями из database.py
        from sqlalchemy.orm import sessionmaker
        from sqlalchemy.ext.asyncio import AsyncSession

        SessionLocal = sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
        app.state.engine = engine
        app.state.SessionLocal = SessionLocal
        logger.info("База данных подключена успешно!")
    except Exception as e:
        logger.error(f"Ошибка подключения к БД: {e}")
        raise

    yield

    logger.info("Остановка backend...")
    if engine:
        await engine.dispose()


# ← ЭТО ВАЖНО: создаём app ПОСЛЕ всех импортов и определений!
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

# Статические файлы
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/")
def root():
    return {"message": "AI Journal Editor API", "docs": "/docs"}


@app.get("/health")
async def health():
    if not hasattr(app.state, "engine"):
        raise HTTPException(status_code=503, detail="DB not ready")
    try:
        async with app.state.SessionLocal() as db:
            await db.execute("SELECT 1")
        return {"status": "healthy", "database": "ok"}
    except Exception as e:
        logger.warning(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Database unavailable")
