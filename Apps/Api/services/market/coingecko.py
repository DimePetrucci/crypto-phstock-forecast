from __future__ import annotations
import asyncio
import time
from collections import deque
from typing import Any

import httpx

from core.config import settings
from core.logging import get_logger

logger = get_logger(__name__)

# Free tier: 30 calls/min
_FREE_TIER_RPM = 30
_MIN_INTERVAL = 60.0 / _FREE_TIER_RPM  # 2 seconds between calls


class CoinGeckoClient:
    def __init__(self) -> None:
        headers = {"Accept": "application/json"}
        if settings.COINGECKO_API_KEY:
            headers["x-cg-pro-api-key"] = settings.COINGECKO_API_KEY
        self._client = httpx.AsyncClient(
            base_url=settings.COINGECKO_BASE_URL,
            headers=headers,
            timeout=15.0,
        )
        self._call_times: deque[float] = deque()
        self._lock = asyncio.Lock()

    async def close(self) -> None:
        await self._client.aclose()

    async def _throttle(self) -> None:
        async with self._lock:
            now = time.monotonic()
            # Drop calls older than 60 seconds
            while self._call_times and self._call_times[0] < now - 60:
                self._call_times.popleft()
            if len(self._call_times) >= _FREE_TIER_RPM:
                wait = 60 - (now - self._call_times[0])
                if wait > 0:
                    logger.warning("coingecko_rate_limit_wait", wait_seconds=round(wait, 2))
                    await asyncio.sleep(wait)
            self._call_times.append(time.monotonic())

    async def _get(self, path: str, params: dict | None = None) -> Any:
        await self._throttle()
        try:
            resp = await self._client.get(path, params=params)
            resp.raise_for_status()
            logger.debug("coingecko_ok", path=path)
            return resp.json()
        except httpx.HTTPStatusError as exc:
            logger.error("coingecko_error", path=path, status=exc.response.status_code)
            raise

    async def get_simple_prices(
        self,
        coin_ids: list[str],
        vs_currencies: list[str] | None = None,
    ) -> dict:
        if vs_currencies is None:
            vs_currencies = ["usd"]
        return await self._get(
            "/simple/price",
            params={
                "ids": ",".join(coin_ids),
                "vs_currencies": ",".join(vs_currencies),
                "include_24hr_change": "true",
                "include_24hr_vol": "true",
                "include_market_cap": "true",
            },
        )

    async def get_coin_market_data(self, coin_id: str) -> dict:
        return await self._get(f"/coins/{coin_id}", params={"localization": "false", "tickers": "false"})

    async def search_coins(self, query: str) -> list[dict]:
        data = await self._get("/search", params={"query": query})
        return data.get("coins", [])


_client: CoinGeckoClient | None = None


async def get_coingecko() -> CoinGeckoClient:
    global _client
    if _client is None:
        _client = CoinGeckoClient()
    return _client


async def close_coingecko() -> None:
    global _client
    if _client:
        await _client.close()
        _client = None
