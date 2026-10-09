from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, require_role
from app.schemas.user import UserResponse
from app.schemas.auth import VerifyProfessionalRequest
from app.schemas.professional_management import AdminRoleUpdatePayload, AdminStatusUpdatePayload, AdminContactPayload
from app.schemas.consultation import ConsultationResponse
from app.models import ConsultationRequest, User, NotificationTypeEnum, NotificationPriorityEnum
from app.services.notification_service import create_notification
from app.services.admin_service import (
    list_users, delete_user, list_pending_professionals, verify_professional_account, get_platform_analytics,
    update_user_role, update_user_status
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

@router.patch("/users/{user_id}/role", response_model=UserResponse, dependencies=admin_required)
def patch_user_role(user_id: int, payload: AdminRoleUpdatePayload, db: Session = Depends(get_db)):
    return update_user_role(db, user_id, payload.role, payload.verification_status)

@router.patch("/users/{user_id}/status", response_model=UserResponse, dependencies=admin_required)
def patch_user_status(user_id: int, payload: AdminStatusUpdatePayload, db: Session = Depends(get_db)):
    return update_user_status(db, user_id, payload.status)

@router.post("/contact-user", response_model=ConsultationResponse)
def admin_contact_user(
    payload: AdminContactPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows Administrator to contact any Dermatologist, Consultant, or Client directly."""
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")

    target_user = db.query(User).filter(User.id == payload.target_user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found.")

    advisory_label = payload.advisory_type.replace('_', ' ').title() if payload.advisory_type else "Administrative Advisory"

    consultation = ConsultationRequest(
        client_id=payload.target_user_id,
        professional_id=current_user.id,
        subject=f"[{advisory_label}]: {payload.subject}",
        message=payload.message,
        primary_concern="ADMIN_DIRECTIVE",
        status="ACTIVE",
        response_notes=f"Official Notice dispatched by Administrator {current_user.name}."
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    create_notification(
        db=db,
        user_id=payload.target_user_id,
        title=f"Official Admin Notice: {payload.subject}",
        message=f"Administrator {current_user.name} has sent you an official advisory: '{payload.message}'",
        notification_type=NotificationTypeEnum.SYSTEM,
        priority=NotificationPriorityEnum.HIGH,
        action_url="#portals"
    )

    return ConsultationResponse.model_validate(consultation)

@router.get("/pending-professionals", response_model=list[UserResponse], dependencies=admin_required)
def get_pending_professionals(db: Session = Depends(get_db)):
    return list_pending_professionals(db)

@router.post("/verify-professional/{user_id}", response_model=UserResponse, dependencies=admin_required)
def verify_professional(user_id: int, payload: VerifyProfessionalRequest, db: Session = Depends(get_db)):
    return verify_professional_account(db, user_id, payload.status)

@router.get("/analytics", dependencies=admin_required)
def get_analytics(db: Session = Depends(get_db)):
    return get_platform_analytics(db)



