from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class TradeCreate(BaseModel):
    portfolio_id: UUID
    asset_symbol: str = Field(..., min_length=1, max_length=30)
    asset_name: str | None = None
    market_type: str = "crypto"
    exchange: str = "Binance"
    trade_type: str = Field(..., pattern="^(buy|sell)$")
    buy_price: Decimal | None = Field(default=None, gt=0)
    sell_price: Decimal | None = Field(default=None, gt=0)
    quantity: Decimal = Field(..., gt=0)
    position_size: Decimal | None = Field(default=None, gt=0)
    fees_paid: Decimal = Field(default=Decimal("0"), ge=0)
    currency: str = "USDT"
    entry_at: datetime | None = None
    exit_at: datetime | None = None
    pnl_amount: Decimal | None = None
    pnl_percentage: Decimal | None = None
    break_even_price: Decimal | None = None
    notes: str | None = None
    strategy_tags: list[str] | None = None
    investment_amount: Decimal | None = Field(default=None, ge=0)
    category: str | None = Field(default=None, max_length=50)


class TradeUpdate(BaseModel):
    sell_price: Decimal | None = Field(default=None, gt=0)
    quantity: Decimal | None = Field(default=None, gt=0)
    fees_paid: Decimal | None = Field(default=None, ge=0)
    exit_at: datetime | None = None
    pnl_amount: Decimal | None = None
    pnl_percentage: Decimal | None = None
    notes: str | None = None
    strategy_tags: list[str] | None = None
    investment_amount: Decimal | None = Field(default=None, ge=0)
    category: str | None = Field(default=None, max_length=50)


class TradeRead(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    portfolio_id: UUID
    asset_symbol: str
    asset_name: str | None
    market_type: str
    exchange: str
    trade_type: str
    buy_price: Decimal | None
    sell_price: Decimal | None
    quantity: Decimal
    position_size: Decimal | None
    fees_paid: Decimal
    currency: str
    entry_at: datetime | None
    exit_at: datetime | None
    pnl_amount: Decimal | None
    pnl_percentage: Decimal | None
    break_even_price: Decimal | None
    notes: str | None
    strategy_tags: list[str] | None
    investment_amount: Decimal | None
    category: str | None
    created_at: datetime


class TradeListResponse(BaseModel):
    items: list[TradeRead]
    count: int
