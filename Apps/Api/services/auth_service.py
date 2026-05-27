import hashlib
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user import User
from models.auth import RefreshToken
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from core.config import settings
from core.exceptions import AuthException, ValidationException
from core.logging import get_logger

logger = get_logger(__name__)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


async def register_user(db: AsyncSession, data: RegisterRequest) -> User:
    existing = await db.execute(
        select(User).where((User.email == data.email) | (User.username == data.username))
    )
    if existing.scalar_one_or_none():
        raise ValidationException("Email or username already registered")

    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )
    db.add(user)
    await db.flush()
    logger.info("user_registered", user_id=str(user.id), email=user.email)
    return user


async def login_user(db: AsyncSession, data: LoginRequest) -> TokenResponse:
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise AuthException("Invalid credentials")

    if not user.is_active:
        raise AuthException("Account is disabled")

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    token_record = RefreshToken(
        user_id=user.id,
        token_hash=_hash_token(refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(token_record)

    user.last_login_at = datetime.now(timezone.utc)
    await db.flush()

    logger.info("user_logged_in", user_id=str(user.id))
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


async def refresh_tokens(db: AsyncSession, refresh_token: str) -> TokenResponse:
    try:
        payload = decode_token(refresh_token)
    except ValueError:
        raise AuthException("Invalid refresh token")

    if payload.get("type") != "refresh":
        raise AuthException("Invalid token type")

    token_hash = _hash_token(refresh_token)
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.is_revoked == False,
        )
    )
    token_record = result.scalar_one_or_none()
    if not token_record:
        raise AuthException("Refresh token revoked or not found")

    token_record.is_revoked = True
    token_record.revoked_at = datetime.now(timezone.utc)

    user_id = payload["sub"]
    new_access = create_access_token(user_id)
    new_refresh = create_refresh_token(user_id)

    new_record = RefreshToken(
        user_id=token_record.user_id,
        token_hash=_hash_token(new_refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(new_record)
    await db.flush()

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


async def revoke_refresh_token(db: AsyncSession, refresh_token: str) -> None:
    token_hash = _hash_token(refresh_token)
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    )
    token_record = result.scalar_one_or_none()
    if token_record and not token_record.is_revoked:
        token_record.is_revoked = True
        token_record.revoked_at = datetime.now(timezone.utc)
        await db.flush()
