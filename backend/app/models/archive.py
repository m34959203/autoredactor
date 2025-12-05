from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class ArchiveBase(BaseModel):
    year: int
    month: int


class ArchiveCreate(ArchiveBase):
    filename: str
    file_url: str
    pages: int
    articles_count: int
    file_size: int


class ArchiveResponse(ArchiveBase):
    id: UUID
    filename: str
    file_url: str
    pages: int
    articles_count: int
    file_size: int
    created_at: datetime

    class Config:
        from_attributes = True
