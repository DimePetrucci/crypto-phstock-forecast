from __future__ import annotations
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_current_user
from core.database import get_db
from core.logging import get_logger
from models.user import User
from schemas.trade import TradeCreate, TradeListResponse, TradeRead, TradeUpdate
from services.journal.service import (
    create_trade,
    delete_trade,
    get_trade,
    list_trades,
    update_trade,
)

router = APIRouter()
logger = get_logger(__name__)


@router.get("", response_model=TradeListResponse)
async def get_trades(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(default=100, le=500),
    offset: int = Query(default=0, ge=0),
) -> TradeListResponse:
    trades = await list_trades(db, str(current_user.id), limit=limit, offset=offset)
    return TradeListResponse(
        items=[TradeRead.model_validate(t) for t in trades],
        count=len(trades),
    )


@router.post("", response_model=TradeRead, status_code=201)
async def add_trade(
    body: TradeCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TradeRead:
    try:
        trade = await create_trade(db, str(current_user.id), body)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return TradeRead.model_validate(trade)


@router.patch("/{trade_id}", response_model=TradeRead)
async def patch_trade(
    trade_id: UUID,
    body: TradeUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TradeRead:
    trade = await update_trade(db, trade_id, str(current_user.id), body)
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found.")
    return TradeRead.model_validate(trade)


@router.delete("/{trade_id}", status_code=204, response_model=None)
async def remove_trade(
    trade_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    deleted = await delete_trade(db, trade_id, str(current_user.id))
    if not deleted:
        raise HTTPException(status_code=404, detail="Trade not found.")
