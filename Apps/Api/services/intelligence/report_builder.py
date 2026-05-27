from __future__ import annotations
import numpy as np

from core.logging import get_logger
from schemas.intelligence import IntelligenceReport, BestPick, BestPicksResponse
from schemas.market import IndicatorSet, MarketTick
from services.cache.intelligence_cache import cache_intelligence_report, get_cached_intelligence_report
from services.cache.market_cache import get_cached_indicators, cache_indicators
from services.cache.sentiment_cache import get_cached_fear_greed
from services.intelligence.scorer import compute_intelligence_report
from services.market.binance_rest import get_binance_rest
from services.market.normalizer import normalize_binance_kline
from services.indicators.rsi import calculate_rsi
from services.indicators.macd import calculate_macd
from services.indicators.ema_sma import calculate_ema, calculate_sma
from services.indicators.bollinger import calculate_bollinger
from datetime import datetime, timezone

logger = get_logger(__name__)


async def _get_or_fetch_indicators(symbol: str, interval: str = "1d") -> IndicatorSet | None:
    cached = await get_cached_indicators(symbol, interval)
    if cached:
        return cached
    try:
        client = await get_binance_rest()
        limit = 250 if interval in ("1d", "1w") else 200
        _INTERVAL_MAP = {"4h": "4h", "1d": "1d", "1w": "1w", "1m": "1M", "1y": "1M"}
        binance_interval = _INTERVAL_MAP.get(interval, "1d")
        raw_klines = await client.get_klines(symbol, binance_interval, limit)
        closes = np.array([float(k[4]) for k in raw_klines])
        result = IndicatorSet(symbol=symbol, interval=interval)
        if len(closes) >= 15:
            result.rsi = calculate_rsi(closes)
        if len(closes) >= 35:
            result.macd = calculate_macd(closes)
        if len(closes) >= 20:
            result.ema_20 = calculate_ema(closes, 20)
            result.bollinger = calculate_bollinger(closes)
        if len(closes) >= 50:
            result.ema_50 = calculate_ema(closes, 50)
        if len(closes) >= 200:
            result.sma_200 = calculate_sma(closes, 200)
        await cache_indicators(symbol, interval, result)
        return result
    except Exception as exc:
        logger.error("report_builder_fetch_indicators_error", symbol=symbol, error=str(exc))
        return None


async def build_intelligence_report(
    symbol: str,
    tick: MarketTick,
    interval: str = "1d",
    force_refresh: bool = False,
) -> IntelligenceReport | None:
    if not force_refresh:
        cached = await get_cached_intelligence_report(symbol, interval)
        if cached:
            return cached

    indicators = await _get_or_fetch_indicators(symbol, interval)
    if indicators is None:
        return None

    fg = await get_cached_fear_greed()
    fear_greed_value = fg.value if fg else None

    try:
        report = compute_intelligence_report(symbol, interval, indicators, tick, fear_greed_value)
        await cache_intelligence_report(symbol, interval, report)
        logger.info("intelligence_report_built", symbol=symbol, score=report.composite_score, rec=report.recommendation)
        return report
    except Exception as exc:
        logger.error("intelligence_report_build_error", symbol=symbol, error=str(exc))
        return None


async def build_best_picks(ticks: dict[str, MarketTick], interval: str = "1d") -> BestPicksResponse:
    reports: list[IntelligenceReport] = []
    for symbol, tick in ticks.items():
        report = await build_intelligence_report(symbol, tick, interval)
        if report:
            reports.append(report)

    reports.sort(key=lambda r: r.composite_score, reverse=True)

    picks = [
        BestPick(
            symbol=r.symbol,
            composite_score=r.composite_score,
            recommendation=r.recommendation,
            confidence=r.confidence,
            risk_level=r.risk_level,
            summary=r.summary,
            generated_at=r.generated_at,
        )
        for r in reports
    ]

    return BestPicksResponse(
        items=picks,
        count=len(picks),
        generated_at=datetime.now(tz=timezone.utc),
    )
