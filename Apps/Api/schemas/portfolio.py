from __future__ import annotations
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field


class PortfolioCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    currency: str = "USDT"


class PortfolioRead(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    name: str
    description: str | None
    currency: str


class HoldingCreate(BaseModel):
    asset_symbol: str = Field(..., min_length=1, max_length=30)
    asset_name: str | None = None
    market_type: str = "crypto"
    quantity: Decimal = Field(..., gt=0)
    avg_buy_price: Decimal = Field(..., gt=0)
    exchange: str | None = None


class HoldingUpdate(BaseModel):
    quantity: Decimal | None = Field(default=None, gt=0)
    avg_buy_price: Decimal | None = Field(default=None, gt=0)
    asset_name: str | None = None
    exchange: str | None = None


class HoldingWithPnL(BaseModel):
    id: UUID
    asset_symbol: str
    asset_name: str | None
    market_type: str
    exchange: str | None
    quantity: Decimal
    avg_buy_price: Decimal
    current_price: Decimal | None
    current_value: Decimal | None
    cost_basis: Decimal
    unrealised_pnl: Decimal | None
    unrealised_pnl_pct: float | None
    allocation_pct: float | None


class PortfolioSummary(BaseModel):
    portfolio_id: UUID
    portfolio_name: str
    currency: str
    total_cost_basis: Decimal
    total_current_value: Decimal | None
    total_unrealised_pnl: Decimal | None
    total_unrealised_pnl_pct: float | None
    holdings: list[HoldingWithPnL] = Field(default_factory=list)
    holdings_count: int
