from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from uuid import UUID
from app.db.base import get_db
from app.models.database import Article
from app.models.schemas import ArticleResponse, ArticleUpdate
from app.services.ai_extractor import AIExtractorService

router = APIRouter()


@router.get("/", response_model=List[ArticleResponse])
async def get_articles(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get all articles for a session, sorted by sort_order"""
    result = await db.execute(
        select(Article)
        .where(Article.session_id == UUID(session_id))
        .order_by(Article.sort_order.asc())
    )
    articles = result.scalars().all()
    return articles


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get single article by ID"""
    result = await db.execute(
        select(Article).where(Article.id == article_id)
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(404, "Article not found")
    return article


@router.patch("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: UUID,
    update_data: ArticleUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update article metadata (manual editing)"""
    result = await db.execute(
        select(Article).where(Article.id == article_id)
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(404, "Article not found")

    # Update fields
    if update_data.title is not None:
        article.title = update_data.title
    if update_data.author is not None:
        article.author = update_data.author
        # Re-detect language based on new author
        ai_service = AIExtractorService()
        article.language = await ai_service.detect_language(update_data.author)

    await db.commit()
    await db.refresh(article)
    return article


@router.delete("/{article_id}")
async def delete_article(
    article_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete article"""
    result = await db.execute(
        delete(Article).where(Article.id == article_id)
    )
    if result.rowcount == 0:
        raise HTTPException(404, "Article not found")

    await db.commit()
    return {"success": True}


@router.get("/{article_id}/preview")
async def preview_article(
    article_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get preview of article content (first 500 words)"""
    result = await db.execute(
        select(Article).where(Article.id == article_id)
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(404, "Article not found")

    # Extract text preview
    ai_service = AIExtractorService()
    try:
        text = await ai_service.extract_text_from_docx(article.file_path, max_chars=3000)
        words = text.split()[:500]
        preview_text = " ".join(words)
        return {
            "text": preview_text,
            "pages_estimate": len(words) // 250  # Rough estimate
        }
    except Exception as e:
        raise HTTPException(500, f"Failed to extract preview: {str(e)}")


@router.post("/sort", response_model=List[ArticleResponse])
async def sort_articles(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Apply automatic sorting (latin A-Z, then cyrillic А-Я)"""
    result = await db.execute(
        select(Article).where(Article.session_id == UUID(session_id))
    )
    articles = result.scalars().all()

    # Sort: latin first, then cyrillic
    latin = [a for a in articles if a.language == "latin"]
    cyrillic = [a for a in articles if a.language == "cyrillic"]

    latin.sort(key=lambda a: a.author or "")
    cyrillic.sort(key=lambda a: a.author or "")

    sorted_articles = latin + cyrillic

    # Update sort_order
    for i, article in enumerate(sorted_articles):
        article.sort_order = i

    await db.commit()

    return sorted_articles
