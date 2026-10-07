import logging
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import User
from app.schemas.user import UserResponse, UserUpdate

logger = logging.getLogger(__name__)

def get_user_by_id(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def update_user(db: Session, user: User, payload: UserUpdate) -> UserResponse:
    logger.info("Updating user profile for user_id=%s", user.id)
    if payload.name is not None:
        user.name = payload.name
    if payload.email is not None:
        # check email uniqueness
        existing = db.query(User).filter(User.email == payload.email, User.id != user.id).first()
        if existing:
            logger.warning("Email update failed: Email already in use: %s", payload.email)
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")
        user.email = payload.email
    db.commit()
    db.refresh(user)
    logger.info("User profile updated successfully for user_id=%s", user.id)
    return UserResponse.model_validate(user)
