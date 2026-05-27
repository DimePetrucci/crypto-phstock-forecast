from __future__ import annotations
from typing import Annotated, Literal

from fastapi import APIRouter, Query, HTTPException

from core.config import settings
from core.logging import get_logger
from schemas.intelligence import IntelligenceReport, BestPicksResponse
from services.cache.market_cache import get_cached_price
from services.market.binance_rest import get_binance_rest
from services.market.normalizer import normalize_binance_24hr
from services.intelligence.report_builder import build_intelligence_report, build_best_picks

router = APIRouter()
logger = get_logger(__name__)

IntervalParam = Literal["4h", "1d", "1w"]


@router.get("/{symbol}", response_model=IntelligenceReport)
async def get_intelligence_report(
    symbol: str,
    interval: Annotated[IntervalParam, Query()] = "1d",
) -> IntelligenceReport:
    symbol = symbol.upper()

    tick = await get_cached_price(symbol)
    if tick is None:
        try:
            client = await get_binance_rest()
            raw = await client.get_ticker(symbol)
            tick = normalize_binance_24hr(raw)
        except Exception as exc:
            logger.error("intelligence_tick_fetch_error", symbol=symbol, error=str(exc))
            raise HTTPException(status_code=404, detail=f"Price data unavailable for {symbol}")

    report = await build_intelligence_report(symbol, tick, interval=interval)
    if report is None:
        raise HTTPException(status_code=503, detail=f"Intelligence report unavailable for {symbol}")
    return report


@router.get("", response_model=BestPicksResponse)
async def get_best_picks(
    interval: Annotated[IntervalParam, Query()] = "1d",
) -> BestPicksResponse:
    ticks: dict = {}
    for symbol in settings.TRACKED_CRYPTO_SYMBOLS:
        tick = await get_cached_price(symbol)
        if tick:
            ticks[symbol] = tick

    if not ticks:
        try:
            client = await get_binance_rest()
            raw_list = await client.get_all_tickers(settings.TRACKED_CRYPTO_SYMBOLS)
            for raw in raw_list:
                tick = normalize_binance_24hr(raw)
                ticks[tick.symbol] = tick
        except Exception as exc:
            logger.error("best_picks_fetch_error", error=str(exc))
            raise HTTPException(status_code=503, detail="Market data unavailable")

    return await build_best_picks(ticks, interval=interval)
