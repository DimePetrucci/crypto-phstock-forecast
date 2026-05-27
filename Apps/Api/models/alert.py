from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String(30), nullable=False, index=True)
    alert_type = Column(String(40), nullable=False)
    # Types: PRICE_ABOVE, PRICE_BELOW, RSI_ABOVE, RSI_BELOW,
    #        MACD_CROSSOVER_BULLISH, MACD_CROSSOVER_BEARISH, PRICE_PCT_CHANGE_24H
    threshold = Column(Numeric(precision=28, scale=10), nullable=False)
    label = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    notify_via_ws = Column(Boolean, default=True, nullable=False)
    last_triggered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User")
    trigger_logs = relationship("AlertTriggerLog", back_populates="alert", cascade="all, delete-orphan")


class AlertTriggerLog(Base):
    __tablename__ = "alert_trigger_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String(30), nullable=False)
    triggered_at = Column(DateTime(timezone=True), server_default=func.now())
    trigger_value = Column(Numeric(precision=28, scale=10), nullable=True)
    message = Column(Text, nullable=True)

    alert = relationship("Alert", back_populates="trigger_logs")
