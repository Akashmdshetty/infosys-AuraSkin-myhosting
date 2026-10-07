import logging
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password, create_access_token
from app.models import User, RoleEnum, VerificationStatus, ProfessionalProfile, EmailVerificationToken, PasswordResetToken
from app.schemas.auth import UserRegistration, UserLogin, Token, ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest
from app.schemas.user import UserResponse

logger = logging.getLogger(__name__)

def register_user(db: Session, payload: UserRegistration) -> UserResponse:
    logger.info("Registering user with email=%s, role=%s", payload.email, payload.role)
    # Check existing email
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        logger.warning("Registration failed: Email already exists: %s", payload.email)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    # Disallow registering as ADMIN directly
    target_role = payload.role or RoleEnum.USER
    if target_role == RoleEnum.ADMIN:
        logger.warning("Registration rejected: Attempted direct ADMIN registration for %s", payload.email)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registration with ADMIN role is not permitted",
        )
    
    # Handle professional verification status
    is_professional = target_role in [RoleEnum.SKINCARE_CONSULTANT, RoleEnum.DERMATOLOGIST]
    verif_status = VerificationStatus.PENDING if is_professional else VerificationStatus.VERIFIED

    # Create user
    hashed_pwd = get_password_hash(payload.password)
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hashed_pwd,
        role=target_role,
        requested_role=target_role,
        verification_status=verif_status,
        email_verified=False,
        age=payload.age,
        country=payload.country,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # If professional, create professional profile entry
    if is_professional:
        prof_profile = ProfessionalProfile(
            user_id=user.id,
            professional_title=payload.professional_title or ("Skincare Consultant" if target_role == RoleEnum.SKINCARE_CONSULTANT else "Dermatologist"),
            qualifications=payload.qualifications,
            certifications=payload.certifications,
            years_experience=payload.years_experience,
            area_of_expertise=payload.area_of_expertise,
            organization=payload.organization,
            registration_number=payload.registration_number,
            country=payload.country,
            verification_docs_notes=payload.verification_docs_notes,
        )
        db.add(prof_profile)
        db.commit()
        db.refresh(user)

    logger.info("User registered successfully: user_id=%s, email=%s, role=%s, verification_status=%s", user.id, user.email, user.role.value, user.verification_status.value)
    return UserResponse.model_validate(user)

def authenticate_user(db: Session, payload: UserLogin) -> Token:
    logger.info("Authentication attempt for email=%s", payload.email)
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        logger.warning("Authentication failed: User not found: %s", payload.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    if not verify_password(payload.password, user.password_hash):
        logger.warning("Authentication failed: Invalid password for %s", payload.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    access_token_expires = timedelta(minutes=30)
    token = create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=access_token_expires,
    )
    logger.info("Authentication successful for email=%s, role=%s", user.email, user.role.value)
    return Token(access_token=token, token_type="bearer")

from app.services.email_service import send_password_reset_email
from app.core.config import settings

def request_forgot_password(db: Session, payload: ForgotPasswordRequest) -> dict:
    # Always return the exact same generic message to prevent email enumeration attacks
    generic_msg = "If an account exists for this email, we've sent a password reset link. Please check your inbox."
    
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        return {"message": generic_msg}
    
    # Generate cryptographically secure, short-lived (15 min), single-use reset token
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    reset_entry = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        used=False
    )
    db.add(reset_entry)
    db.commit()

    # Construct secure frontend reset URL
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
    
    # Dispatch email via real SMTP email service
    send_password_reset_email(
        to_email=user.email,
        user_name=user.name,
        reset_link=reset_link,
        expires_in_minutes=15
    )

    logger.info("Password reset request processed for email=%s", user.email)
    return {"message": generic_msg}


def reset_password_with_token(db: Session, payload: ResetPasswordRequest) -> dict:
    token_hash = hashlib.sha256(payload.token.encode()).hexdigest()
    reset_entry = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used == False
    ).first()

    if not reset_entry:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or already used reset token.")
    
    if reset_entry.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired.")
    
    user = db.query(User).filter(User.id == reset_entry.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    # Update password and invalidate token
    user.password_hash = get_password_hash(payload.new_password)
    reset_entry.used = True
    db.commit()

    logger.info("Password successfully reset for user_id=%s", user.id)
    return {"message": "Password has been successfully updated. You may now log in."}

def generate_email_verification(db: Session, user: User) -> str:
    raw_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(days=1)
    verif_entry = EmailVerificationToken(
        user_id=user.id,
        token=raw_token,
        expires_at=expires_at,
        used=False
    )
    db.add(verif_entry)
    db.commit()
    return raw_token

def verify_email_with_token(db: Session, payload: VerifyEmailRequest) -> dict:
    verif_entry = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token == payload.token,
        EmailVerificationToken.used == False
    ).first()

    if not verif_entry:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or already used verification token.")
    
    if verif_entry.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification token has expired.")
    
    user = db.query(User).filter(User.id == verif_entry.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    user.email_verified = True
    verif_entry.used = True
    db.commit()

    logger.info("Email verified for user_id=%s", user.id)
    return {"message": "Email verified successfully."}

