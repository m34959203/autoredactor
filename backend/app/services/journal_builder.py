import os
from typing import List, Dict, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models import Article, Template, GenerationTask
from app.services.pdf_generator import PDFGenerator
from app.models.journal import JournalSettings


class JournalBuilder:
    """Service for building complete journal PDF."""

    def __init__(self, pdf_generator: PDFGenerator):
        self.pdf_generator = pdf_generator

    async def build_journal(
        self,
        session: AsyncSession,
        task: GenerationTask,
        articles: List[Article],
        templates: Dict[str, Optional[Template]],
        settings: JournalSettings,
        output_path: str
    ) -> str:
        """
        Build complete journal PDF.

        Args:
            session: Database session
            task: Generation task for progress tracking
            articles: List of articles (already sorted)
            templates: Dict with 'title', 'intro', 'outro' templates
            settings: Journal settings
            output_path: Path for output PDF

        Returns:
            Path to generated PDF
        """
        temp_dir = os.path.dirname(output_path)
        pdf_parts = []
        current_page = 1
        toc_entries = []

        try:
            # 1. Title page
            await self._update_progress(session, task, 10, "Добавление титульного листа")
            if templates.get('title'):
                title_pdf = templates['title'].file_path
                pdf_parts.append(title_pdf)
                current_page += self.pdf_generator.get_pdf_page_count(title_pdf)

            # 2. Intro pages
            await self._update_progress(session, task, 20, "Добавление вступительных страниц")
            if templates.get('intro'):
                intro_pdf = templates['intro'].file_path
                pdf_parts.append(intro_pdf)
                current_page += self.pdf_generator.get_pdf_page_count(intro_pdf)

            # 3. Convert and add articles
            total_articles = len(articles)
            for index, article in enumerate(articles):
                progress = 20 + int((index / total_articles) * 50)
                await self._update_progress(
                    session,
                    task,
                    progress,
                    f"Конвертация статей ({index + 1}/{total_articles})"
                )

                # Add blank pages before article (indent)
                if settings.indent_lines > 0:
                    blank_pdf = os.path.join(temp_dir, f"blank_{article.id}.pdf")
                    self.pdf_generator.add_blank_pages(settings.indent_lines, blank_pdf)
                    pdf_parts.append(blank_pdf)
                    current_page += settings.indent_lines

                # Convert DOCX to PDF
                article_pdf = os.path.join(temp_dir, f"article_{article.id}.pdf")
                self.pdf_generator.docx_to_pdf(article.file_path, article_pdf)
                pdf_parts.append(article_pdf)

                # Track page for TOC
                article_pages = self.pdf_generator.get_pdf_page_count(article_pdf)
                toc_entries.append({
                    'title': article.title or 'Untitled',
                    'author': article.author or 'Unknown',
                    'page': current_page
                })
                current_page += article_pages

            # 4. Create TOC
            await self._update_progress(session, task, 75, "Формирование содержания")
            toc_pdf = os.path.join(temp_dir, "toc.pdf")
            self.pdf_generator.create_toc_pdf(toc_entries, toc_pdf)
            pdf_parts.append(toc_pdf)

            # 5. Outro pages
            await self._update_progress(session, task, 85, "Добавление заключительных страниц")
            if templates.get('outro'):
                outro_pdf = templates['outro'].file_path
                pdf_parts.append(outro_pdf)

            # 6. Merge all parts
            await self._update_progress(session, task, 90, "Объединение PDF")
            merged_pdf = os.path.join(temp_dir, f"merged_{task.id}.pdf")
            self.pdf_generator.merge_pdfs(pdf_parts, merged_pdf)

            # 7. Add page numbers
            await self._update_progress(session, task, 95, "Нумерация страниц")
            self.pdf_generator.add_page_numbers(merged_pdf, output_path)

            # 8. Cleanup temporary files
            await self._update_progress(session, task, 98, "Финализация")
            self._cleanup_temp_files(pdf_parts + [merged_pdf])

            await self._update_progress(session, task, 100, "Готово")
            return output_path

        except Exception as e:
            task.status = "error"
            task.error_message = str(e)
            await session.commit()
            raise

    async def _update_progress(
        self,
        session: AsyncSession,
        task: GenerationTask,
        progress: int,
        step: str
    ):
        """Update task progress."""
        task.progress = progress
        task.current_step = step
        task.status = "processing"
        await session.commit()

    def _cleanup_temp_files(self, file_paths: List[str]):
        """Remove temporary files."""
        for path in file_paths:
            try:
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass  # Ignore cleanup errors

    async def preview_structure(
        self,
        articles: List[Article],
        templates: Dict[str, Optional[Template]],
        settings: JournalSettings
    ) -> Dict:
        """
        Preview journal structure without generating.

        Returns:
            Dict with structure and total pages estimate
        """
        structure = []
        current_page = 1

        # Title
        if templates.get('title') and templates['title'].pages:
            structure.append({
                'type': 'title',
                'pages': templates['title'].pages
            })
            current_page += templates['title'].pages

        # Intro
        if templates.get('intro') and templates['intro'].pages:
            structure.append({
                'type': 'intro',
                'pages': templates['intro'].pages
            })
            current_page += templates['intro'].pages

        # Articles
        for article in articles:
            # Indent
            if settings.indent_lines > 0:
                current_page += settings.indent_lines

            # Estimate article pages (rough estimate: ~500 words per page)
            estimated_pages = 5  # Default estimate
            structure.append({
                'type': 'article',
                'title': article.title,
                'author': article.author,
                'page_start': current_page
            })
            current_page += estimated_pages

        # TOC (estimate 1-2 pages)
        toc_pages = 1 + (len(articles) // 30)  # 30 entries per page
        structure.append({
            'type': 'toc',
            'page_start': current_page
        })
        current_page += toc_pages

        # Outro
        if templates.get('outro') and templates['outro'].pages:
            structure.append({
                'type': 'outro',
                'pages': templates['outro'].pages
            })
            current_page += templates['outro'].pages

        return {
            'structure': structure,
            'total_pages': current_page - 1
        }
