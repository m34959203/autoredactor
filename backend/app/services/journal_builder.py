import os
import sys
from pathlib import Path
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.database import Article, Template, GenerationTask
from app.models.schemas import GenerationSettings

# Import original autoeditor
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))
from autoeditor import JournalEditor


class JournalBuilderService:
    """Service for building journal PDF from articles"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def build_journal(
        self,
        task_id: UUID,
        article_ids: List[UUID],
        settings: GenerationSettings,
        template_ids: dict
    ) -> str:
        """
        Build journal PDF from articles.
        Returns path to generated PDF.
        """
        # Update task status
        task = await self.get_task(task_id)
        task.status = "processing"
        task.progress = 0
        task.current_step = "Подготовка файлов..."
        await self.db.commit()

        try:
            # Get articles from database
            result = await self.db.execute(
                select(Article).where(Article.id.in_(article_ids))
            )
            articles = result.scalars().all()

            if not articles:
                raise Exception("No articles found")

            # Sort articles by author (latin first, then cyrillic)
            sorted_articles = await self._sort_articles(articles)

            # Update progress
            task.progress = 10
            task.current_step = "Сортировка статей..."
            await self.db.commit()

            # Prepare paths
            articles_paths = [article.file_path for article in sorted_articles]

            # Get template paths
            title_path = await self._get_template_path(template_ids.get("title_id"))
            intro_path = await self._get_template_path(template_ids.get("intro_id"))
            outro_path = await self._get_template_path(template_ids.get("outro_id"))

            # Update progress
            task.progress = 20
            task.current_step = "Конвертация статей..."
            await self.db.commit()

            # Create output directory
            output_dir = f"./uploads/output/{task_id}"
            os.makedirs(output_dir, exist_ok=True)

            # Build journal using JournalEditor
            editor = JournalEditor(
                articles_dir=None,  # We'll pass files directly
                output_dir=output_dir,
                title_page=title_path,
                first_pages=intro_path,
                end_pages=outro_path
            )

            # Override articles list
            editor.articles = articles_paths

            # Update progress callback
            def progress_callback(step: str, progress: int):
                task.current_step = step
                task.progress = 20 + int(progress * 0.7)  # 20-90%

            # Build journal
            output_path = os.path.join(output_dir, "journal.pdf")
            editor.build_journal(output_path)

            # Final update
            task.progress = 100
            task.current_step = "Готово!"
            task.status = "done"
            task.result_path = output_path
            await self.db.commit()

            return output_path

        except Exception as e:
            task.status = "error"
            task.error_message = str(e)
            await self.db.commit()
            raise

    async def _sort_articles(self, articles: List[Article]) -> List[Article]:
        """Sort articles: latin (A-Z) then cyrillic (А-Я)"""
        latin = [a for a in articles if a.language == "latin"]
        cyrillic = [a for a in articles if a.language == "cyrillic"]

        latin.sort(key=lambda a: a.author or "")
        cyrillic.sort(key=lambda a: a.author or "")

        sorted_articles = latin + cyrillic

        # Update sort_order in database
        for i, article in enumerate(sorted_articles):
            article.sort_order = i

        await self.db.commit()
        return sorted_articles

    async def _get_template_path(self, template_id: Optional[UUID]) -> Optional[str]:
        """Get template file path by ID"""
        if not template_id:
            return None

        result = await self.db.execute(
            select(Template).where(Template.id == template_id)
        )
        template = result.scalar_one_or_none()
        return template.file_path if template else None

    async def get_task(self, task_id: UUID) -> GenerationTask:
        """Get generation task by ID"""
        result = await self.db.execute(
            select(GenerationTask).where(GenerationTask.id == task_id)
        )
        task = result.scalar_one_or_none()
        if not task:
            raise Exception("Task not found")
        return task
