from __future__ import annotations
from datetime import datetime, timezone

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from core.config import settings
from core.logging import get_logger
from schemas.sentiment import NewsItem

logger = get_logger(__name__)

_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(timeout=15.0)
    return _client


async def close_cryptopanic_client() -> None:
    global _client
    if _client and not _client.is_closed:
        await _client.aclose()
        _client = None


def _article_sentiment(positive: int, negative: int) -> float:
    total = positive + negative
    if total == 0:
        return 0.0
    return round((positive - negative) / total, 3)


def _parse_published_at(raw: str) -> datetime:
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except Exception:
        return datetime.now(tz=timezone.utc)


@retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=2, max=8))
async def fetch_news(currencies: str | None = None, limit: int = 20) -> list[NewsItem]:
    client = _get_client()
    params: dict[str, str | int] = {"kind": "news", "limit": limit}

    if settings.CRYPTOPANIC_API_KEY:
        params["auth_token"] = settings.CRYPTOPANIC_API_KEY
        params["filter"] = "important"

    if currencies:
        params["currencies"] = currencies.upper()

    try:
        resp = await client.get(settings.CRYPTOPANIC_API_URL, params=params)
        resp.raise_for_status()
        data = resp.json()
    except httpx.HTTPStatusError as exc:
        logger.warning("cryptopanic_http_error", status=exc.response.status_code, error=str(exc))
        return []
    except Exception as exc:
        logger.warning("cryptopanic_fetch_error", error=str(exc))
        return []

    items: list[NewsItem] = []
    for post in data.get("results", []):
        votes = post.get("votes", {})
        sentiment = _article_sentiment(
            votes.get("positive", 0),
            votes.get("negative", 0),
        )
        source_info = post.get("source", {})
        source = source_info.get("domain", "unknown") if isinstance(source_info, dict) else "unknown"
        currencies_list = [c.get("code", "") for c in post.get("currencies", []) if c.get("code")]

        items.append(
            NewsItem(
                title=post.get("title", ""),
                url=post.get("url", ""),
                published_at=_parse_published_at(post.get("published_at", "")),
                source=source,
                sentiment_score=sentiment,
                currencies=currencies_list,
            )
        )

    logger.info("news_fetched", count=len(items), currencies=currencies)
    return items
