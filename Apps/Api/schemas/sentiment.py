from __future__ import annotations
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class FearGreedResult(BaseModel):
    value: int = Field(ge=0, le=100)
    classification: Literal[
        "Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed"
    ]
    updated_at: datetime


class NewsItem(BaseModel):
    title: str
    url: str
    published_at: datetime
    source: str
    sentiment_score: float = Field(ge=-1.0, le=1.0)
    currencies: list[str] = Field(default_factory=list)


class SentimentSnapshot(BaseModel):
    fear_greed: FearGreedResult | None = None
    news: list[NewsItem] = Field(default_factory=list)
    overall_news_sentiment: float = Field(default=0.0, ge=-1.0, le=1.0)
    fetched_at: datetime = Field(default_factory=datetime.utcnow)


class SentimentSnapshotResponse(BaseModel):
    fear_greed: FearGreedResult | None = None
    news_count: int
    overall_news_sentiment: float
    market_mood: Literal["Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed"]
    fetched_at: datetime
