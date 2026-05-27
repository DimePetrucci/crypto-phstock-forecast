from __future__ import annotations
from core.config import settings
from core.logging import get_logger
from scheduler.lock import acquire_job_lock
from services.sentiment.aggregator import get_fear_greed
from ws.manager import ws_manager

logger = get_logger(__name__)

_TTL = settings.SCHEDULER_SENTIMENT_INTERVAL_MINUTES * 60 - 5


async def refresh_sentiment() -> None:
    if not await acquire_job_lock("sentiment_refresh", _TTL):
        return
    try:
        fg = await get_fear_greed(force_refresh=True)
        if fg:
            await ws_manager.broadcast("sentiment", {
                "type": "fear_greed_update",
                "value": fg.value,
                "classification": fg.classification,
                "updated_at": fg.updated_at.isoformat(),
            })
            logger.info("sentiment_refreshed", fg_value=fg.value, classification=fg.classification)
    except Exception as exc:
        logger.error("sentiment_refresh_job_error", error=str(exc))
