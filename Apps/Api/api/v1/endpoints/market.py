from __future__ import annotations
from typing import Annotated, Literal

import numpy as np
from fastapi import APIRouter, Query, HTTPException

from core.config import settings
from core.logging import get_logger
from schemas.market import (
    MarketTick,
    MarketPricesResponse,
    OHLCVResponse,
    IndicatorSet,
    SearchResult,
)
from services.market.binance_rest import get_binance_rest
from services.market.coingecko import get_coingecko
from services.market.normalizer import (
    normalize_binance_24hr,
    normalize_binance_kline,
)
from services.cache.market_cache import (
    get_cached_price,
    cache_market_price,
    get_cached_ohlcv,
    cache_ohlcv,
    get_cached_indicators,
    cache_indicators,
    get_cached_search,
    cache_search,
)
from services.indicators.rsi import calculate_rsi
from services.indicators.macd import calculate_macd
from services.indicators.ema_sma import calculate_ema, calculate_sma
from services.indicators.bollinger import calculate_bollinger

router = APIRouter()
logger = get_logger(__name__)

# Map frontend-friendly interval names to Binance interval strings
_INTERVAL_MAP: dict[str, str] = {
    "4h": "4h",
    "1d": "1d",
    "1w": "1w",
    "1m": "1M",
    "1y": "1M",  # fetch monthly, limit 12
}

IntervalParam = Literal["4h", "1d", "1w", "1m", "1y"]


@router.get("/prices", response_model=MarketPricesResponse)
async def get_prices(
    symbols: Annotated[str | None, Query(description="Comma-separated symbols, e.g. BTCUSDT,ETHUSDT")] = None,
) -> MarketPricesResponse:
    target_symbols = (
        [s.strip().upper() for s in symbols.split(",")]
        if symbols
        else settings.TRACKED_CRYPTO_SYMBOLS
    )

    ticks: list[MarketTick] = []

    # Try cache first for all symbols
    uncached: list[str] = []
    for sym in target_symbols:
        cached = await get_cached_price(sym)
        if cached:
            ticks.append(cached)
        else:
            uncached.append(sym)

    # Fetch uncached from Binance
    if uncached:
        try:
            client = await get_binance_rest()
            raw_list = await client.get_all_tickers(uncached)
            fetched_set = {r["symbol"] for r in raw_list}
            for raw in raw_list:
                tick = normalize_binance_24hr(raw)
                ticks.append(tick)
                await cache_market_price(tick.symbol, tick)
        except Exception as exc:
            logger.error("market_prices_fetch_error", error=str(exc))

    ticks.sort(key=lambda t: t.symbol)
    return MarketPricesResponse(items=ticks, count=len(ticks))


@router.get("/ticker/{symbol}", response_model=MarketTick)
async def get_ticker(symbol: str) -> MarketTick:
    symbol = symbol.upper()

    cached = await get_cached_price(symbol)
    if cached:
        return cached

    try:
        client = await get_binance_rest()
        raw = await client.get_ticker(symbol)
        tick = normalize_binance_24hr(raw)
        await cache_market_price(symbol, tick)
        return tick
    except Exception as exc:
        logger.error("ticker_fetch_error", symbol=symbol, error=str(exc))
        raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found or unavailable")


@router.get("/ohlcv/{symbol}", response_model=OHLCVResponse)
async def get_ohlcv(
    symbol: str,
    interval: Annotated[IntervalParam, Query()] = "1d",
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
) -> OHLCVResponse:
    symbol = symbol.upper()
    binance_interval = _INTERVAL_MAP.get(interval, "1d")
    actual_limit = 12 if interval == "1y" else limit

    cached = await get_cached_ohlcv(symbol, interval)
    if cached:
        return OHLCVResponse(symbol=symbol, interval=interval, items=cached, count=len(cached))

    try:
        client = await get_binance_rest()
        raw_klines = await client.get_klines(symbol, binance_interval, actual_limit)
        candles = [normalize_binance_kline(k) for k in raw_klines]
        await cache_ohlcv(symbol, interval, candles)
        return OHLCVResponse(symbol=symbol, interval=interval, items=candles, count=len(candles))
    except Exception as exc:
        logger.error("ohlcv_fetch_error", symbol=symbol, interval=interval, error=str(exc))
        raise HTTPException(status_code=404, detail=f"OHLCV data unavailable for {symbol}")


@router.get("/indicators/{symbol}", response_model=IndicatorSet)
async def get_indicators(
    symbol: str,
    interval: Annotated[IntervalParam, Query()] = "1d",
) -> IndicatorSet:
    symbol = symbol.upper()

    cached = await get_cached_indicators(symbol, interval)
    if cached:
        return cached

    # Fetch OHLCV (need enough data for SMA-200)
    binance_interval = _INTERVAL_MAP.get(interval, "1d")
    limit = 250 if interval in ("1d", "1w") else 200

    try:
        client = await get_binance_rest()
        raw_klines = await client.get_klines(symbol, binance_interval, limit)
    except Exception as exc:
        logger.error("indicators_ohlcv_error", symbol=symbol, error=str(exc))
        raise HTTPException(status_code=404, detail=f"Market data unavailable for {symbol}")

    if len(raw_klines) < 26:
        raise HTTPException(status_code=422, detail=f"Insufficient data to compute indicators for {symbol}")

    closes = np.array([float(k[4]) for k in raw_klines])

    result = IndicatorSet(symbol=symbol, interval=interval)

    # RSI (requires 15+ points)
    if len(closes) >= 15:
        try:
            result.rsi = calculate_rsi(closes)
        except Exception as exc:
            logger.warning("rsi_calc_error", symbol=symbol, error=str(exc))

    # MACD (requires 35+ points)
    if len(closes) >= 35:
        try:
            result.macd = calculate_macd(closes)
        except Exception as exc:
            logger.warning("macd_calc_error", symbol=symbol, error=str(exc))

    # EMA-20
    if len(closes) >= 20:
        try:
            result.ema_20 = calculate_ema(closes, 20)
        except Exception as exc:
            logger.warning("ema20_calc_error", symbol=symbol, error=str(exc))

    # EMA-50
    if len(closes) >= 50:
        try:
            result.ema_50 = calculate_ema(closes, 50)
        except Exception as exc:
            logger.warning("ema50_calc_error", symbol=symbol, error=str(exc))

    # SMA-200
    if len(closes) >= 200:
        try:
            result.sma_200 = calculate_sma(closes, 200)
        except Exception as exc:
            logger.warning("sma200_calc_error", symbol=symbol, error=str(exc))

    # Bollinger Bands (requires 20+ points)
    if len(closes) >= 20:
        try:
            result.bollinger = calculate_bollinger(closes)
        except Exception as exc:
            logger.warning("bb_calc_error", symbol=symbol, error=str(exc))

    await cache_indicators(symbol, interval, result)
    return result


@router.get("/search", response_model=list[SearchResult])
async def search_assets(
    q: Annotated[str, Query(min_length=2, description="Search query")],
) -> list[SearchResult]:
    cached = await get_cached_search(q)
    if cached is not None:
        return [SearchResult(**item) for item in cached]

    try:
        cg = await get_coingecko()
        raw_coins = await cg.search_coins(q)
        results = [
            SearchResult(
                id=c.get("id", ""),
                symbol=c.get("symbol", "").upper(),
                name=c.get("name", ""),
                market_cap_rank=c.get("market_cap_rank"),
                thumb=c.get("thumb"),
            )
            for c in raw_coins[:20]
        ]
        await cache_search(q, [r.model_dump() for r in results])
        return results
    except Exception as exc:
        logger.error("search_error", query=q, error=str(exc))
        raise HTTPException(status_code=503, detail="Search service temporarily unavailable")
