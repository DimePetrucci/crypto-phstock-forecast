from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse, RefreshRequest, UserResponse,
    ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest,
    VerifyEmailRequest, ResendVerificationRequest, DeleteAccountRequest,
)
from schemas.common import MessageResponse
from services.auth_service import (
    register_user, login_user, refresh_tokens, revoke_refresh_token,
    verify_email, resend_verification, forgot_password, reset_password,
    change_password, delete_account,
)
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


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email_route(data: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    await verify_email(db, data.token)
    return MessageResponse(message="Email verified successfully")


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification_route(data: ResendVerificationRequest, db: AsyncSession = Depends(get_db)):
    await resend_verification(db, data.email)
    return MessageResponse(message="If your email is registered and unverified, a new link has been sent")


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password_route(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    await forgot_password(db, data.email)
    return MessageResponse(message="If that email is registered, a reset link has been sent")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password_route(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    await reset_password(db, data.token, data.new_password)
    return MessageResponse(message="Password reset successfully. Please sign in.")


@router.post("/change-password", response_model=MessageResponse)
async def change_password_route(
    data: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await change_password(db, current_user, data.current_password, data.new_password)
    return MessageResponse(message="Password changed successfully")


@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account_route(
    data: DeleteAccountRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await delete_account(db, current_user, data.password)
