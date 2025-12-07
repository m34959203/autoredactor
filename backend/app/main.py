import os
import time
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

logger = logging.getLogger(__name__)

# Глобальные объекты (будут перезаписаны при старте)
engine: AsyncEngine | None = None
AsyncSessionLocal: sessionmaker | None = None


def get_engine() -> AsyncEngine:
    """
    Создаёт AsyncEngine с ретраями — критически важно для Railway!
    """
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("Переменная окружения DATABASE_URL не найдена!")

    max_attempts = 20
    for attempt in range(1, max_attempts + 1):
        try:
            engine = create_async_engine(
                database_url,
                echo=False,
                future=True,
                pool_pre_ping=True,
                pool_recycle=300,
            )
            # Тестируем реальное соединение
            import asyncio
            async def test():
                async with engine.begin() as conn:
                    await conn.execute("SELECT 1")
            asyncio.run(test())

            logger.info("Подключение к базе данных установлено!")
            return engine

        except (OperationalError, Exception) as e:
            if attempt == max_attempts:
                logger.error(f"Исчерпаны все попытки подключения к БД: {e}")
                raise
            wait = min(2 ** attempt, 30)  # экспоненциальный backoff, максимум 30 сек
            logger.warning(f"Попытка {attempt}/{max_attempts}: БД недоступна ({e}). Ждём {wait}с...")
            time.sleep(wait)

    raise RuntimeError("Не удалось подключиться к базе данных")


# Создаём sessionmaker после успешного подключения (используется в lifespan)
AsyncSessionLocal = sessionmaker(
    bind=None,  # будет заменён в lifespan на app.state.engine
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)
