from __future__ import annotations
from schemas.intelligence import SignalFactor
from schemas.market import IndicatorSet, MarketTick


def rule_rsi(indicators: IndicatorSet) -> SignalFactor | None:
    if indicators.rsi is None:
        return None
    v = indicators.rsi.value
    if v <= 30:
        score, reason = 25, f"RSI at {v:.1f} — deeply oversold, potential reversal zone."
    elif v <= 45:
        score, reason = 18, f"RSI at {v:.1f} — approaching oversold territory, mild bullish lean."
    elif v <= 55:
        score, reason = 12, f"RSI at {v:.1f} — neutral momentum range."
    elif v <= 70:
        score, reason = 6, f"RSI at {v:.1f} — elevated momentum, watch for overbought conditions."
    else:
        score, reason = 0, f"RSI at {v:.1f} — overbought territory, elevated reversal risk."
    return SignalFactor(name="RSI", score=score, max_score=25, reason=reason)


def rule_macd(indicators: IndicatorSet) -> SignalFactor | None:
    if indicators.macd is None:
        return None
    m = indicators.macd
    if m.trend == "bullish" and m.histogram > 0:
        score = 20
        reason = f"MACD bullish — histogram at {m.histogram:.4f}, momentum expanding upward."
    elif m.trend == "bullish":
        score = 14
        reason = f"MACD line above signal but histogram contracting ({m.histogram:.4f}), weakening bullish momentum."
    elif m.trend == "neutral":
        score = 10
        reason = "MACD near zero — no clear directional bias."
    elif m.histogram < 0 and m.trend == "bearish":
        score = 0
        reason = f"MACD bearish — histogram at {m.histogram:.4f}, downside momentum dominant."
    else:
        score = 6
        reason = "MACD bearish divergence forming, caution warranted."
    return SignalFactor(name="MACD", score=score, max_score=20, reason=reason)


def rule_ema_20(indicators: IndicatorSet, tick: MarketTick) -> SignalFactor | None:
    if indicators.ema_20 is None:
        return None
    price = float(tick.price)
    ema = indicators.ema_20.value
    if price > ema:
        score = 15
        reason = f"Price (${price:,.2f}) trading above EMA-20 (${ema:,.2f}) — short-term trend is up."
    else:
        score = 0
        reason = f"Price (${price:,.2f}) below EMA-20 (${ema:,.2f}) — short-term bearish structure."
    return SignalFactor(name="EMA-20", score=score, max_score=15, reason=reason)


def rule_ema_50(indicators: IndicatorSet, tick: MarketTick) -> SignalFactor | None:
    if indicators.ema_50 is None:
        return None
    price = float(tick.price)
    ema = indicators.ema_50.value
    if price > ema:
        score = 15
        reason = f"Price (${price:,.2f}) above EMA-50 (${ema:,.2f}) — medium-term uptrend intact."
    else:
        score = 0
        reason = f"Price (${price:,.2f}) below EMA-50 (${ema:,.2f}) — medium-term bearish bias."
    return SignalFactor(name="EMA-50", score=score, max_score=15, reason=reason)


def rule_sma_200(indicators: IndicatorSet, tick: MarketTick) -> SignalFactor | None:
    if indicators.sma_200 is None:
        return None
    price = float(tick.price)
    sma = indicators.sma_200.value
    if price > sma:
        score = 10
        reason = f"Price (${price:,.2f}) above SMA-200 (${sma:,.2f}) — long-term bull market structure."
    else:
        score = 0
        reason = f"Price (${price:,.2f}) below SMA-200 (${sma:,.2f}) — long-term bear market structure."
    return SignalFactor(name="SMA-200", score=score, max_score=10, reason=reason)


def rule_bollinger(indicators: IndicatorSet) -> SignalFactor | None:
    if indicators.bollinger is None:
        return None
    pct_b = indicators.bollinger.percent_b
    bw = indicators.bollinger.bandwidth
    if pct_b < 0.2:
        score = 10
        reason = f"Bollinger %B at {pct_b:.2f} — price near lower band, potential support zone."
    elif pct_b > 0.8:
        score = 0
        reason = f"Bollinger %B at {pct_b:.2f} — price near upper band, stretched extension."
    else:
        score = 5
        reason = f"Bollinger %B at {pct_b:.2f} — price within mid-band range, bandwidth {bw:.2f}%."
    return SignalFactor(name="Bollinger %B", score=score, max_score=10, reason=reason)


def rule_fear_greed(fear_greed_value: int | None) -> SignalFactor | None:
    if fear_greed_value is None:
        return None
    v = fear_greed_value
    if v <= 25:
        score = 5
        reason = f"Fear & Greed at {v} (Extreme Fear) — historically a contrarian accumulation signal."
    elif v <= 45:
        score = 3
        reason = f"Fear & Greed at {v} (Fear) — market sentiment cautious, moderate contrarian lean."
    elif v <= 55:
        score = 2
        reason = f"Fear & Greed at {v} (Neutral) — no sentiment extreme."
    elif v <= 75:
        score = 1
        reason = f"Fear & Greed at {v} (Greed) — elevated optimism, risk of over-extension."
    else:
        score = 0
        reason = f"Fear & Greed at {v} (Extreme Greed) — historically elevated reversal risk."
    return SignalFactor(name="Fear & Greed", score=score, max_score=5, reason=reason)
