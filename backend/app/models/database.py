from sqlalchemy import Column, String, Integer, Float, BigInteger, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from datetime import datetime, timedelta
import uuid
from app.db.base import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=24))
    status = Column(String(20), default="active")


class Article(Base):
    __tablename__ = "articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"))
    filename = Column(String(255), nullable=False)
    title = Column(String(500))
    author = Column(String(255))
    language = Column(String(10))  # 'latin' | 'cyrillic'
    sort_order = Column(Integer)
    file_path = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    ai_confidence = Column(Float)


class Template(Base):
    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"))
    type = Column(String(20), nullable=False)  # 'title' | 'intro' | 'outro'
    filename = Column(String(255))
    file_path = Column(String(500))
    pages = Column(Integer)


class Archive(Base):
    __tablename__ = "archive"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    filename = Column(String(255))
    file_path = Column(String(500))
    pages = Column(Integer)
    articles_count = Column(Integer)
    file_size = Column(BigInteger)
    created_at = Column(DateTime, default=datetime.utcnow)


class GenerationTask(Base):
    __tablename__ = "generation_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"))
    status = Column(String(20), default="pending")  # pending, processing, done, error
    progress = Column(Integer, default=0)
    current_step = Column(String(100))
    result_path = Column(String(500))
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
