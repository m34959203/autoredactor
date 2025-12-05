from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import os
from typing import Dict, Optional

from app.db.database import get_db
from app.db.models import Article, Template, GenerationTask
from app.models.journal import (
    GenerationRequest,
    GenerationResponse,
    GenerationStatus,
    PreviewResponse
)
from app.services.pdf_generator import PDFGenerator
from app.services.journal_builder import JournalBuilder
from app.core.config import settings

router = APIRouter()
pdf_generator = PDFGenerator()
journal_builder = JournalBuilder(pdf_generator)


async def generate_journal_task(
    task_id: uuid.UUID,
    article_ids: list,
    template_dict: dict,
    settings_dict: dict
):
    """
    Background task for journal generation.
    """
    from app.db.database import async_session_maker

    async with async_session_maker() as db:
        try:
            # Get task
            result = await db.execute(
                select(GenerationTask).where(GenerationTask.id == task_id)
            )
            task = result.scalar_one()

            # Get articles
            result = await db.execute(
                select(Article).where(Article.id.in_(article_ids))
            )
            articles = result.scalars().all()

            # Sort articles if not already sorted
            articles = sorted(articles, key=lambda a: a.sort_order or 0)

            # Get templates
            templates = {}
            for key, template_id in template_dict.items():
                if template_id:
                    result = await db.execute(
                        select(Template).where(Template.id == uuid.UUID(template_id))
                    )
                    templates[key] = result.scalar_one_or_none()
                else:
                    templates[key] = None

            # Build journal
            from app.models.journal import JournalSettings
            journal_settings = JournalSettings(**settings_dict)

            output_path = os.path.join(
                settings.UPLOAD_DIR,
                f"journal_{task_id}.pdf"
            )

            result_path = await journal_builder.build_journal(
                db,
                task,
                list(articles),
                templates,
                journal_settings,
                output_path
            )

            # Update task
            task.status = "done"
            task.result_path = result_path
            task.progress = 100
            await db.commit()

        except Exception as e:
            task.status = "error"
            task.error_message = str(e)
            await db.commit()


@router.post("/", response_model=GenerationResponse)
async def start_generation(
    request: GenerationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Start journal generation process.
    """
    # Validate articles exist
    if not request.article_ids:
        raise HTTPException(status_code=400, detail="No articles provided")

    result = await db.execute(
        select(Article).where(Article.id.in_(request.article_ids))
    )
    articles = result.scalars().all()

    if len(articles) != len(request.article_ids):
        raise HTTPException(status_code=404, detail="Some articles not found")

    # Get session_id from first article
    session_id = articles[0].session_id

    # Create generation task
    task = GenerationTask(
        session_id=session_id,
        status="pending",
        progress=0
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    # Start background task
    background_tasks.add_task(
        generate_journal_task,
        task.id,
        [str(aid) for aid in request.article_ids],
        request.templates,
        request.settings.dict()
    )

    return GenerationResponse(task_id=task.id)


@router.get("/{task_id}/status", response_model=GenerationStatus)
async def get_generation_status(
    task_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get generation task status.
    """
    result = await db.execute(
        select(GenerationTask).where(GenerationTask.id == uuid.UUID(task_id))
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return GenerationStatus(
        status=task.status,
        progress=task.progress,
        current_step=task.current_step,
        error_message=task.error_message
    )


@router.get("/{task_id}/download")
async def download_journal(
    task_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Download generated journal PDF.
    """
    result = await db.execute(
        select(GenerationTask).where(GenerationTask.id == uuid.UUID(task_id))
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.status != "done":
        raise HTTPException(status_code=400, detail="Generation not complete")

    if not task.result_path or not os.path.exists(task.result_path):
        raise HTTPException(status_code=404, detail="Generated file not found")

    return FileResponse(
        task.result_path,
        media_type="application/pdf",
        filename=f"journal_{task_id}.pdf"
    )


@router.post("/preview", response_model=PreviewResponse)
async def preview_structure(
    request: GenerationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Preview journal structure without generating.
    """
    # Get articles
    result = await db.execute(
        select(Article).where(Article.id.in_(request.article_ids))
    )
    articles = list(result.scalars().all())

    # Sort articles
    articles.sort(key=lambda a: a.sort_order or 0)

    # Get templates
    templates = {}
    for key, template_id in request.templates.items():
        if template_id:
            result = await db.execute(
                select(Template).where(Template.id == uuid.UUID(str(template_id)))
            )
            templates[key] = result.scalar_one_or_none()
        else:
            templates[key] = None

    # Generate preview
    preview = await journal_builder.preview_structure(
        articles,
        templates,
        request.settings
    )

    return PreviewResponse(**preview)
