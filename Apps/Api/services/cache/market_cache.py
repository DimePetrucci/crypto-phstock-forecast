from __future__ import annotations
import orjson
from core.config import settings
from core.redis import cache_get, cache_set
from core.logging import get_logger
from schemas.market import MarketTick, OHLCVCandle, IndicatorSet

logger = get_logger(__name__)

_PRICE_PREFIX = "market:price:"
_OHLCV_PREFIX = "market:ohlcv:"
_INDICATORS_PREFIX = "market:indicators:"
_SEARCH_PREFIX = "market:search:"


async def cache_market_price(symbol: str, tick: MarketTick, ttl: int | None = None) -> None:
    key = f"{_PRICE_PREFIX}{symbol}"
    ttl = ttl or settings.MARKET_PRICE_CACHE_TTL
    await cache_set(key, tick.model_dump_json(), ttl)


async def get_cached_price(symbol: str) -> MarketTick | None:
    key = f"{_PRICE_PREFIX}{symbol}"
    raw = await cache_get(key)
    if raw is None:
        return None
    try:
        return MarketTick.model_validate_json(raw)
    except Exception as exc:
        logger.warning("cache_price_parse_error", symbol=symbol, error=str(exc))
        return None


async def cache_ohlcv(symbol: str, interval: str, candles: list[OHLCVCandle], ttl: int | None = None) -> None:
    key = f"{_OHLCV_PREFIX}{symbol}:{interval}"
    ttl = ttl or settings.MARKET_OHLCV_CACHE_TTL
    serialized = orjson.dumps([c.model_dump(mode="json") for c in candles]).decode()
    await cache_set(key, serialized, ttl)


async def get_cached_ohlcv(symbol: str, interval: str) -> list[OHLCVCandle] | None:
    key = f"{_OHLCV_PREFIX}{symbol}:{interval}"
    raw = await cache_get(key)
    if raw is None:
        return None
    try:
        data = orjson.loads(raw)
        return [OHLCVCandle.model_validate(item) for item in data]
    except Exception as exc:
        logger.warning("cache_ohlcv_parse_error", symbol=symbol, interval=interval, error=str(exc))
        return None


async def cache_indicators(symbol: str, interval: str, data: IndicatorSet, ttl: int | None = None) -> None:
    key = f"{_INDICATORS_PREFIX}{symbol}:{interval}"
    ttl = ttl or settings.MARKET_INDICATORS_CACHE_TTL
    await cache_set(key, data.model_dump_json(), ttl)


async def get_cached_indicators(symbol: str, interval: str) -> IndicatorSet | None:
    key = f"{_INDICATORS_PREFIX}{symbol}:{interval}"
    raw = await cache_get(key)
    if raw is None:
        return None
    try:
        return IndicatorSet.model_validate_json(raw)
    except Exception as exc:
        logger.warning("cache_indicators_parse_error", symbol=symbol, interval=interval, error=str(exc))
        return None


async def cache_search(query: str, results: list[dict], ttl: int | None = None) -> None:
    key = f"{_SEARCH_PREFIX}{query.lower()}"
    ttl = ttl or settings.COINGECKO_CACHE_TTL
    await cache_set(key, orjson.dumps(results).decode(), ttl)


async def get_cached_search(query: str) -> list[dict] | None:
    key = f"{_SEARCH_PREFIX}{query.lower()}"
    raw = await cache_get(key)
    if raw is None:
        return None
    try:
        return orjson.loads(raw)
    except Exception:
        return None
