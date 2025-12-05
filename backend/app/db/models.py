from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, BigInteger, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import uuid

from app.db.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=24))
    status = Column(String(20), default="active")

    # Relationships
    articles = relationship("Article", back_populates="session", cascade="all, delete-orphan")
    templates = relationship("Template", back_populates="session", cascade="all, delete-orphan")
    generation_tasks = relationship("GenerationTask", back_populates="session")


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

    # Relationships
    session = relationship("Session", back_populates="articles")


class Template(Base):
    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"))
    type = Column(String(20), nullable=False)  # 'title' | 'intro' | 'outro'
    filename = Column(String(255))
    file_path = Column(String(500))
    pages = Column(Integer)

    # Relationships
    session = relationship("Session", back_populates="templates")


class Archive(Base):
    __tablename__ = "archive"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    filename = Column(String(255))
    file_url = Column(String(500))
    pages = Column(Integer)
    articles_count = Column(Integer)
    file_size = Column(BigInteger)
    created_at = Column(DateTime, default=datetime.utcnow)


class GenerationTask(Base):
    __tablename__ = "generation_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"))
    status = Column(String(20), default="pending")
    progress = Column(Integer, default=0)
    current_step = Column(String(100))
    result_path = Column(String(500))
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    # Relationships
    session = relationship("Session", back_populates="generation_tasks")
