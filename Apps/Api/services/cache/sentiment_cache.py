from __future__ import annotations
import orjson
from core.config import settings
from core.redis import cache_get, cache_set
from core.logging import get_logger
from schemas.sentiment import FearGreedResult, SentimentSnapshot

logger = get_logger(__name__)

_FG_KEY = "sentiment:fear_greed"
_NEWS_PREFIX = "sentiment:news:"
_SNAPSHOT_PREFIX = "sentiment:snapshot:"


async def cache_fear_greed(result: FearGreedResult, ttl: int | None = None) -> None:
    await cache_set(_FG_KEY, result.model_dump_json(), ttl or settings.FEAR_GREED_CACHE_TTL)


async def get_cached_fear_greed() -> FearGreedResult | None:
    raw = await cache_get(_FG_KEY)
    if raw is None:
        return None
    try:
        return FearGreedResult.model_validate_json(raw)
    except Exception as exc:
        logger.warning("cache_fg_parse_error", error=str(exc))
        return None


async def cache_sentiment_snapshot(symbol: str, snapshot: SentimentSnapshot, ttl: int | None = None) -> None:
    key = f"{_SNAPSHOT_PREFIX}{symbol.upper()}"
    await cache_set(key, snapshot.model_dump_json(), ttl or settings.SENTIMENT_NEWS_CACHE_TTL)


async def get_cached_sentiment_snapshot(symbol: str) -> SentimentSnapshot | None:
    key = f"{_SNAPSHOT_PREFIX}{symbol.upper()}"
    raw = await cache_get(key)
    if raw is None:
        return None
    try:
        return SentimentSnapshot.model_validate_json(raw)
    except Exception as exc:
        logger.warning("cache_snapshot_parse_error", symbol=symbol, error=str(exc))
        return None


async def cache_news(query: str, items: list[dict], ttl: int | None = None) -> None:
    key = f"{_NEWS_PREFIX}{query.lower()}"
    await cache_set(key, orjson.dumps(items).decode(), ttl or settings.SENTIMENT_NEWS_CACHE_TTL)


async def get_cached_news(query: str) -> list[dict] | None:
    key = f"{_NEWS_PREFIX}{query.lower()}"
    raw = await cache_get(key)
    if raw is None:
        return None
    try:
        return orjson.loads(raw)
    except Exception:
        return None
