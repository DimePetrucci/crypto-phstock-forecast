from __future__ import annotations
import numpy as np
from schemas.market import RSIResult


def calculate_rsi(closes: np.ndarray, period: int = 14) -> RSIResult:
    if len(closes) < period + 1:
        raise ValueError(f"RSI requires at least {period + 1} data points, got {len(closes)}")

    deltas = np.diff(closes)
    gains = np.where(deltas > 0, deltas, 0.0)
    losses = np.where(deltas < 0, -deltas, 0.0)

    # Wilder's smoothing: initial average then exponential moving average
    avg_gain = np.mean(gains[:period])
    avg_loss = np.mean(losses[:period])

    for i in range(period, len(gains)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

    if avg_loss == 0:
        rsi_value = 100.0
    else:
        rs = avg_gain / avg_loss
        rsi_value = 100.0 - (100.0 / (1.0 + rs))

    if rsi_value <= 30:
        signal = "oversold"
    elif rsi_value >= 70:
        signal = "overbought"
    else:
        signal = "neutral"

    return RSIResult(value=round(rsi_value, 2), period=period, signal=signal)
