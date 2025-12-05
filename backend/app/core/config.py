from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "AI-Редактор журнала"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/aieditor"

    # Redis (for Celery)
    REDIS_URL: str = "redis://localhost:6379/0"

    # AI (OpenRouter)
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    AI_MODEL: str = "deepseek/deepseek-r1-distill-llama-70b"  # Free model

    # File storage
    UPLOAD_DIR: str = "./uploads"
    ARCHIVE_DIR: str = "./archive"
    MAX_FILE_SIZE_MB: int = 50
    MAX_ARTICLES_PER_SESSION: int = 100

    # Session
    SESSION_TTL_HOURS: int = 24

    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5000"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
