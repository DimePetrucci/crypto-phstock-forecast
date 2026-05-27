from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, Field

AlertType = Literal[
    "PRICE_ABOVE",
    "PRICE_BELOW",
    "RSI_ABOVE",
    "RSI_BELOW",
    "MACD_CROSSOVER_BULLISH",
    "MACD_CROSSOVER_BEARISH",
    "PRICE_PCT_CHANGE_24H",
]


class AlertCreate(BaseModel):
    symbol: str = Field(min_length=1, max_length=30)
    alert_type: AlertType
    threshold: Decimal
    label: str | None = Field(default=None, max_length=255)
    notify_via_ws: bool = True


class AlertUpdate(BaseModel):
    label: str | None = None
    threshold: Decimal | None = None
    is_active: bool | None = None
    notify_via_ws: bool | None = None


class AlertRead(BaseModel):
    id: UUID
    user_id: UUID
    symbol: str
    alert_type: AlertType
    threshold: Decimal
    label: str | None
    is_active: bool
    notify_via_ws: bool
    last_triggered_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AlertTriggerLogRead(BaseModel):
    id: UUID
    alert_id: UUID
    symbol: str
    triggered_at: datetime
    trigger_value: Decimal | None
    message: str | None

    model_config = {"from_attributes": True}


class AlertTriggeredEvent(BaseModel):
    event: Literal["alert_triggered"] = "alert_triggered"
    alert_id: str
    symbol: str
    alert_type: AlertType
    threshold: Decimal
    trigger_value: Decimal
    message: str
    triggered_at: datetime
