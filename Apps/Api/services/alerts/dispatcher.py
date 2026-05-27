from __future__ import annotations
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from core.logging import get_logger
from models.alert import Alert, AlertTriggerLog
from schemas.alert import AlertTriggeredEvent
from services.alerts.evaluator import EvaluationResult
from ws.manager import ws_manager

logger = get_logger(__name__)


async def dispatch_triggered_alerts(db: AsyncSession, results: list[EvaluationResult]) -> int:
    if not results:
        return 0

    dispatched = 0
    now = datetime.now(tz=timezone.utc)

    for ev in results:
        alert = ev.alert
        try:
            # Persist trigger log
            log = AlertTriggerLog(
                alert_id=alert.id,
                symbol=alert.symbol,
                triggered_at=now,
                trigger_value=ev.trigger_value,
                message=ev.message,
            )
            db.add(log)
            alert.last_triggered_at = now

            # Broadcast via WebSocket if enabled
            if alert.notify_via_ws:
                event = AlertTriggeredEvent(
                    alert_id=str(alert.id),
                    symbol=alert.symbol,
                    alert_type=alert.alert_type,
                    threshold=alert.threshold,
                    trigger_value=ev.trigger_value,
                    message=ev.message,
                    triggered_at=now,
                )
                channel = f"alerts:user:{alert.user_id}"
                await ws_manager.broadcast(channel, event.model_dump(mode="json"))
                logger.info("alert_dispatched", alert_id=str(alert.id), symbol=alert.symbol, channel=channel)

            dispatched += 1
        except Exception as exc:
            logger.error("alert_dispatch_error", alert_id=str(alert.id), error=str(exc))

    await db.commit()
    return dispatched
