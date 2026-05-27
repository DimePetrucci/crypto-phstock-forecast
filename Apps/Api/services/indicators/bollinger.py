from __future__ import annotations
import numpy as np
from schemas.market import BollingerResult


def calculate_bollinger(
    closes: np.ndarray,
    period: int = 20,
    std_dev: float = 2.0,
) -> BollingerResult:
    if len(closes) < period:
        raise ValueError(f"Bollinger Bands require at least {period} data points, got {len(closes)}")

    window = closes[-period:]
    middle = float(np.mean(window))
    std = float(np.std(window, ddof=1))
    upper = middle + std_dev * std
    lower = middle - std_dev * std
    bandwidth = (upper - lower) / middle if middle else 0.0
    last_close = float(closes[-1])
    percent_b = (last_close - lower) / (upper - lower) if (upper - lower) else 0.5

    return BollingerResult(
        upper=round(upper, 6),
        middle=round(middle, 6),
        lower=round(lower, 6),
        bandwidth=round(bandwidth, 6),
        percent_b=round(percent_b, 4),
    )
