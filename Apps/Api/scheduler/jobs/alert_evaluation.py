from __future__ import annotations
from core.database import AsyncSessionLocal
from core.logging import get_logger
from scheduler.lock import acquire_job_lock
from services.alerts.evaluator import evaluate_all_alerts
from services.alerts.dispatcher import dispatch_triggered_alerts

logger = get_logger(__name__)

_TTL = 25  # slightly less than 30s interval to allow for processing time


async def evaluate_alerts() -> None:
    if not await acquire_job_lock("alert_evaluation", _TTL):
        return
    try:
        async with AsyncSessionLocal() as db:
            results = await evaluate_all_alerts(db)
            if results:
                dispatched = await dispatch_triggered_alerts(db, results)
                logger.info("alerts_evaluated", triggered=len(results), dispatched=dispatched)
    except Exception as exc:
        logger.error("alert_evaluation_job_error", error=str(exc))
