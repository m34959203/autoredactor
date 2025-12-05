import httpx
import json
from docx import Document
from typing import Optional
from app.core.config import settings
from app.models.schemas import AIMetadata


class AIExtractorService:
    """AI service for extracting metadata from articles"""

    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.OPENROUTER_BASE_URL
        self.model = settings.AI_MODEL

    async def extract_text_from_docx(self, file_path: str, max_chars: int = 2000) -> str:
        """Extract text from beginning of DOCX file"""
        try:
            doc = Document(file_path)
            text = ""
            for para in doc.paragraphs:
                text += para.text + "\n"
                if len(text) >= max_chars:
                    break
            return text[:max_chars]
        except Exception as e:
            raise Exception(f"Failed to extract text from DOCX: {str(e)}")

    async def extract_metadata(self, file_path: str) -> AIMetadata:
        """
        AI extracts article title and author from DOCX file.
        Does NOT modify article content.
        """
        # Extract text from document
        article_text = await self.extract_text_from_docx(file_path)

        # Prepare AI prompt
        system_prompt = """Ты — AI-ассистент редактора журнала.
Твоя задача: извлекать метаданные из научных статей.

ВАЖНО:
- НЕ изменяй и НЕ редактируй текст статьи
- Только извлекай название и автора
- Определи язык автора (латиница или кириллица)"""

        user_prompt = f"""Извлеки из начала статьи:
1. Название статьи
2. ФИО автора (или авторов)
3. Определи язык автора (latin или cyrillic)

Текст начала статьи:
{article_text}

Ответь строго в формате JSON:
{{
  "title": "название статьи",
  "author": "Фамилия И.О.",
  "language": "latin" или "cyrillic",
  "confidence": число от 0.0 до 1.0
}}"""

        # Call OpenRouter API
        try:
            result = await self._call_ai(system_prompt, user_prompt)

            # Parse JSON response
            metadata = json.loads(result)

            return AIMetadata(
                title=metadata.get("title", "Без названия"),
                author=metadata.get("author", "Неизвестный автор"),
                language=metadata.get("language", "latin"),
                confidence=metadata.get("confidence", 0.5)
            )
        except Exception as e:
            # Fallback: simple extraction
            return await self._simple_extraction(article_text)

    async def _call_ai(self, system: str, user: str) -> str:
        """Call OpenRouter API"""
        if not self.api_key:
            raise Exception("OPENROUTER_API_KEY not configured")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/m34959203/autoredactor",
        }

        data = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ]
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=data
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]

    async def _simple_extraction(self, text: str) -> AIMetadata:
        """Fallback: simple rule-based extraction"""
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        title = lines[0] if len(lines) > 0 else "Без названия"
        author = lines[1] if len(lines) > 1 else "Неизвестный автор"

        # Detect language by first character of author name
        language = "cyrillic"
        if author and len(author) > 0:
            first_char = author[0].upper()
            if 'A' <= first_char <= 'Z':
                language = "latin"
            elif 'А' <= first_char <= 'Я':
                language = "cyrillic"

        return AIMetadata(
            title=title,
            author=author,
            language=language,
            confidence=0.3  # Low confidence for fallback
        )

    async def detect_language(self, author_name: str) -> str:
        """Determine if author name is latin or cyrillic"""
        if not author_name:
            return "latin"

        first_char = author_name.strip()[0].upper()

        if 'A' <= first_char <= 'Z':
            return "latin"
        elif 'А' <= first_char <= 'Я':
            return "cyrillic"
        else:
            # Use AI for ambiguous cases
            try:
                prompt = f'Определи, на каком алфавите написана фамилия: "{author_name}". Ответь одним словом: latin или cyrillic'
                result = await self._call_ai("", prompt)
                return "cyrillic" if "cyrillic" in result.lower() else "latin"
            except:
                return "latin"
