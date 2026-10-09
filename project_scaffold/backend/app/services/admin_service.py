import logging
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import (
    User, RoleEnum, VerificationStatus, SkinAssessment, SkinHealthScore,
    SkincareRoutine, Recommendation, SkinProfile, LifestyleProfile,
    SleepRecord, HydrationRecord, EnvironmentalExposure, ProfessionalProfile,
    EmailVerificationToken, PasswordResetToken, ConsultationRequest,
    ProductRecommendation, ProgressRecord, RoutineAdherenceRecord,
    Notification, NotificationPreferences, Product
)
from app.schemas.user import UserResponse

logger = logging.getLogger(__name__)

def list_users(db: Session) -> list[UserResponse]:
    logger.info("Admin fetching all users list")
    users = db.query(User).all()
    return [UserResponse.model_validate(u) for u in users]

def delete_user(db: Session, user_id: int):
    logger.info("Admin deleting user_id=%s", user_id)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.warning("Admin delete failed: User not found: user_id=%s", user_id)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    try:
        # 1. Delete notifications and preferences
        db.query(Notification).filter(Notification.user_id == user_id).delete(synchronize_session=False)
        db.query(NotificationPreferences).filter(NotificationPreferences.user_id == user_id).delete(synchronize_session=False)

        # 2. Delete consultation requests where user is client or professional
        db.query(ConsultationRequest).filter(
            (ConsultationRequest.client_id == user_id) | (ConsultationRequest.professional_id == user_id)
        ).delete(synchronize_session=False)

        # 3. Delete tokens
        db.query(EmailVerificationToken).filter(EmailVerificationToken.user_id == user_id).delete(synchronize_session=False)
        db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user_id).delete(synchronize_session=False)

        # 4. Delete progress & routines & scores & assessments
        db.query(RoutineAdherenceRecord).filter(RoutineAdherenceRecord.user_id == user_id).delete(synchronize_session=False)
        db.query(ProgressRecord).filter(ProgressRecord.user_id == user_id).delete(synchronize_session=False)
        db.query(ProductRecommendation).filter(ProductRecommendation.user_id == user_id).delete(synchronize_session=False)
        db.query(Recommendation).filter(Recommendation.user_id == user_id).delete(synchronize_session=False)
        db.query(SkincareRoutine).filter(SkincareRoutine.user_id == user_id).delete(synchronize_session=False)
        db.query(SkinHealthScore).filter(SkinHealthScore.user_id == user_id).delete(synchronize_session=False)
        db.query(SkinAssessment).filter(SkinAssessment.user_id == user_id).delete(synchronize_session=False)

        # 5. Delete telemetry & profiles
        db.query(SleepRecord).filter(SleepRecord.user_id == user_id).delete(synchronize_session=False)
        db.query(HydrationRecord).filter(HydrationRecord.user_id == user_id).delete(synchronize_session=False)
        db.query(EnvironmentalExposure).filter(EnvironmentalExposure.user_id == user_id).delete(synchronize_session=False)
        db.query(ProfessionalProfile).filter(ProfessionalProfile.user_id == user_id).delete(synchronize_session=False)
        db.query(LifestyleProfile).filter(LifestyleProfile.user_id == user_id).delete(synchronize_session=False)
        db.query(SkinProfile).filter(SkinProfile.user_id == user_id).delete(synchronize_session=False)

        # 6. Delete the user
        db.query(User).filter(User.id == user_id).delete(synchronize_session=False)
        db.commit()
        logger.info("Admin successfully deleted user_id=%s and all associated records", user_id)
        return {"detail": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        logger.error("Error deleting user_id=%s: %s", user_id, str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )

def list_pending_professionals(db: Session) -> list[UserResponse]:
    logger.info("Admin fetching pending professional verification list")
    users = db.query(User).filter(User.verification_status == VerificationStatus.PENDING).all()
    return [UserResponse.model_validate(u) for u in users]

def verify_professional_account(db: Session, user_id: int, new_status: VerificationStatus) -> UserResponse:
    logger.info("Admin verifying user_id=%s to status=%s", user_id, new_status.value)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.verification_status = new_status
    if new_status == VerificationStatus.VERIFIED and user.requested_role:
        user.role = user.requested_role

    db.commit()
    db.refresh(user)
    logger.info("Professional verification updated for user_id=%s: status=%s, role=%s", user.id, user.verification_status.value, user.role.value)
    return UserResponse.model_validate(user)

def get_platform_analytics(db: Session) -> dict:
    total_users = db.query(User).count()
    total_clients = db.query(User).filter(User.role == RoleEnum.USER).count()
    total_consultants = db.query(User).filter(User.role == RoleEnum.SKINCARE_CONSULTANT).count()
    total_dermatologists = db.query(User).filter(User.role == RoleEnum.DERMATOLOGIST).count()
    verified_professionals = db.query(User).filter(
        User.role.in_([RoleEnum.SKINCARE_CONSULTANT, RoleEnum.DERMATOLOGIST]),
        User.verification_status == VerificationStatus.VERIFIED
    ).count()
    pending_verifications = db.query(User).filter(User.verification_status == VerificationStatus.PENDING).count()
    
    total_assessments = db.query(SkinAssessment).count()
    total_products = db.query(Product).count()
    total_recs = db.query(ProductRecommendation).count()
    total_progress_records = db.query(ProgressRecord).count()
    total_adherences = db.query(RoutineAdherenceRecord).count()
    total_notifications = db.query(Notification).count()

    scores = db.query(SkinHealthScore.total_score).all()
    avg_score = round(sum(s[0] for s in scores) / len(scores), 1) if scores else 0.0

    adherences = db.query(RoutineAdherenceRecord.adherence_rate).all()
    avg_adherence = round((sum(a[0] for a in adherences) / len(adherences)) * 100, 1) if adherences else 0.0

    return {
        "total_users": total_users,
        "clients_count": total_clients,
        "consultants_count": total_consultants,
        "dermatologists_count": total_dermatologists,
        "verified_professionals_count": verified_professionals,
        "pending_verifications": pending_verifications,
        "total_assessments_run": total_assessments,
        "average_skin_health_score": avg_score,
        "total_catalog_products": total_products,
        "total_recommendations_computed": total_recs,
        "total_progress_snapshots": total_progress_records,
        "total_adherence_logs": total_adherences,
        "average_adherence_rate_pct": avg_adherence,
        "total_notifications_dispatched": total_notifications,
        "system_status": "OPERATIONAL",
        "database_health": "CONNECTED",
        "version": "4.0.0"
    }

def update_user_role(db: Session, user_id: int, new_role: RoleEnum, new_status: VerificationStatus = None) -> UserResponse:
    logger.info("Admin updating user_id=%s role to %s", user_id, new_role.value)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.role = new_role
    if new_status is not None:
        user.verification_status = new_status
    elif new_role in [RoleEnum.SKINCARE_CONSULTANT, RoleEnum.DERMATOLOGIST]:
        # If promoting to professional, ensure verified status if admin explicitly assigned
        user.verification_status = VerificationStatus.VERIFIED

    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)

def update_user_status(db: Session, user_id: int, new_status: VerificationStatus) -> UserResponse:
    logger.info("Admin updating user_id=%s status to %s", user_id, new_status.value)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.verification_status = new_status
    if new_status == VerificationStatus.VERIFIED and user.requested_role:
        user.role = user.requested_role

    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)

