from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from typing import Literal, List
from pydantic import BaseModel, Field


class MarketTick(BaseModel):
    symbol: str
    price: Decimal
    change_24h: float
    change_pct_24h: float
    volume_24h: Decimal
    high_24h: Decimal
    low_24h: Decimal
    market_cap: Decimal | None = None
    timestamp: datetime
    source: Literal["binance", "coingecko"]


class OHLCVCandle(BaseModel):
    open_time: datetime
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: Decimal
    close_time: datetime
    quote_volume: Decimal | None = None
    num_trades: int | None = None


class RSIResult(BaseModel):
    value: float
    period: int
    signal: Literal["oversold", "neutral", "overbought"]


class MACDResult(BaseModel):
    macd_line: float
    signal_line: float
    histogram: float
    trend: Literal["bullish", "bearish", "neutral"]


class EMAResult(BaseModel):
    value: float
    period: int


class SMAResult(BaseModel):
    value: float
    period: int


class BollingerResult(BaseModel):
    upper: float
    middle: float
    lower: float
    bandwidth: float
    percent_b: float


class IndicatorSet(BaseModel):
    symbol: str
    interval: str
    rsi: RSIResult | None = None
    macd: MACDResult | None = None
    ema_20: EMAResult | None = None
    ema_50: EMAResult | None = None
    sma_200: SMAResult | None = None
    bollinger: BollingerResult | None = None
    computed_at: datetime = Field(default_factory=datetime.utcnow)


class MarketPricesResponse(BaseModel):
    items: List[MarketTick]
    count: int


class OHLCVResponse(BaseModel):
    symbol: str
    interval: str
    items: List[OHLCVCandle]
    count: int


class SearchResult(BaseModel):
    id: str
    symbol: str
    name: str
    market_cap_rank: int | None = None
    thumb: str | None = None
