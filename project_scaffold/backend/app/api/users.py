from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import update_user
from app.db.session import get_db

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_me(current_user = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.put("/me", response_model=UserResponse)
def update_me(payload: UserUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return update_user(db, current_user, payload)
