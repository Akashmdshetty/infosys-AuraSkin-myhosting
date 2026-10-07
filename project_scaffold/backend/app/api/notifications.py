from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models import User, NotificationTypeEnum
from app.schemas.notification import (
    NotificationResponse, NotificationListResponse, NotificationPreferencesResponse,
    NotificationPreferencesUpdate
)
from app.services.notification_service import (
    list_user_notifications, get_unread_count, mark_notification_as_read,
    mark_all_notifications_as_read, delete_user_notification,
    get_or_create_preferences, update_preferences, evaluate_and_generate_smart_reminders
)

router = APIRouter()

@router.get("", response_model=NotificationListResponse)
def get_notifications(
    unread_only: bool = Query(False, description="Filter only unread notifications"),
    notification_type: Optional[NotificationTypeEnum] = Query(None, description="Filter by notification type"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve paginated notifications for the current authenticated user."""
    items, total, unread = list_user_notifications(
        db=db,
        user_id=current_user.id,
        unread_only=unread_only,
        notification_type=notification_type,
        limit=limit,
        offset=offset
    )
    return NotificationListResponse(
        notifications=[NotificationResponse.model_validate(n) for n in items],
        total=total,
        unread_count=unread
    )

@router.get("/unread-count", response_model=dict)
def get_user_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the active unread notification count."""
    count = get_unread_count(db, current_user.id)
    return {"unread_count": count}

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a specific notification as read."""
    notif = mark_notification_as_read(db, current_user.id, notification_id)
    return NotificationResponse.model_validate(notif)

@router.post("/mark-all-read", response_model=dict)
def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications for the user as read."""
    updated = mark_all_notifications_as_read(db, current_user.id)
    return {"message": "All notifications marked as read", "updated_count": updated}

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an individual notification."""
    delete_user_notification(db, current_user.id, notification_id)
    return None

@router.get("/preferences", response_model=NotificationPreferencesResponse)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the notification preferences for the current user."""
    prefs = get_or_create_preferences(db, current_user.id)
    return NotificationPreferencesResponse.model_validate(prefs)

@router.put("/preferences", response_model=NotificationPreferencesResponse)
def save_preferences(
    payload: NotificationPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update notification preferences for the current user."""
    prefs = update_preferences(db, current_user.id, payload)
    return NotificationPreferencesResponse.model_validate(prefs)

@router.post("/check-reminders", response_model=List[NotificationResponse])
def trigger_smart_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Evaluate telemetry and routine adherence state to trigger intelligent reminders."""
    created = evaluate_and_generate_smart_reminders(db, current_user.id)
    return [NotificationResponse.model_validate(n) for n in created]
