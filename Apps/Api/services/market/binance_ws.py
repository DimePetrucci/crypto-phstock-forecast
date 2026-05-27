from __future__ import annotations
import asyncio
import json
from datetime import datetime, timezone
from decimal import Decimal

import websockets
from websockets.exceptions import ConnectionClosed

from core.config import settings
from core.logging import get_logger
from schemas.market import MarketTick
from services.cache.market_cache import cache_market_price
from ws.manager import ws_manager

logger = get_logger(__name__)

_MAX_BACKOFF = 30.0


def _build_stream_url(symbols: list[str]) -> str:
    streams = "/".join(f"{s.lower()}@miniTicker" for s in symbols)
    return f"{settings.BINANCE_WS_BASE_URL}/stream?streams={streams}"


def _parse_mini_ticker(data: dict) -> MarketTick | None:
    try:
        symbol = data["s"]
        price = Decimal(data["c"])
        open_price = Decimal(data["o"])
        change_abs = float(price - open_price)
        change_pct = (change_abs / float(open_price) * 100) if open_price else 0.0
        return MarketTick(
            symbol=symbol,
            price=price,
            change_24h=change_abs,
            change_pct_24h=change_pct,
            volume_24h=Decimal(data["q"]),
            high_24h=Decimal(data["h"]),
            low_24h=Decimal(data["l"]),
            timestamp=datetime.now(timezone.utc),
            source="binance",
        )
    except (KeyError, Exception) as exc:
        logger.warning("binance_ws_parse_error", error=str(exc))
        return None


class BinanceStreamManager:
    def __init__(self, symbols: list[str]) -> None:
        self._symbols = symbols
        self._url = _build_stream_url(symbols)
        self._running = False

    async def run(self) -> None:
        self._running = True
        backoff = 1.0
        logger.info("binance_stream_starting", symbols=self._symbols, url=self._url)

        while self._running:
            try:
                async with websockets.connect(
                    self._url,
                    ping_interval=20,
                    ping_timeout=10,
                    close_timeout=5,
                ) as ws:
                    logger.info("binance_stream_connected")
                    backoff = 1.0  # reset on successful connect
                    async for raw in ws:
                        if not self._running:
                            break
                        try:
                            envelope = json.loads(raw)
                            # Combined stream wraps data in {"stream": "...", "data": {...}}
                            data = envelope.get("data", envelope)
                            tick = _parse_mini_ticker(data)
                            if tick is None:
                                continue
                            channel = f"price:{tick.symbol}"
                            payload = json.loads(tick.model_dump_json())
                            await asyncio.gather(
                                ws_manager.broadcast(channel, payload),
                                cache_market_price(tick.symbol, tick),
                                return_exceptions=True,
                            )
                        except Exception as exc:
                            logger.warning("binance_stream_message_error", error=str(exc))

            except ConnectionClosed as exc:
                logger.warning("binance_stream_disconnected", reason=str(exc), backoff=backoff)
            except Exception as exc:
                logger.error("binance_stream_error", error=str(exc), backoff=backoff)

            if not self._running:
                break
            await asyncio.sleep(backoff)
            backoff = min(backoff * 2, _MAX_BACKOFF)

        logger.info("binance_stream_stopped")

    def stop(self) -> None:
        self._running = False
