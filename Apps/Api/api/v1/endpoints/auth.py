from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest, UserResponse
from schemas.common import MessageResponse
from services.auth_service import register_user, login_user, refresh_tokens, revoke_refresh_token
from api.deps import get_current_user
from models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    user = await register_user(db, data)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await login_user(db, data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    return await refresh_tokens(db, data.refresh_token)


@router.post("/logout", response_model=MessageResponse)
async def logout(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    await revoke_refresh_token(db, data.refresh_token)
    return MessageResponse(message="Logged out successfully")


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
