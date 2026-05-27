from __future__ import annotations
import numpy as np
from schemas.market import EMAResult, SMAResult


def calculate_ema(closes: np.ndarray, period: int) -> EMAResult:
    if len(closes) < period:
        raise ValueError(f"EMA({period}) requires at least {period} data points, got {len(closes)}")
    k = 2.0 / (period + 1)
    ema = float(closes[0])
    for price in closes[1:]:
        ema = float(price) * k + ema * (1 - k)
    return EMAResult(value=round(ema, 6), period=period)


def calculate_sma(closes: np.ndarray, period: int) -> SMAResult:
    if len(closes) < period:
        raise ValueError(f"SMA({period}) requires at least {period} data points, got {len(closes)}")
    sma = float(np.mean(closes[-period:]))
    return SMAResult(value=round(sma, 6), period=period)
