from __future__ import annotations
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from core.config import settings
from core.logging import get_logger
from scheduler.jobs.sentiment_refresh import refresh_sentiment
from scheduler.jobs.intelligence_refresh import refresh_intelligence
from scheduler.jobs.alert_evaluation import evaluate_alerts

logger = get_logger(__name__)

_scheduler: AsyncIOScheduler | None = None


async def start_scheduler() -> AsyncIOScheduler:
    global _scheduler
    _scheduler = AsyncIOScheduler(timezone="UTC")

    _scheduler.add_job(
        refresh_sentiment,
        "interval",
        minutes=settings.SCHEDULER_SENTIMENT_INTERVAL_MINUTES,
        id="sentiment_refresh",
        replace_existing=True,
    )
    _scheduler.add_job(
        refresh_intelligence,
        "interval",
        minutes=settings.SCHEDULER_INTELLIGENCE_INTERVAL_MINUTES,
        id="intelligence_refresh",
        replace_existing=True,
    )
    _scheduler.add_job(
        evaluate_alerts,
        "interval",
        seconds=settings.SCHEDULER_ALERT_INTERVAL_SECONDS,
        id="alert_evaluation",
        replace_existing=True,
    )

    _scheduler.start()
    logger.info(
        "scheduler_started",
        sentiment_interval_min=settings.SCHEDULER_SENTIMENT_INTERVAL_MINUTES,
        intelligence_interval_min=settings.SCHEDULER_INTELLIGENCE_INTERVAL_MINUTES,
        alert_interval_sec=settings.SCHEDULER_ALERT_INTERVAL_SECONDS,
    )
    return _scheduler


async def stop_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("scheduler_stopped")
    _scheduler = None
