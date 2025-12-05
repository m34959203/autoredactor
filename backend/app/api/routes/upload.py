from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os
import uuid
from typing import Optional

from app.db.database import get_db
from app.db.models import Session as DBSession, Article, Template
from app.models.article import ArticleResponse
from app.services.docx_parser import DocxParser
from app.services.ai_extractor import AIExtractor
from app.services.pdf_generator import PDFGenerator
from app.core.config import settings

router = APIRouter()
docx_parser = DocxParser()
ai_extractor = AIExtractor()
pdf_generator = PDFGenerator()


@router.post("/article", response_model=ArticleResponse)
async def upload_article(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload article file (.docx) and extract metadata using AI.
    """
    # Validate file type
    if not file.filename.endswith('.docx'):
        raise HTTPException(status_code=400, detail="Only .docx files are allowed")

    # Check file size
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large (max {settings.MAX_FILE_SIZE_MB}MB)")

    # Get or create session
    if session_id:
        result = await db.execute(
            select(DBSession).where(DBSession.id == uuid.UUID(session_id))
        )
        session_obj = result.scalar_one_or_none()
        if not session_obj:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        session_obj = DBSession()
        db.add(session_obj)
        await db.commit()
        await db.refresh(session_obj)

    # Check article limit
    result = await db.execute(
        select(Article).where(Article.session_id == session_obj.id)
    )
    article_count = len(result.scalars().all())
    if article_count >= settings.MAX_ARTICLES_PER_SESSION:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {settings.MAX_ARTICLES_PER_SESSION} articles per session"
        )

    # Save file
    file_id = uuid.uuid4()
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}.docx")
    with open(file_path, 'wb') as f:
        f.write(contents)

    # Validate DOCX
    if not docx_parser.validate_docx(file_path):
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="Invalid DOCX file")

    # Extract text for AI processing
    try:
        text = docx_parser.extract_text(file_path, max_chars=2000)

        # Extract metadata using AI
        metadata = await ai_extractor.extract_metadata(text)

        # Create article record
        article = Article(
            session_id=session_obj.id,
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

    except Exception as e:
        # Cleanup on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@router.post("/template")
async def upload_template(
    file: UploadFile = File(...),
    template_type: str = Form(...),
    session_id: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload template file (title, intro, outro) - PDF or DOCX.
    """
    # Validate type
    if template_type not in ['title', 'intro', 'outro']:
        raise HTTPException(status_code=400, detail="Invalid template type")

    # Validate file type
    if not (file.filename.endswith('.pdf') or file.filename.endswith('.docx')):
        raise HTTPException(status_code=400, detail="Only .pdf and .docx files are allowed")

    # Get session
    result = await db.execute(
        select(DBSession).where(DBSession.id == uuid.UUID(session_id))
    )
    session_obj = result.scalar_one_or_none()
    if not session_obj:
        raise HTTPException(status_code=404, detail="Session not found")

    # Save file
    file_id = uuid.uuid4()
    file_ext = '.pdf' if file.filename.endswith('.pdf') else '.docx'
    file_path = os.path.join(settings.UPLOAD_DIR, f"template_{file_id}{file_ext}")

    contents = await file.read()
    with open(file_path, 'wb') as f:
        f.write(contents)

    # Convert DOCX to PDF if needed
    if file_ext == '.docx':
        pdf_path = file_path.replace('.docx', '.pdf')
        try:
            pdf_generator.docx_to_pdf(file_path, pdf_path)
            file_path = pdf_path
        except Exception as e:
            os.remove(file_path)
            raise HTTPException(status_code=500, detail=f"Error converting to PDF: {str(e)}")

    # Get page count
    try:
        pages = pdf_generator.get_pdf_page_count(file_path)
    except Exception:
        pages = 1

    # Create or update template record
    result = await db.execute(
        select(Template).where(
            Template.session_id == session_obj.id,
            Template.type == template_type
        )
    )
    template = result.scalar_one_or_none()

    if template:
        # Remove old file
        if os.path.exists(template.file_path):
            os.remove(template.file_path)
        template.filename = file.filename
        template.file_path = file_path
        template.pages = pages
    else:
        template = Template(
            session_id=session_obj.id,
            type=template_type,
            filename=file.filename,
            file_path=file_path,
            pages=pages
        )
        db.add(template)

    await db.commit()
    await db.refresh(template)

    return {
        "id": str(template.id),
        "filename": template.filename,
        "pages": template.pages,
        "type": template.type
    }
