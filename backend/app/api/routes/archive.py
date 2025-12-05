from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
import uuid
import os
import shutil

from app.db.database import get_db
from app.db.models import Archive, GenerationTask
from app.models.archive import ArchiveResponse, ArchiveCreate
from app.services.pdf_generator import PDFGenerator
from app.core.config import settings

router = APIRouter()
pdf_generator = PDFGenerator()


@router.get("/", response_model=List[ArchiveResponse])
async def get_archive_list(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of archived issues.
    Optionally filter by year and/or month.
    """
    query = select(Archive)

    if year:
        query = query.where(Archive.year == year)
    if month:
        query = query.where(Archive.month == month)

    query = query.order_by(Archive.year.desc(), Archive.month.desc())

    result = await db.execute(query)
    archives = result.scalars().all()

    return archives


@router.get("/years")
async def get_years(db: AsyncSession = Depends(get_db)):
    """
    Get list of years that have archived issues.
    """
    result = await db.execute(
        select(Archive.year).distinct().order_by(Archive.year.desc())
    )
    years = [row[0] for row in result.all()]

    return years


@router.post("/", response_model=ArchiveResponse)
async def save_to_archive(
    task_id: str,
    year: int,
    month: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Save generated journal to archive.
    """
    # Validate month
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Invalid month (1-12)")

    # Get generation task
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

    # Check if archive entry already exists for this year/month
    result = await db.execute(
        select(Archive).where(
            Archive.year == year,
            Archive.month == month
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        # Remove old file
        if os.path.exists(existing.file_url):
            os.remove(existing.file_url)
        await db.delete(existing)

    # Copy file to archive location
    archive_dir = os.path.join(settings.UPLOAD_DIR, "archive")
    os.makedirs(archive_dir, exist_ok=True)

    filename = f"journal_{year}_{month:02d}.pdf"
    archive_path = os.path.join(archive_dir, filename)
    shutil.copy2(task.result_path, archive_path)

    # Get PDF info
    pages = pdf_generator.get_pdf_page_count(archive_path)
    file_size = os.path.getsize(archive_path)

    # Get articles count from task
    # Note: In production, you'd track this in the GenerationTask
    articles_count = 0  # Placeholder

    # Create archive record
    archive = Archive(
        year=year,
        month=month,
        filename=filename,
        file_url=archive_path,
        pages=pages,
        articles_count=articles_count,
        file_size=file_size
    )

    db.add(archive)
    await db.commit()
    await db.refresh(archive)

    return archive


@router.get("/{archive_id}/view")
async def view_archive(
    archive_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    View archived journal PDF (redirect to file).
    """
    result = await db.execute(
        select(Archive).where(Archive.id == uuid.UUID(archive_id))
    )
    archive = result.scalar_one_or_none()

    if not archive:
        raise HTTPException(status_code=404, detail="Archive not found")

    if not os.path.exists(archive.file_url):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        archive.file_url,
        media_type="application/pdf"
    )


@router.get("/{archive_id}/download")
async def download_archive(
    archive_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Download archived journal PDF.
    """
    result = await db.execute(
        select(Archive).where(Archive.id == uuid.UUID(archive_id))
    )
    archive = result.scalar_one_or_none()

    if not archive:
        raise HTTPException(status_code=404, detail="Archive not found")

    if not os.path.exists(archive.file_url):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        archive.file_url,
        media_type="application/pdf",
        filename=archive.filename
    )


@router.delete("/{archive_id}")
async def delete_archive(
    archive_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete archived journal.
    """
    result = await db.execute(
        select(Archive).where(Archive.id == uuid.UUID(archive_id))
    )
    archive = result.scalar_one_or_none()

    if not archive:
        raise HTTPException(status_code=404, detail="Archive not found")

    # Remove file
    if os.path.exists(archive.file_url):
        os.remove(archive.file_url)

    await db.delete(archive)
    await db.commit()

    return {"success": True}
