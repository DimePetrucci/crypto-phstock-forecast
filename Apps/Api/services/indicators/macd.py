from __future__ import annotations
import numpy as np
from schemas.market import MACDResult


def _ema_series(values: np.ndarray, period: int) -> np.ndarray:
    k = 2.0 / (period + 1)
    result = np.empty(len(values))
    result[0] = values[0]
    for i in range(1, len(values)):
        result[i] = values[i] * k + result[i - 1] * (1 - k)
    return result


def calculate_macd(
    closes: np.ndarray,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
) -> MACDResult:
    if len(closes) < slow + signal:
        raise ValueError(f"MACD requires at least {slow + signal} data points, got {len(closes)}")

    ema_fast = _ema_series(closes, fast)
    ema_slow = _ema_series(closes, slow)
    macd_line = ema_fast - ema_slow
    signal_line = _ema_series(macd_line, signal)
    histogram = macd_line - signal_line

    macd_val = float(macd_line[-1])
    signal_val = float(signal_line[-1])
    hist_val = float(histogram[-1])

    if hist_val > 0 and macd_val > 0:
        trend = "bullish"
    elif hist_val < 0 and macd_val < 0:
        trend = "bearish"
    else:
        trend = "neutral"

    return MACDResult(
        macd_line=round(macd_val, 6),
        signal_line=round(signal_val, 6),
        histogram=round(hist_val, 6),
        trend=trend,
    )
