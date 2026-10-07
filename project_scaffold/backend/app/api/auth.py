from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.schemas.auth import UserRegistration, UserLogin, Token, ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest
from app.schemas.user import UserResponse
from app.services.auth_service import (
    register_user, authenticate_user, request_forgot_password, reset_password_with_token, verify_email_with_token
)
from app.db.session import get_db

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegistration, db: Session = Depends(get_db)):
    return register_user(db, payload)

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    return authenticate_user(db, payload)

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    return request_forgot_password(db, payload)

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    return reset_password_with_token(db, payload)

@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    return verify_email_with_token(db, payload)

