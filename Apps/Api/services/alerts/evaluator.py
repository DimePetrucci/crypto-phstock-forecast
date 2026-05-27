from __future__ import annotations
from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.logging import get_logger
from models.alert import Alert
from schemas.alert import AlertTriggeredEvent
from services.cache.market_cache import get_cached_price
from services.cache.market_cache import get_cached_indicators
from services.cache.intelligence_cache import get_cached_macd_prev_histogram, cache_macd_prev_histogram

logger = get_logger(__name__)


@dataclass
class EvaluationResult:
    alert: Alert
    triggered: bool
    trigger_value: Decimal
    message: str


async def evaluate_all_alerts(db: AsyncSession) -> list[EvaluationResult]:
    stmt = select(Alert).where(Alert.is_active == True)
    result = await db.execute(stmt)
    alerts: list[Alert] = list(result.scalars().all())

    if not alerts:
        return []

    # Group by symbol to minimise cache lookups
    symbols: set[str] = {a.symbol for a in alerts}
    price_cache: dict[str, Decimal] = {}
    rsi_cache: dict[str, float] = {}
    macd_cache: dict[str, tuple[float, float]] = {}  # symbol → (histogram, prev_histogram)
    pct_change_cache: dict[str, float] = {}

    for sym in symbols:
        tick = await get_cached_price(sym)
        if tick:
            price_cache[sym] = tick.price
            pct_change_cache[sym] = tick.change_pct_24h

        indicators = await get_cached_indicators(sym, "1d")
        if indicators:
            if indicators.rsi:
                rsi_cache[sym] = indicators.rsi.value
            if indicators.macd:
                histogram = indicators.macd.histogram
                prev = await get_cached_macd_prev_histogram(sym)
                macd_cache[sym] = (histogram, prev if prev is not None else histogram)
                await cache_macd_prev_histogram(sym, histogram)

    triggered: list[EvaluationResult] = []

    for alert in alerts:
        sym = alert.symbol
        threshold = alert.threshold
        alert_type = alert.alert_type

        try:
            result = _evaluate_single(alert_type, sym, threshold, price_cache, rsi_cache, macd_cache, pct_change_cache)
            if result:
                trigger_value, message = result
                triggered.append(EvaluationResult(
                    alert=alert,
                    triggered=True,
                    trigger_value=trigger_value,
                    message=message,
                ))
        except Exception as exc:
            logger.warning("alert_eval_error", alert_id=str(alert.id), error=str(exc))

    return triggered


def _evaluate_single(
    alert_type: str,
    symbol: str,
    threshold: Decimal,
    prices: dict[str, Decimal],
    rsi_values: dict[str, float],
    macd_values: dict[str, tuple[float, float]],
    pct_changes: dict[str, float],
) -> tuple[Decimal, str] | None:
    if alert_type == "PRICE_ABOVE":
        price = prices.get(symbol)
        if price and price > threshold:
            return price, f"{symbol} price ${float(price):,.2f} crossed above ${float(threshold):,.2f}."

    elif alert_type == "PRICE_BELOW":
        price = prices.get(symbol)
        if price and price < threshold:
            return price, f"{symbol} price ${float(price):,.2f} dropped below ${float(threshold):,.2f}."

    elif alert_type == "RSI_ABOVE":
        rsi = rsi_values.get(symbol)
        if rsi is not None and rsi > float(threshold):
            return Decimal(str(rsi)), f"{symbol} RSI {rsi:.1f} crossed above {float(threshold):.1f} — overbought zone."

    elif alert_type == "RSI_BELOW":
        rsi = rsi_values.get(symbol)
        if rsi is not None and rsi < float(threshold):
            return Decimal(str(rsi)), f"{symbol} RSI {rsi:.1f} dropped below {float(threshold):.1f} — oversold zone."

    elif alert_type == "MACD_CROSSOVER_BULLISH":
        macd = macd_values.get(symbol)
        if macd:
            histogram, prev_histogram = macd
            if histogram > 0 and prev_histogram <= 0:
                return Decimal(str(histogram)), f"{symbol} MACD bullish crossover detected — histogram turned positive."

    elif alert_type == "MACD_CROSSOVER_BEARISH":
        macd = macd_values.get(symbol)
        if macd:
            histogram, prev_histogram = macd
            if histogram < 0 and prev_histogram >= 0:
                return Decimal(str(histogram)), f"{symbol} MACD bearish crossover detected — histogram turned negative."

    elif alert_type == "PRICE_PCT_CHANGE_24H":
        pct = pct_changes.get(symbol)
        if pct is not None and abs(pct) >= abs(float(threshold)):
            direction = "up" if pct >= 0 else "down"
            return Decimal(str(pct)), f"{symbol} moved {pct:+.2f}% in 24h (threshold: {float(threshold):+.2f}%)."

    return None
