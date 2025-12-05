from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class ArticleBase(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    language: Optional[str] = None


class ArticleCreate(ArticleBase):
    filename: str
    file_path: str


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None


class ArticleResponse(ArticleBase):
    id: UUID
    session_id: UUID
    filename: str
    sort_order: Optional[int] = None
    created_at: datetime
    ai_confidence: Optional[float] = None

    class Config:
        from_attributes = True


class ArticleMetadata(BaseModel):
    title: str
    author: str
    language: str  # 'latin' | 'cyrillic'
    confidence: float = Field(ge=0.0, le=1.0)
