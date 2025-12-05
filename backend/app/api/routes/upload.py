from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os
import uuid
from typing import Optional
from app.db.base import get_db
from app.models.database import Session, Article, Template
from app.models.schemas import ArticleResponse, TemplateResponse
from app.services.ai_extractor import AIExtractorService
from app.core.config import settings

router = APIRouter()


@router.post("/article", response_model=ArticleResponse)
async def upload_article(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload article (.docx) with AI metadata extraction.
    Creates new session if session_id not provided.
    """
    # Validate file type
    if not file.filename.endswith('.docx'):
        raise HTTPException(400, "Only .docx files are allowed")

    # Get or create session
    if session_id:
        result = await db.execute(
            select(Session).where(Session.id == uuid.UUID(session_id))
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(404, "Session not found")
    else:
        session = Session()
        db.add(session)
        await db.commit()
        await db.refresh(session)

    # Save file
    upload_dir = os.path.join(settings.UPLOAD_DIR, str(session.id))
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Extract metadata using AI
    ai_service = AIExtractorService()
    try:
        metadata = await ai_service.extract_metadata(file_path)
    except Exception as e:
        # Fallback: use filename
        metadata = await ai_service._simple_extraction("")

    # Create article record
    article = Article(
        session_id=session.id,
        filename=file.filename,
        title=metadata.title,
        author=metadata.author,
        language=metadata.language,
        file_path=file_path,
        ai_confidence=metadata.confidence
    )
    db.add(article)
    await db.commit()
    await db.refresh(article)

    return article


@router.post("/template", response_model=TemplateResponse)
async def upload_template(
    file: UploadFile = File(...),
    template_type: str = Form(...),  # 'title' | 'intro' | 'outro'
    session_id: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload template file (title page, intro pages, outro pages)"""
    # Validate file type
    if not (file.filename.endswith('.pdf') or file.filename.endswith('.docx')):
        raise HTTPException(400, "Only .pdf and .docx files are allowed")

    # Validate template type
    if template_type not in ['title', 'intro', 'outro']:
        raise HTTPException(400, "Invalid template type")

    # Get session
    result = await db.execute(
        select(Session).where(Session.id == uuid.UUID(session_id))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(404, "Session not found")

    # Save file
    upload_dir = os.path.join(settings.UPLOAD_DIR, str(session.id))
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, f"{template_type}_{file.filename}")
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Create template record
    template = Template(
        session_id=session.id,
        type=template_type,
        filename=file.filename,
        file_path=file_path
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)

    return template
