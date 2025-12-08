# backend/app/db/database.py
import os
import time
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy import text

logger = logging.getLogger("autoredactor")

# Declarative base for models
Base = declarative_base()

def get_engine() -> AsyncEngine:
    """Создаёт engine с ретраями — только эта функция используется при старте"""
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError("Переменная DATABASE_URL не установлена!")

    # Convert postgresql:// to postgresql+asyncpg://
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    for attempt in range(1, 21):
        try:
            engine = create_async_engine(
                url,
                echo=False,
                future=True,
                pool_pre_ping=True,
                pool_recycle=300,
            )
            # Проверка соединения
            import asyncio
            async def test():
                async with engine.begin() as conn:
                    await conn.execute(text("SELECT 1"))
            asyncio.run(test())
            logger.info("Подключение к PostgreSQL установлено")
            return engine
        except Exception as e:
            if attempt == 20:
                logger.error("Не удалось подключиться к БД после 20 попыток")
                raise
            wait = min(2 ** attempt, 30)
            logger.warning(f"Попытка {attempt}/20: БД недоступна — ждём {wait}с...")
            time.sleep(wait)

# Создаём sessionmaker (будет инициализирован в lifespan)
AsyncSessionLocal = async_sessionmaker(
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

# Alias for backward compatibility
async_session_maker = AsyncSessionLocal

# Dependency for FastAPI routes
async def get_db():
    """Database session dependency"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
