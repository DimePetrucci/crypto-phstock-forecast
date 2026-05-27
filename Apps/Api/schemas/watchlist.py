from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field


class WatchlistItemCreate(BaseModel):
    symbol: str = Field(min_length=1, max_length=30)
    asset_name: str | None = None
    market_type: str = "crypto"
    notes: str | None = None


class WatchlistItemRead(BaseModel):
    id: UUID
    watchlist_id: UUID
    symbol: str
    asset_name: str | None
    market_type: str
    notes: str | None
    added_at: datetime

    model_config = {"from_attributes": True}


class WatchlistItemEnriched(BaseModel):
    id: UUID
    symbol: str
    asset_name: str | None
    market_type: str
    notes: str | None
    added_at: datetime
    current_price: Decimal | None = None
    change_pct_24h: float | None = None
    volume_24h: Decimal | None = None


class WatchlistRead(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    created_at: datetime
    items: list[WatchlistItemRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class WatchlistEnrichedResponse(BaseModel):
    id: UUID
    name: str
    items: list[WatchlistItemEnriched]
    count: int
