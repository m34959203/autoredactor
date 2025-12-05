from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.db.base import get_db
from app.models.database import GenerationTask, Session as DBSession
from app.models.schemas import GenerationRequest, GenerationTaskResponse
from app.services.journal_builder import JournalBuilderService
import asyncio

router = APIRouter()


@router.post("/", response_model=GenerationTaskResponse)
async def start_generation(
    request: GenerationRequest,
    db: AsyncSession = Depends(get_db)
):
    """Start journal generation process"""
    # Get session from first article
    if not request.article_ids:
        raise HTTPException(400, "No articles provided")

    # Create generation task
    task = GenerationTask()
    db.add(task)
    await db.commit()
    await db.refresh(task)

    # Start background task
    asyncio.create_task(
        _build_journal_task(
            task.id,
            request.article_ids,
            request.settings,
            request.templates,
            db
        )
    )

    return task


async def _build_journal_task(
    task_id: UUID,
    article_ids: list,
    settings,
    templates: dict,
    db: AsyncSession
):
    """Background task for building journal"""
    builder = JournalBuilderService(db)
    try:
        await builder.build_journal(task_id, article_ids, settings, templates)
    except Exception as e:
        print(f"Generation failed: {e}")


@router.get("/{task_id}/status", response_model=GenerationTaskResponse)
async def get_generation_status(
    task_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get generation task status"""
    result = await db.execute(
        select(GenerationTask).where(GenerationTask.id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
    return task


@router.get("/{task_id}/download")
async def download_generated_pdf(
    task_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Download generated PDF"""
    result = await db.execute(
        select(GenerationTask).where(GenerationTask.id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")

    if task.status != "done":
        raise HTTPException(400, f"Task not completed. Status: {task.status}")

    if not task.result_path:
        raise HTTPException(500, "PDF file not found")

    return FileResponse(
        task.result_path,
        media_type="application/pdf",
        filename="journal.pdf"
    )


@router.get("/preview")
async def preview_structure(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Preview journal structure before generation"""
    from app.models.database import Article, Template

    # Get articles
    result = await db.execute(
        select(Article)
        .where(Article.session_id == UUID(session_id))
        .order_by(Article.sort_order.asc())
    )
    articles = result.scalars().all()

    # Get templates
    result = await db.execute(
        select(Template).where(Template.session_id == UUID(session_id))
    )
    templates = result.scalars().all()

    # Build structure preview
    structure = []
    current_page = 1

    # Add title if exists
    title_template = next((t for t in templates if t.type == "title"), None)
    if title_template:
        structure.append({
            "type": "title",
            "pages": title_template.pages or 1,
            "page_start": current_page
        })
        current_page += title_template.pages or 1

    # Add intro if exists
    intro_template = next((t for t in templates if t.type == "intro"), None)
    if intro_template:
        structure.append({
            "type": "intro",
            "pages": intro_template.pages or 2,
            "page_start": current_page
        })
        current_page += intro_template.pages or 2

    # Add articles (estimate ~5 pages each)
    for article in articles:
        pages_estimate = 5  # Simple estimate
        structure.append({
            "type": "article",
            "title": article.title,
            "author": article.author,
            "page_start": current_page,
            "pages": pages_estimate
        })
        current_page += pages_estimate

    # Add TOC (estimate 2 pages)
    structure.append({
        "type": "toc",
        "page_start": current_page,
        "pages": 2
    })
    current_page += 2

    # Add outro if exists
    outro_template = next((t for t in templates if t.type == "outro"), None)
    if outro_template:
        structure.append({
            "type": "outro",
            "pages": outro_template.pages or 2,
            "page_start": current_page
        })
        current_page += outro_template.pages or 2

    return {
        "structure": structure,
        "total_pages": current_page - 1
    }
