from __future__ import annotations
import orjson
from core.config import settings
from core.logging import get_logger
from scheduler.lock import acquire_job_lock
from services.cache.market_cache import get_cached_price
from services.intelligence.report_builder import build_intelligence_report
from ws.manager import ws_manager

logger = get_logger(__name__)

_TTL = settings.SCHEDULER_INTELLIGENCE_INTERVAL_MINUTES * 60 - 5


async def refresh_intelligence() -> None:
    if not await acquire_job_lock("intelligence_refresh", _TTL):
        return
    for symbol in settings.TRACKED_CRYPTO_SYMBOLS:
        try:
            tick = await get_cached_price(symbol)
            if tick is None:
                continue
            report = await build_intelligence_report(symbol, tick, interval="1d", force_refresh=True)
            if report:
                await ws_manager.broadcast(
                    f"intelligence:{symbol}",
                    orjson.loads(report.model_dump_json()),
                )
                logger.info("intelligence_refreshed", symbol=symbol, score=report.composite_score)
        except Exception as exc:
            logger.error("intelligence_refresh_job_error", symbol=symbol, error=str(exc))
