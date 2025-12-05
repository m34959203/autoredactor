import httpx
import json
from typing import Dict, Optional
from app.core.config import settings
from app.models.article import ArticleMetadata


class AIExtractor:
    """Service for extracting metadata from articles using AI."""

    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.model = settings.AI_MODEL
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"

    async def extract_metadata(self, article_text: str) -> ArticleMetadata:
        """
        Extract title, author, and language from article text using AI.

        Args:
            article_text: Text from the beginning of the article

        Returns:
            ArticleMetadata with extracted information
        """
        system_prompt = """Ты — AI-ассистент редактора журнала.
Извлекай метаданные из научных статей.
НЕ изменяй и НЕ редактируй текст статьи.
Отвечай строго в формате JSON."""

        user_prompt = f"""Извлеки из начала статьи:
1. Название статьи
2. ФИО автора (или авторов)
3. Определи, на каком алфавите написана фамилия автора: latin (латиница A-Z) или cyrillic (кириллица А-Я)

Текст начала статьи:
{article_text[:2000]}

Ответь строго JSON:
{{
  "title": "название статьи",
  "author": "Фамилия И.О.",
  "language": "latin" или "cyrillic",
  "confidence": 0.0-1.0
}}"""

        try:
            result = await self._request(user_prompt, system_prompt)
            data = json.loads(result)

            return ArticleMetadata(
                title=data.get("title", "Untitled"),
                author=data.get("author", "Unknown Author"),
                language=data.get("language", "latin"),
                confidence=data.get("confidence", 0.5)
            )
        except Exception as e:
            # Fallback to simple extraction
            return self._fallback_extraction(article_text)

    async def detect_language(self, author_name: str) -> str:
        """
        Detect language (latin/cyrillic) from author name.

        Args:
            author_name: Author's name

        Returns:
            'latin' or 'cyrillic'
        """
        if not author_name:
            return "latin"

        first_char = author_name.strip()[0].upper()

        # Simple check for first character
        if 'A' <= first_char <= 'Z':
            return "latin"
        elif 'А' <= first_char <= 'Я':
            return "cyrillic"

        # If uncertain, use AI
        try:
            prompt = f"""Определи, на каком алфавите написана фамилия: "{author_name}"
Ответь одним словом: latin или cyrillic"""

            result = await self._request(prompt, "Ты определяешь алфавит текста.")
            return "cyrillic" if "cyrillic" in result.lower() else "latin"
        except Exception:
            return "latin"

    async def _request(self, prompt: str, system: str = "") -> str:
        """
        Make request to OpenRouter API.

        Args:
            prompt: User prompt
            system: System prompt

        Returns:
            AI response text
        """
        if not self.api_key:
            raise Exception("OPENROUTER_API_KEY not configured")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        data = {
            "model": self.model,
            "messages": messages,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                self.base_url,
                headers=headers,
                json=data
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]

    def _fallback_extraction(self, article_text: str) -> ArticleMetadata:
        """
        Fallback extraction without AI.

        Args:
            article_text: Article text

        Returns:
            ArticleMetadata with basic extraction
        """
        lines = [line.strip() for line in article_text.split('\n') if line.strip()]

        title = lines[0] if lines else "Untitled"
        author = lines[1] if len(lines) > 1 else "Unknown Author"

        # Detect language from first character
        language = "latin"
        if author:
            first_char = author[0]
            if 'А' <= first_char <= 'Я':
                language = "cyrillic"

        return ArticleMetadata(
            title=title,
            author=author,
            language=language,
            confidence=0.3
        )
