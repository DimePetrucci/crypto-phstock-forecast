from __future__ import annotations
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.logging import get_logger
from models.watchlist import Watchlist, WatchlistItem
from schemas.watchlist import WatchlistItemCreate, WatchlistItemEnriched, WatchlistEnrichedResponse
from services.cache.market_cache import get_cached_price

logger = get_logger(__name__)


async def get_or_create_default_watchlist(db: AsyncSession, user_id: UUID) -> Watchlist:
    stmt = select(Watchlist).where(Watchlist.user_id == user_id).limit(1)
    result = await db.execute(stmt)
    watchlist = result.scalars().first()
    if watchlist is None:
        watchlist = Watchlist(user_id=user_id, name="My Watchlist")
        db.add(watchlist)
        await db.commit()
        await db.refresh(watchlist)
    return watchlist


async def get_watchlist_items(db: AsyncSession, user_id: UUID) -> list[WatchlistItem]:
    watchlist = await get_or_create_default_watchlist(db, user_id)
    stmt = select(WatchlistItem).where(WatchlistItem.watchlist_id == watchlist.id).order_by(WatchlistItem.added_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def add_watchlist_item(db: AsyncSession, user_id: UUID, data: WatchlistItemCreate) -> WatchlistItem:
    watchlist = await get_or_create_default_watchlist(db, user_id)
    item = WatchlistItem(
        watchlist_id=watchlist.id,
        symbol=data.symbol.upper(),
        asset_name=data.asset_name,
        market_type=data.market_type,
        notes=data.notes,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    logger.info("watchlist_item_added", symbol=item.symbol, user_id=str(user_id))
    return item


async def remove_watchlist_item(db: AsyncSession, user_id: UUID, item_id: UUID) -> bool:
    # Verify ownership
    watchlist = await get_or_create_default_watchlist(db, user_id)
    stmt = select(WatchlistItem).where(
        WatchlistItem.id == item_id,
        WatchlistItem.watchlist_id == watchlist.id,
    )
    result = await db.execute(stmt)
    item = result.scalars().first()
    if item is None:
        return False
    await db.delete(item)
    await db.commit()
    logger.info("watchlist_item_removed", item_id=str(item_id), user_id=str(user_id))
    return True


async def get_enriched_watchlist(db: AsyncSession, user_id: UUID) -> WatchlistEnrichedResponse:
    watchlist = await get_or_create_default_watchlist(db, user_id)
    items = await get_watchlist_items(db, user_id)

    enriched: list[WatchlistItemEnriched] = []
    for item in items:
        tick = await get_cached_price(item.symbol)
        enriched.append(
            WatchlistItemEnriched(
                id=item.id,
                symbol=item.symbol,
                asset_name=item.asset_name,
                market_type=item.market_type,
                notes=item.notes,
                added_at=item.added_at,
                current_price=tick.price if tick else None,
                change_pct_24h=tick.change_pct_24h if tick else None,
                volume_24h=tick.volume_24h if tick else None,
            )
        )

    return WatchlistEnrichedResponse(
        id=watchlist.id,
        name=watchlist.name,
        items=enriched,
        count=len(enriched),
    )
