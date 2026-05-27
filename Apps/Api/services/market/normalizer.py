from __future__ import annotations
from datetime import datetime, timezone
from decimal import Decimal
from schemas.market import MarketTick, OHLCVCandle


def normalize_binance_24hr(raw: dict) -> MarketTick:
    return MarketTick(
        symbol=raw["symbol"],
        price=Decimal(raw["lastPrice"]),
        change_24h=float(raw["priceChange"]),
        change_pct_24h=float(raw["priceChangePercent"]),
        volume_24h=Decimal(raw["quoteVolume"]),
        high_24h=Decimal(raw["highPrice"]),
        low_24h=Decimal(raw["lowPrice"]),
        timestamp=datetime.now(timezone.utc),
        source="binance",
    )


def normalize_binance_kline(raw: list) -> OHLCVCandle:
    return OHLCVCandle(
        open_time=datetime.fromtimestamp(raw[0] / 1000, tz=timezone.utc),
        open=Decimal(raw[1]),
        high=Decimal(raw[2]),
        low=Decimal(raw[3]),
        close=Decimal(raw[4]),
        volume=Decimal(raw[5]),
        close_time=datetime.fromtimestamp(raw[6] / 1000, tz=timezone.utc),
        quote_volume=Decimal(raw[7]),
        num_trades=int(raw[8]),
    )


def normalize_coingecko_price(symbol: str, coin_id: str, raw: dict) -> MarketTick:
    data = raw.get(coin_id, {})
    price = Decimal(str(data.get("usd", 0)))
    change_pct = float(data.get("usd_24h_change", 0.0) or 0.0)
    change_abs = float(price) * change_pct / 100
    return MarketTick(
        symbol=symbol,
        price=price,
        change_24h=change_abs,
        change_pct_24h=change_pct,
        volume_24h=Decimal(str(data.get("usd_24h_vol", 0) or 0)),
        high_24h=Decimal("0"),
        low_24h=Decimal("0"),
        market_cap=Decimal(str(data.get("usd_market_cap", 0) or 0)),
        timestamp=datetime.now(timezone.utc),
        source="coingecko",
    )
