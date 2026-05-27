from __future__ import annotations
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field


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
