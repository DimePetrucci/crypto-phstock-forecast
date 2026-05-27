from __future__ import annotations
import asyncio

from core.config import settings
from core.logging import get_logger
from services.market.binance_ws import BinanceStreamManager

logger = get_logger(__name__)

_stream_manager: BinanceStreamManager | None = None


async def _run_with_restart(manager: BinanceStreamManager) -> None:
    while True:
        try:
            await manager.run()
        except asyncio.CancelledError:
            logger.info("market_broadcaster_cancelled")
            manager.stop()
            return
        except Exception as exc:
            logger.error("market_broadcaster_crashed", error=str(exc))
            await asyncio.sleep(5)


async def start_market_broadcaster() -> asyncio.Task:
    global _stream_manager
    _stream_manager = BinanceStreamManager(settings.TRACKED_CRYPTO_SYMBOLS)
    task = asyncio.create_task(
        _run_with_restart(_stream_manager),
        name="market_broadcaster",
    )
    logger.info("market_broadcaster_started", symbols=settings.TRACKED_CRYPTO_SYMBOLS)
    return task
