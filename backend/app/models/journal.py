from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID


class JournalSettings(BaseModel):
    indent_lines: int = Field(default=4, ge=0, le=10)
    page_format: str = Field(default="A4")
    margins: dict = Field(default={"left": 2, "right": 2, "top": 2, "bottom": 2})
    year: int
    month: int = Field(ge=1, le=12)


class GenerationRequest(BaseModel):
    settings: JournalSettings
    article_ids: List[UUID]
    templates: dict = Field(default={
        "title_id": None,
        "intro_id": None,
        "outro_id": None
    })


class GenerationResponse(BaseModel):
    task_id: UUID


class GenerationStatus(BaseModel):
    status: str  # 'pending' | 'processing' | 'done' | 'error'
    progress: int = Field(ge=0, le=100)
    current_step: Optional[str] = None
    error_message: Optional[str] = None


class PreviewItem(BaseModel):
    type: str  # 'title' | 'intro' | 'article' | 'toc' | 'outro'
    title: Optional[str] = None
    author: Optional[str] = None
    page_start: Optional[int] = None
    pages: Optional[int] = None


class PreviewResponse(BaseModel):
    structure: List[PreviewItem]
    total_pages: int
