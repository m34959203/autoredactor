import os
import time
import logging
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy import URL
from sqlalchemy.exc import OperationalError

logger = logging.getLogger(__name__)

def get_engine() -> AsyncEngine:
    # Сначала пробуем взять готовую DATABASE_URL из env (для Railway)
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        # Fallback для локалки (docker-compose)
        database_url = URL.create(
            "postgresql+asyncpg",
            username=os.getenv("POSTGRES_USER", "postgres"),
            password=os.getenv("POSTGRES_PASSWORD", "postgres"),
            host=os.getenv("POSTGRES_HOST", "localhost"),
            port=int(os.getenv("POSTGRES_PORT", 5432)),
            database=os.getenv("POSTGRES_DB", "aieditor"),
        ).render_as_string()
    
    engine = None
    max_attempts = 15  # До ~5 мин ожидания
    for attempt in range(max_attempts):
        try:
            engine = create_async_engine(
                database_url,
                echo=False,
                future=True,
                pool_pre_ping=True,  # Авто-проверка соединений
                pool_recycle=300,    # Реконнект каждые 5 мин
            )
            # Тестовый запрос для проверки готовности
            async def test_connection():
                async with engine.begin() as conn:
                    await conn.execute("SELECT 1")
            import asyncio
            asyncio.run(test_connection())  # Синхронный вызов async для простоты
            logger.info("✅ Database connected successfully")
            return engine
        except (OperationalError, Exception) as e:
            if attempt == max_attempts - 1:
                logger.error(f"❌ Failed to connect to database after {max_attempts} attempts: {e}")
                raise
            wait_time = (3 ** attempt) + (attempt * 2)  # Экспоненциальный backoff: 3s → 11s → 30s...
            logger.warning(f"Attempt {attempt + 1}/{max_attempts}: DB not ready ({e}). Retrying in {wait_time}s...")
            time.sleep(wait_time)
    
    raise RuntimeError("Database connection failed")
