from __future__ import annotations
from typing import Literal
from schemas.intelligence import IntelligenceReport, SignalFactor, Recommendation, Confidence, RiskLevel
from schemas.market import IndicatorSet, MarketTick
from services.intelligence.signal_rules import (
    rule_rsi, rule_macd, rule_ema_20, rule_ema_50, rule_sma_200, rule_bollinger, rule_fear_greed,
)


def _score_to_recommendation(score: int) -> Recommendation:
    if score >= 80:
        return "STRONG_BUY"
    if score >= 60:
        return "BUY"
    if score >= 40:
        return "NEUTRAL"
    if score >= 20:
        return "SELL"
    return "STRONG_SELL"


def _factors_to_confidence(factors: list[SignalFactor]) -> Confidence:
    n = len(factors)
    if n >= 5:
        return "high"
    if n >= 3:
        return "medium"
    return "low"


def _score_to_risk(score: int, factors: list[SignalFactor]) -> RiskLevel:
    # Low score → high risk; also consider RSI extreme overbought
    rsi_factor = next((f for f in factors if f.name == "RSI"), None)
    rsi_overbought = rsi_factor is not None and rsi_factor.score == 0

    if score >= 70 and not rsi_overbought:
        return "low"
    if score >= 50:
        return "medium"
    if score >= 30:
        return "high"
    return "very_high"


def _build_summary(rec: Recommendation, score: int, factors: list[SignalFactor]) -> str:
    desc_map: dict[Recommendation, str] = {
        "STRONG_BUY": "Strong technical alignment across multiple indicators suggests a high-probability setup.",
        "BUY": "Multiple indicators lean bullish. Consider entry with defined risk management.",
        "NEUTRAL": "Mixed signals — no strong directional edge. Monitor for clearer confirmation.",
        "SELL": "Bearish technical alignment. Consider reducing exposure or tightening stops.",
        "STRONG_SELL": "Multiple indicators align bearishly. High reversal risk, avoid new long positions.",
    }
    base = desc_map[rec]
    top_factors = sorted(factors, key=lambda f: f.score, reverse=True)[:2]
    if top_factors:
        names = " and ".join(f.name for f in top_factors)
        return f"{base} Key drivers: {names}."
    return base


def compute_intelligence_report(
    symbol: str,
    interval: str,
    indicators: IndicatorSet,
    tick: MarketTick,
    fear_greed_value: int | None = None,
) -> IntelligenceReport:
    raw_factors: list[SignalFactor | None] = [
        rule_rsi(indicators),
        rule_macd(indicators),
        rule_ema_20(indicators, tick),
        rule_ema_50(indicators, tick),
        rule_sma_200(indicators, tick),
        rule_bollinger(indicators),
        rule_fear_greed(fear_greed_value),
    ]
    factors = [f for f in raw_factors if f is not None]

    composite_score = sum(f.score for f in factors)
    max_possible = sum(f.max_score for f in factors)

    # Normalise to 0-100
    if max_possible > 0:
        composite_score = round((composite_score / max_possible) * 100)
    else:
        composite_score = 50

    rec = _score_to_recommendation(composite_score)
    confidence = _factors_to_confidence(factors)
    risk = _score_to_risk(composite_score, factors)
    summary = _build_summary(rec, composite_score, factors)

    return IntelligenceReport(
        symbol=symbol,
        interval=interval,
        composite_score=composite_score,
        recommendation=rec,
        confidence=confidence,
        risk_level=risk,
        factors=factors,
        data_points_used=len(factors),
        summary=summary,
    )
