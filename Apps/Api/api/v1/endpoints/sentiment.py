from __future__ import annotations
from typing import Annotated

from fastapi import APIRouter, Query, HTTPException

from core.logging import get_logger
from schemas.sentiment import FearGreedResult, NewsItem, SentimentSnapshotResponse
from services.sentiment.aggregator import get_fear_greed, get_news, get_sentiment_snapshot, snapshot_to_response

router = APIRouter()
logger = get_logger(__name__)


@router.get("/fear-greed", response_model=FearGreedResult)
async def get_fear_greed_index() -> FearGreedResult:
    result = await get_fear_greed()
    if result is None:
        raise HTTPException(status_code=503, detail="Fear & Greed data temporarily unavailable")
    return result


@router.get("/news", response_model=list[NewsItem])
async def get_crypto_news(
    symbol: Annotated[str | None, Query(description="Optional crypto symbol filter, e.g. BTC")] = None,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
) -> list[NewsItem]:
    try:
        items = await get_news(symbol=symbol)
        return items[:limit]
    except Exception as exc:
        logger.error("news_endpoint_error", error=str(exc))
        raise HTTPException(status_code=503, detail="News service temporarily unavailable")


@router.get("/snapshot", response_model=SentimentSnapshotResponse)
async def get_sentiment_overview(
    symbol: Annotated[str | None, Query(description="Optional symbol filter")] = None,
) -> SentimentSnapshotResponse:
    try:
        snapshot = await get_sentiment_snapshot(symbol=symbol)
        return snapshot_to_response(snapshot)
    except Exception as exc:
        logger.error("sentiment_snapshot_error", error=str(exc))
        raise HTTPException(status_code=503, detail="Sentiment service temporarily unavailable")
