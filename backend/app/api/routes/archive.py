from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
import os
import shutil
from app.db.base import get_db
from app.models.database import Archive, GenerationTask
from app.models.schemas import ArchiveResponse, ArchiveCreate
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=List[ArchiveResponse])
async def get_archive_list(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get list of archived journals, optionally filtered by year/month"""
    query = select(Archive)

    if year is not None:
        query = query.where(Archive.year == year)
    if month is not None:
        query = query.where(Archive.month == month)

    query = query.order_by(Archive.year.desc(), Archive.month.desc())

    result = await db.execute(query)
    archives = result.scalars().all()
    return archives


@router.get("/years")
async def get_archive_years(db: AsyncSession = Depends(get_db)):
    """Get list of years that have archives"""
    result = await db.execute(
        select(Archive.year).distinct().order_by(Archive.year.desc())
    )
    years = result.scalars().all()
    return list(years)


@router.get("/{archive_id}", response_model=ArchiveResponse)
async def get_archive(
    archive_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get single archive entry"""
    result = await db.execute(
        select(Archive).where(Archive.id == archive_id)
    )
    archive = result.scalar_one_or_none()
    if not archive:
        raise HTTPException(404, "Archive not found")
    return archive


@router.get("/{archive_id}/view")
async def view_archive_pdf(
    archive_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """View PDF in browser"""
    result = await db.execute(
        select(Archive).where(Archive.id == archive_id)
    )
    archive = result.scalar_one_or_none()
    if not archive:
        raise HTTPException(404, "Archive not found")

    if not os.path.exists(archive.file_path):
        raise HTTPException(404, "PDF file not found")

    return FileResponse(
        archive.file_path,
        media_type="application/pdf",
        filename=archive.filename
    )


@router.get("/{archive_id}/download")
async def download_archive_pdf(
    archive_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Download PDF file"""
    result = await db.execute(
        select(Archive).where(Archive.id == archive_id)
    )
    archive = result.scalar_one_or_none()
    if not archive:
        raise HTTPException(404, "Archive not found")

    if not os.path.exists(archive.file_path):
        raise HTTPException(404, "PDF file not found")

    return FileResponse(
        archive.file_path,
        media_type="application/pdf",
        filename=archive.filename,
        headers={"Content-Disposition": f'attachment; filename="{archive.filename}"'}
    )


@router.post("/", response_model=ArchiveResponse)
async def save_to_archive(
    archive_data: ArchiveCreate,
    db: AsyncSession = Depends(get_db)
):
    """Save generated journal to archive"""
    # Check if archive for this year/month already exists
    result = await db.execute(
        select(Archive).where(
            Archive.year == archive_data.year,
            Archive.month == archive_data.month
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(400, f"Archive for {archive_data.year}/{archive_data.month} already exists")

    # Create archive directory
    archive_dir = os.path.join(settings.ARCHIVE_DIR, str(archive_data.year))
    os.makedirs(archive_dir, exist_ok=True)

    # Copy PDF to archive
    archive_filename = f"journal_{archive_data.year}_{archive_data.month:02d}.pdf"
    archive_path = os.path.join(archive_dir, archive_filename)

    shutil.copy2(archive_data.file_path, archive_path)

    # Create archive record
    archive = Archive(
        year=archive_data.year,
        month=archive_data.month,
        filename=archive_filename,
        file_path=archive_path,
        pages=archive_data.pages,
        articles_count=archive_data.articles_count,
        file_size=archive_data.file_size
    )
    db.add(archive)
    await db.commit()
    await db.refresh(archive)

    return archive


@router.delete("/{archive_id}")
async def delete_archive(
    archive_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete archive entry and PDF file"""
    result = await db.execute(
        select(Archive).where(Archive.id == archive_id)
    )
    archive = result.scalar_one_or_none()
    if not archive:
        raise HTTPException(404, "Archive not found")

    # Delete file
    if os.path.exists(archive.file_path):
        os.remove(archive.file_path)

    # Delete record
    await db.delete(archive)
    await db.commit()

    return {"success": True}
