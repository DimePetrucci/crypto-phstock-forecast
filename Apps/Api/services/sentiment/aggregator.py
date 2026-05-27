from __future__ import annotations
from datetime import datetime, timezone

from core.logging import get_logger
from schemas.sentiment import FearGreedResult, NewsItem, SentimentSnapshot, SentimentSnapshotResponse
from services.cache.sentiment_cache import (
    cache_fear_greed,
    get_cached_fear_greed,
    cache_sentiment_snapshot,
    get_cached_sentiment_snapshot,
    cache_news,
    get_cached_news,
)
from services.sentiment.fear_greed import fetch_fear_greed
from services.sentiment.cryptopanic import fetch_news

logger = get_logger(__name__)


async def get_fear_greed(force_refresh: bool = False) -> FearGreedResult | None:
    if not force_refresh:
        cached = await get_cached_fear_greed()
        if cached:
            return cached
    try:
        result = await fetch_fear_greed()
        await cache_fear_greed(result)
        return result
    except Exception as exc:
        logger.error("fear_greed_aggregation_error", error=str(exc))
        return await get_cached_fear_greed()


async def get_news(symbol: str | None = None, force_refresh: bool = False) -> list[NewsItem]:
    cache_key = symbol or "global"
    if not force_refresh:
        cached_raw = await get_cached_news(cache_key)
        if cached_raw is not None:
            try:
                return [NewsItem.model_validate(item) for item in cached_raw]
            except Exception:
                pass
    try:
        items = await fetch_news(currencies=symbol)
        await cache_news(cache_key, [item.model_dump(mode="json") for item in items])
        return items
    except Exception as exc:
        logger.error("news_aggregation_error", symbol=symbol, error=str(exc))
        return []


def _mood_from_fear_greed(fg: FearGreedResult | None) -> str:
    if fg is None:
        return "Neutral"
    return fg.classification


def _compute_overall_news_sentiment(news: list[NewsItem]) -> float:
    if not news:
        return 0.0
    total = sum(item.sentiment_score for item in news)
    return round(total / len(news), 3)


async def get_sentiment_snapshot(symbol: str | None = None) -> SentimentSnapshot:
    fg = await get_fear_greed()
    news = await get_news(symbol=symbol)
    overall_sentiment = _compute_overall_news_sentiment(news)

    snapshot = SentimentSnapshot(
        fear_greed=fg,
        news=news,
        overall_news_sentiment=overall_sentiment,
        fetched_at=datetime.now(tz=timezone.utc),
    )
    return snapshot


def snapshot_to_response(snapshot: SentimentSnapshot) -> SentimentSnapshotResponse:
    return SentimentSnapshotResponse(
        fear_greed=snapshot.fear_greed,
        news_count=len(snapshot.news),
        overall_news_sentiment=snapshot.overall_news_sentiment,
        market_mood=_mood_from_fear_greed(snapshot.fear_greed),
        fetched_at=snapshot.fetched_at,
    )
