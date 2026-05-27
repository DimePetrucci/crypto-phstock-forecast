from __future__ import annotations
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_current_user
from core.database import get_db
from core.logging import get_logger
from models.user import User
from schemas.watchlist import WatchlistItemCreate, WatchlistItemRead, WatchlistEnrichedResponse
from services.watchlist.service import (
    add_watchlist_item,
    remove_watchlist_item,
    get_enriched_watchlist,
    get_watchlist_items,
)

router = APIRouter()
logger = get_logger(__name__)


@router.get("", response_model=WatchlistEnrichedResponse)
async def get_watchlist(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> WatchlistEnrichedResponse:
    return await get_enriched_watchlist(db, current_user.id)


@router.post("", response_model=WatchlistItemRead, status_code=201)
async def add_to_watchlist(
    data: WatchlistItemCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> WatchlistItemRead:
    try:
        item = await add_watchlist_item(db, current_user.id, data)
        return item
    except Exception as exc:
        if "uq_watchlist_symbol" in str(exc).lower():
            raise HTTPException(status_code=409, detail=f"{data.symbol.upper()} is already in your watchlist")
        logger.error("watchlist_add_error", error=str(exc))
        raise HTTPException(status_code=500, detail="Failed to add item to watchlist")


@router.delete("/{item_id}", status_code=204, response_model=None)
async def remove_from_watchlist(
    item_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    removed = await remove_watchlist_item(db, current_user.id, item_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
