from fastapi import WebSocket
from typing import Dict, Set
from core.logging import get_logger
import asyncio

logger = get_logger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        # channel -> set of websockets subscribed to that channel
        self._channels: Dict[str, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, channel: str) -> None:
        await websocket.accept()
        async with self._lock:
            if channel not in self._channels:
                self._channels[channel] = set()
            self._channels[channel].add(websocket)
        logger.info("ws_connected", channel=channel, total=len(self._channels.get(channel, set())))

    async def disconnect(self, websocket: WebSocket, channel: str) -> None:
        async with self._lock:
            self._channels.get(channel, set()).discard(websocket)
        logger.info("ws_disconnected", channel=channel)

    async def broadcast(self, channel: str, message: dict) -> None:
        subscribers = set(self._channels.get(channel, set()))
        dead: list[WebSocket] = []
        for ws in subscribers:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        if dead:
            async with self._lock:
                for ws in dead:
                    self._channels.get(channel, set()).discard(ws)

    async def send_personal(self, websocket: WebSocket, message: dict) -> None:
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.warning("ws_send_failed", error=str(e))


ws_manager = ConnectionManager()
