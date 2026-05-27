from __future__ import annotations
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_current_user
from core.database import get_db
from core.logging import get_logger
from models.alert import Alert, AlertTriggerLog
from models.user import User
from schemas.alert import AlertCreate, AlertRead, AlertUpdate, AlertTriggerLogRead

router = APIRouter()
logger = get_logger(__name__)


@router.get("", response_model=list[AlertRead])
async def list_alerts(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    active_only: Annotated[bool, Query()] = False,
) -> list[AlertRead]:
    stmt = select(Alert).where(Alert.user_id == current_user.id).order_by(desc(Alert.created_at))
    if active_only:
        stmt = stmt.where(Alert.is_active == True)
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.post("", response_model=AlertRead, status_code=201)
async def create_alert(
    data: AlertCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AlertRead:
    alert = Alert(
        user_id=current_user.id,
        symbol=data.symbol.upper(),
        alert_type=data.alert_type,
        threshold=data.threshold,
        label=data.label,
        notify_via_ws=data.notify_via_ws,
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    logger.info("alert_created", alert_id=str(alert.id), symbol=alert.symbol, type=alert.alert_type)
    return alert


@router.patch("/{alert_id}", response_model=AlertRead)
async def update_alert(
    alert_id: UUID,
    data: AlertUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AlertRead:
    stmt = select(Alert).where(Alert.id == alert_id, Alert.user_id == current_user.id)
    result = await db.execute(stmt)
    alert = result.scalars().first()
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")

    if data.label is not None:
        alert.label = data.label
    if data.threshold is not None:
        alert.threshold = data.threshold
    if data.is_active is not None:
        alert.is_active = data.is_active
    if data.notify_via_ws is not None:
        alert.notify_via_ws = data.notify_via_ws

    await db.commit()
    await db.refresh(alert)
    return alert


@router.delete("/{alert_id}", status_code=204, response_model=None)
async def delete_alert(
    alert_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    stmt = select(Alert).where(Alert.id == alert_id, Alert.user_id == current_user.id)
    result = await db.execute(stmt)
    alert = result.scalars().first()
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    await db.delete(alert)
    await db.commit()


@router.get("/events", response_model=list[AlertTriggerLogRead])
async def list_alert_events(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[AlertTriggerLogRead]:
    stmt = (
        select(AlertTriggerLog)
        .join(Alert, AlertTriggerLog.alert_id == Alert.id)
        .where(Alert.user_id == current_user.id)
        .order_by(desc(AlertTriggerLog.triggered_at))
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())
