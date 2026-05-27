from __future__ import annotations
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


Recommendation = Literal["STRONG_BUY", "BUY", "NEUTRAL", "SELL", "STRONG_SELL"]
Confidence = Literal["high", "medium", "low"]
RiskLevel = Literal["low", "medium", "high", "very_high"]


class SignalFactor(BaseModel):
    name: str
    score: int
    max_score: int
    reason: str


class IntelligenceReport(BaseModel):
    symbol: str
    interval: str
    composite_score: int = Field(ge=0, le=100)
    recommendation: Recommendation
    confidence: Confidence
    risk_level: RiskLevel
    factors: list[SignalFactor] = Field(default_factory=list)
    data_points_used: int
    summary: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class BestPick(BaseModel):
    symbol: str
    composite_score: int
    recommendation: Recommendation
    confidence: Confidence
    risk_level: RiskLevel
    summary: str
    generated_at: datetime


class BestPicksResponse(BaseModel):
    items: list[BestPick]
    count: int
    generated_at: datetime
