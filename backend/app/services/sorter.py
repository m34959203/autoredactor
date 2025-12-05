from typing import List
from app.db.models import Article


class ArticleSorter:
    """Service for sorting articles by author name."""

    @staticmethod
    def sort_articles(articles: List[Article]) -> List[Article]:
        """
        Sort articles by author name: Latin (A-Z) first, then Cyrillic (А-Я).

        Args:
            articles: List of Article objects

        Returns:
            Sorted list of articles
        """
        # Separate by language
        latin_articles = [a for a in articles if a.language == "latin"]
        cyrillic_articles = [a for a in articles if a.language == "cyrillic"]

        # Sort each group by author name
        latin_articles.sort(key=lambda a: (a.author or "").lower())
        cyrillic_articles.sort(key=lambda a: (a.author or ""))

        # Combine: latin first, then cyrillic
        sorted_articles = latin_articles + cyrillic_articles

        # Update sort_order
        for index, article in enumerate(sorted_articles):
            article.sort_order = index

        return sorted_articles

    @staticmethod
    def get_sort_key(author_name: str, language: str) -> tuple:
        """
        Get sort key for an author.

        Args:
            author_name: Author's name
            language: 'latin' or 'cyrillic'

        Returns:
            Tuple for sorting (language_priority, author_name)
        """
        language_priority = 0 if language == "latin" else 1
        return (language_priority, (author_name or "").lower())
