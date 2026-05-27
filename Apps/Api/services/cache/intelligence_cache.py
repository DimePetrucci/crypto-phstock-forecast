from __future__ import annotations
from core.config import settings
from core.redis import cache_get, cache_set
from core.logging import get_logger
from schemas.intelligence import IntelligenceReport

logger = get_logger(__name__)

_REPORT_PREFIX = "intelligence:report:"
_MACD_PREV_PREFIX = "alerts:macd_prev:"


async def cache_intelligence_report(symbol: str, interval: str, report: IntelligenceReport, ttl: int | None = None) -> None:
    key = f"{_REPORT_PREFIX}{symbol.upper()}:{interval}"
    await cache_set(key, report.model_dump_json(), ttl or settings.INTELLIGENCE_CACHE_TTL)


async def get_cached_intelligence_report(symbol: str, interval: str) -> IntelligenceReport | None:
    key = f"{_REPORT_PREFIX}{symbol.upper()}:{interval}"
    raw = await cache_get(key)
    if raw is None:
        return None
    try:
        return IntelligenceReport.model_validate_json(raw)
    except Exception as exc:
        logger.warning("cache_intel_parse_error", symbol=symbol, interval=interval, error=str(exc))
        return None


async def cache_macd_prev_histogram(symbol: str, histogram: float, ttl: int = 90) -> None:
    key = f"{_MACD_PREV_PREFIX}{symbol.upper()}"
    from core.redis import cache_set as _set
    await _set(key, str(histogram), ttl)


async def get_cached_macd_prev_histogram(symbol: str) -> float | None:
    key = f"{_MACD_PREV_PREFIX}{symbol.upper()}"
    raw = await cache_get(key)
    if raw is None:
        return None
    try:
        return float(raw)
    except Exception:
        return None
