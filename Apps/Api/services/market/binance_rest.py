from __future__ import annotations
import asyncio
import time
from typing import Any

import httpx
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from core.config import settings
from core.exceptions import RateLimitException, AppException
from core.logging import get_logger

logger = get_logger(__name__)

# Binance API weight limit per minute
_WEIGHT_LIMIT = 1100  # leave buffer below 1200 hard limit


class BinanceRESTClient:
    def __init__(self) -> None:
        headers = {"Accept": "application/json"}
        if settings.BINANCE_API_KEY:
            headers["X-MBX-APIKEY"] = settings.BINANCE_API_KEY
        self._client = httpx.AsyncClient(
            base_url=settings.BINANCE_BASE_URL,
            headers=headers,
            timeout=10.0,
        )
        self._used_weight: int = 0
        self._weight_reset_at: float = time.monotonic() + 60

    async def close(self) -> None:
        await self._client.aclose()

    def _reset_weight_if_needed(self) -> None:
        if time.monotonic() >= self._weight_reset_at:
            self._used_weight = 0
            self._weight_reset_at = time.monotonic() + 60

    def _check_rate_limit(self, cost: int) -> None:
        self._reset_weight_if_needed()
        if self._used_weight + cost > _WEIGHT_LIMIT:
            raise RateLimitException("Binance request weight limit reached, backing off")
        self._used_weight += cost

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type(httpx.TransportError),
        reraise=True,
    )
    async def _get(self, path: str, params: dict | None = None, weight: int = 1) -> Any:
        self._check_rate_limit(weight)
        try:
            resp = await self._client.get(path, params=params)
            if resp.status_code == 429:
                raise RateLimitException("Binance rate limit: 429 Too Many Requests")
            if resp.status_code == 418:
                raise RateLimitException("Binance IP banned (418)")
            resp.raise_for_status()
            logger.debug("binance_rest_ok", path=path, status=resp.status_code, weight=self._used_weight)
            return resp.json()
        except httpx.HTTPStatusError as exc:
            logger.error("binance_rest_error", path=path, status=exc.response.status_code)
            raise AppException(exc.response.status_code, f"Binance API error {exc.response.status_code}") from exc

    async def get_ticker(self, symbol: str) -> dict:
        return await self._get("/api/v3/ticker/24hr", params={"symbol": symbol}, weight=1)

    async def get_all_tickers(self, symbols: list[str]) -> list[dict]:
        # Batch fetch is weight=2; fetching individual symbols costs 1 each
        # Use the list endpoint which costs 2 but returns all
        raw = await self._get("/api/v3/ticker/24hr", weight=40)
        symbol_set = set(symbols)
        return [t for t in raw if t["symbol"] in symbol_set]

    async def get_klines(self, symbol: str, interval: str, limit: int = 100) -> list[list]:
        return await self._get(
            "/api/v3/klines",
            params={"symbol": symbol, "interval": interval, "limit": min(limit, 1000)},
            weight=1,
        )

    async def ping(self) -> bool:
        try:
            await self._get("/api/v3/ping", weight=1)
            return True
        except Exception:
            return False


_client: BinanceRESTClient | None = None


async def get_binance_rest() -> BinanceRESTClient:
    global _client
    if _client is None:
        _client = BinanceRESTClient()
    return _client


async def close_binance_rest() -> None:
    global _client
    if _client:
        await _client.close()
        _client = None
