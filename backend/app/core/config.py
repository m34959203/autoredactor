from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/aieditor"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # S3 Storage
    S3_ENDPOINT: str = "https://s3.amazonaws.com"
    S3_BUCKET: str = "journal-archive"
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None

    # AI
    OPENROUTER_API_KEY: Optional[str] = None
    AI_MODEL: str = "deepseek/deepseek-chat"

    # App
    SESSION_TTL_HOURS: int = 24
    MAX_FILE_SIZE_MB: int = 50
    MAX_ARTICLES_PER_SESSION: int = 100
    UPLOAD_DIR: str = "./uploads"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
