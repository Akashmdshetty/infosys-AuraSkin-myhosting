from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, require_role
from app.schemas.user import UserResponse
from app.schemas.auth import VerifyProfessionalRequest
from app.services.admin_service import (
    list_users, delete_user, list_pending_professionals, verify_professional_account, get_platform_analytics
)
from app.db.session import get_db
from app.models import RoleEnum

router = APIRouter()

# Only admins can access these routes
admin_required = [Depends(require_role(RoleEnum.ADMIN))]

@router.get("/users", response_model=list[UserResponse], dependencies=admin_required)
def get_all_users(db: Session = Depends(get_db)):
    return list_users(db)

@router.delete("/users/{user_id}", dependencies=admin_required)
def remove_user(user_id: int, db: Session = Depends(get_db)):
    return delete_user(db, user_id)

@router.get("/pending-professionals", response_model=list[UserResponse], dependencies=admin_required)
def get_pending_professionals(db: Session = Depends(get_db)):
    return list_pending_professionals(db)

@router.post("/verify-professional/{user_id}", response_model=UserResponse, dependencies=admin_required)
def verify_professional(user_id: int, payload: VerifyProfessionalRequest, db: Session = Depends(get_db)):
    return verify_professional_account(db, user_id, payload.status)

@router.get("/analytics", dependencies=admin_required)
def get_analytics(db: Session = Depends(get_db)):
    return get_platform_analytics(db)

