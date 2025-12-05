from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# Article schemas
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
    ai_confidence: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


# AI Extraction Response
class AIMetadata(BaseModel):
    title: str
    author: str
    language: str  # 'latin' | 'cyrillic'
    confidence: float = Field(ge=0.0, le=1.0)


# Template schemas
class TemplateCreate(BaseModel):
    type: str  # 'title' | 'intro' | 'outro'
    filename: str
    file_path: str
    pages: Optional[int] = None


class TemplateResponse(BaseModel):
    id: UUID
    type: str
    filename: str
    pages: Optional[int] = None

    class Config:
        from_attributes = True


# Generation schemas
class GenerationSettings(BaseModel):
    indent_lines: int = 4
    page_format: str = "A4"
    margins: dict = {"left": 2, "right": 2, "top": 2, "bottom": 2}
    year: int
    month: int


class GenerationRequest(BaseModel):
    settings: GenerationSettings
    article_ids: List[UUID]
    templates: dict = {"title_id": None, "intro_id": None, "outro_id": None}


class GenerationTaskResponse(BaseModel):
    id: UUID
    status: str
    progress: int
    current_step: Optional[str] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


# Archive schemas
class ArchiveCreate(BaseModel):
    year: int
    month: int
    filename: str
    file_path: str
    pages: int
    articles_count: int
    file_size: int


class ArchiveResponse(BaseModel):
    id: UUID
    year: int
    month: int
    filename: str
    pages: int
    articles_count: int
    file_size: int
    created_at: datetime

    class Config:
        from_attributes = True


# Session schemas
class SessionResponse(BaseModel):
    id: UUID
    created_at: datetime
    expires_at: datetime
    status: str

    class Config:
        from_attributes = True


# AI Chat
class AIChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None


class AIChatResponse(BaseModel):
    reply: str
