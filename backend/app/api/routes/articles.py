from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid
import os

from app.db.database import get_db
from app.db.models import Article, Session as DBSession
from app.models.article import ArticleResponse, ArticleUpdate
from app.services.docx_parser import DocxParser
from app.services.sorter import ArticleSorter

router = APIRouter()
docx_parser = DocxParser()
sorter = ArticleSorter()


@router.get("/", response_model=List[ArticleResponse])
async def get_articles(
    session_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all articles for a session.
    """
    result = await db.execute(
        select(Article)
        .where(Article.session_id == uuid.UUID(session_id))
        .order_by(Article.sort_order.nullsfirst(), Article.created_at)
    )
    articles = result.scalars().all()
    return articles


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get single article by ID.
    """
    result = await db.execute(
        select(Article).where(Article.id == uuid.UUID(article_id))
    )
    article = result.scalar_one_or_none()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    return article


@router.patch("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    update_data: ArticleUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update article metadata (title, author).
    """
    result = await db.execute(
        select(Article).where(Article.id == uuid.UUID(article_id))
    )
    article = result.scalar_one_or_none()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Update fields
    if update_data.title is not None:
        article.title = update_data.title
    if update_data.author is not None:
        article.author = update_data.author

    await db.commit()
    await db.refresh(article)

    return article


@router.delete("/{article_id}")
async def delete_article(
    article_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete article.
    """
    result = await db.execute(
        select(Article).where(Article.id == uuid.UUID(article_id))
    )
    article = result.scalar_one_or_none()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Remove file
    if os.path.exists(article.file_path):
        os.remove(article.file_path)

    await db.delete(article)
    await db.commit()

    return {"success": True}


@router.get("/{article_id}/preview")
async def preview_article(
    article_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Preview article content.
    """
    result = await db.execute(
        select(Article).where(Article.id == uuid.UUID(article_id))
    )
    article = result.scalar_one_or_none()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    try:
        # Extract preview text (first 500 words)
        text = docx_parser.extract_text(article.file_path, max_chars=3000)
        words = text.split()[:500]
        preview_text = ' '.join(words)

        # Estimate pages (rough: 500 words per page)
        full_text = docx_parser.get_full_text(article.file_path)
        word_count = len(full_text.split())
        pages_estimate = max(1, word_count // 500)

        return {
            "text": preview_text,
            "pages_estimate": pages_estimate
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading article: {str(e)}")


@router.post("/sort")
async def sort_articles(
    session_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Sort articles by author (Latin A-Z, then Cyrillic А-Я).
    """
    result = await db.execute(
        select(Article).where(Article.session_id == uuid.UUID(session_id))
    )
    articles = result.scalars().all()

    if not articles:
        return []

    # Sort articles
    sorted_articles = sorter.sort_articles(list(articles))

    # Update sort order in database
    await db.commit()

    return [
        {
            "id": str(article.id),
            "author": article.author,
            "order": article.sort_order
        }
        for article in sorted_articles
    ]
