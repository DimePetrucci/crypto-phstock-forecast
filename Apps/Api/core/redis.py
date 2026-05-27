import redis.asyncio as aioredis
from core.config import settings
from core.logging import get_logger

logger = get_logger(__name__)

_redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis_client


async def close_redis() -> None:
    global _redis_client
    if _redis_client:
        await _redis_client.aclose()
        _redis_client = None
        logger.info("redis_connection_closed")


async def cache_set(key: str, value: str, ttl: int = settings.REDIS_CACHE_TTL) -> None:
    client = await get_redis()
    await client.setex(key, ttl, value)


async def cache_get(key: str) -> str | None:
    client = await get_redis()
    return await client.get(key)


async def cache_delete(key: str) -> None:
    client = await get_redis()
    await client.delete(key)
