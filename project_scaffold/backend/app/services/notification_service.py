import logging
import json
from datetime import datetime, date, timedelta
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import (
    User, Notification, NotificationPreferences, NotificationTypeEnum, NotificationPriorityEnum,
    RoutineAdherenceRecord, HydrationRecord, SleepRecord, SkincareRoutine, ProgressRecord, SkinHealthScore
)
from app.schemas.notification import (
    NotificationCreate, NotificationPreferencesUpdate, NotificationResponse, NotificationPreferencesResponse
)
from app.services.email_service import send_notification_email

logger = logging.getLogger(__name__)

def get_or_create_preferences(db: Session, user_id: int) -> NotificationPreferences:
    prefs = db.query(NotificationPreferences).filter(NotificationPreferences.user_id == user_id).first()
    if not prefs:
        prefs = NotificationPreferences(
            user_id=user_id,
            email_enabled=True,
            in_app_enabled=True,
            am_routine_reminder=True,
            pm_routine_reminder=True,
            hydration_reminder=True,
            sleep_reminder=True,
            replenishment_reminder=True,
            milestone_alerts=True,
            quiet_hours_enabled=False,
            quiet_hours_start="22:00",
            quiet_hours_end="07:00"
        )
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return prefs

def update_preferences(db: Session, user_id: int, updates: NotificationPreferencesUpdate) -> NotificationPreferences:
    prefs = get_or_create_preferences(db, user_id)
    update_data = updates.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(prefs, field, val)
    prefs.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(prefs)
    logger.info("Updated notification preferences for user_id=%s", user_id)
    return prefs

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: NotificationTypeEnum = NotificationTypeEnum.SYSTEM,
    priority: NotificationPriorityEnum = NotificationPriorityEnum.NORMAL,
    action_url: Optional[str] = None,
    metadata_json: Optional[str] = None,
    force_email: bool = False
) -> Optional[Notification]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    prefs = get_or_create_preferences(db, user_id)

    # Check category preference
    if notification_type == NotificationTypeEnum.AM_ROUTINE and not prefs.am_routine_reminder:
        return None
    if notification_type == NotificationTypeEnum.PM_ROUTINE and not prefs.pm_routine_reminder:
        return None
    if notification_type == NotificationTypeEnum.HYDRATION and not prefs.hydration_reminder:
        return None
    if notification_type == NotificationTypeEnum.SLEEP and not prefs.sleep_reminder:
        return None
    if notification_type == NotificationTypeEnum.REPLENISHMENT and not prefs.replenishment_reminder:
        return None
    if notification_type == NotificationTypeEnum.MILESTONE and not prefs.milestone_alerts:
        return None

    notif = None
    if prefs.in_app_enabled:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            is_read=False,
            action_url=action_url,
            metadata_json=metadata_json,
            created_at=datetime.utcnow()
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        logger.info("Created in-app notification id=%s for user_id=%s type=%s", notif.id, user_id, notification_type.value)

    if prefs.email_enabled or force_email:
        send_notification_email(
            to_email=user.email,
            user_name=user.name,
            title=title,
            message_text=message,
            action_url=action_url
        )

    return notif

def list_user_notifications(
    db: Session,
    user_id: int,
    unread_only: bool = False,
    notification_type: Optional[NotificationTypeEnum] = None,
    limit: int = 50,
    offset: int = 0
) -> Tuple[List[Notification], int, int]:
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    if notification_type:
        query = query.filter(Notification.notification_type == notification_type)

    total = query.count()
    unread_count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()

    notifications = query.order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()
    return notifications, total, unread_count

def get_unread_count(db: Session, user_id: int) -> int:
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()

def mark_notification_as_read(db: Session, user_id: int, notification_id: int) -> Notification:
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    notif.is_read = True
    notif.read_at = datetime.utcnow()
    db.commit()
    db.refresh(notif)
    return notif

def mark_all_notifications_as_read(db: Session, user_id: int) -> int:
    now = datetime.utcnow()
    updated = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True, "read_at": now}, synchronize_session=False)
    db.commit()
    logger.info("Marked %s notifications as read for user_id=%s", updated, user_id)
    return updated

def delete_user_notification(db: Session, user_id: int, notification_id: int) -> bool:
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    db.delete(notif)
    db.commit()
    return True

def evaluate_and_generate_smart_reminders(db: Session, user_id: int) -> List[Notification]:
    """
    Analyzes user telemetry, adherence, and routine state to dispatch personalized reminders
    without creating repetitive duplicate reminders in a short time window.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    created_notifs = []
    today_str = date.today().isoformat()
    now = datetime.utcnow()
    one_day_ago = now - timedelta(days=1)

    # 1. AM Routine Reminder check
    today_adherence = db.query(RoutineAdherenceRecord).filter(
        RoutineAdherenceRecord.user_id == user_id,
        RoutineAdherenceRecord.date == today_str
    ).first()

    recent_am_notif = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.notification_type == NotificationTypeEnum.AM_ROUTINE,
        Notification.created_at >= one_day_ago
    ).first()

    if (not today_adherence or not today_adherence.morning_completed) and not recent_am_notif:
        n = create_notification(
            db=db,
            user_id=user_id,
            title="🌅 Morning Skincare Routine Reminder",
            message="Time to protect your skin barrier! Complete your AM routine with antioxidant serum and broad-spectrum SPF.",
            notification_type=NotificationTypeEnum.AM_ROUTINE,
            priority=NotificationPriorityEnum.NORMAL,
            action_url="/progress"
        )
        if n:
            created_notifs.append(n)

    # 2. PM Routine Reminder check
    recent_pm_notif = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.notification_type == NotificationTypeEnum.PM_ROUTINE,
        Notification.created_at >= one_day_ago
    ).first()

    if (not today_adherence or not today_adherence.evening_completed) and not recent_pm_notif:
        n = create_notification(
            db=db,
            user_id=user_id,
            title="🌙 Evening Skincare Protocol",
            message="Support nocturnal cellular repair: cleanse thoroughly and apply your barrier-repairing nighttime active treatment.",
            notification_type=NotificationTypeEnum.PM_ROUTINE,
            priority=NotificationPriorityEnum.NORMAL,
            action_url="/progress"
        )
        if n:
            created_notifs.append(n)

    # 3. Hydration check
    recent_hyd_notif = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.notification_type == NotificationTypeEnum.HYDRATION,
        Notification.created_at >= one_day_ago
    ).first()

    recent_hyd = db.query(HydrationRecord).filter(
        HydrationRecord.user_id == user_id,
        HydrationRecord.recorded_at >= one_day_ago
    ).all()
    total_water = sum(h.water_ml for h in recent_hyd)

    if total_water < 2000 and not recent_hyd_notif:
        n = create_notification(
            db=db,
            user_id=user_id,
            title="💧 Hydration Target Check",
            message=f"You've logged {total_water} ml in the past 24 hours. Boost your cellular hydration with a glass of water to optimize stratum corneum moisture.",
            notification_type=NotificationTypeEnum.HYDRATION,
            priority=NotificationPriorityEnum.LOW,
            action_url="/data-entry"
        )
        if n:
            created_notifs.append(n)

    # 4. Sleep check
    recent_sleep_notif = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.notification_type == NotificationTypeEnum.SLEEP,
        Notification.created_at >= one_day_ago
    ).first()

    latest_sleep = db.query(SleepRecord).filter(
        SleepRecord.user_id == user_id
    ).order_by(SleepRecord.recorded_at.desc()).first()

    if latest_sleep and latest_sleep.sleep_hours < 6.5 and not recent_sleep_notif:
        n = create_notification(
            db=db,
            user_id=user_id,
            title="😴 Sleep & Collagen Synthesis Advisory",
            message=f"Recent sleep log indicated {latest_sleep.sleep_hours}h. Sub-7h sleep impairs epidermal barrier recovery and increases transepidermal water loss (TEWL).",
            notification_type=NotificationTypeEnum.SLEEP,
            priority=NotificationPriorityEnum.NORMAL,
            action_url="/data-entry"
        )
        if n:
            created_notifs.append(n)

    # 5. Adherence Milestone Check
    adherence_count = db.query(RoutineAdherenceRecord).filter(
        RoutineAdherenceRecord.user_id == user_id,
        RoutineAdherenceRecord.adherence_rate >= 0.8
    ).count()

    milestone_targets = [3, 7, 14, 30, 60, 90]
    for m in milestone_targets:
        if adherence_count >= m:
            milestone_key = f"milestone_streak_{m}"
            already_awarded = db.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.notification_type == NotificationTypeEnum.MILESTONE,
                Notification.metadata_json.like(f"%{milestone_key}%")
            ).first()
            if not already_awarded:
                n = create_notification(
                    db=db,
                    user_id=user_id,
                    title=f"🏆 Streak Milestone: {m} Days of Consistent Regimen!",
                    message=f"Outstanding dedication! You've logged {m} days of high adherence. Consistent active ingredient application drives measurable clinical dermal improvement.",
                    notification_type=NotificationTypeEnum.MILESTONE,
                    priority=NotificationPriorityEnum.HIGH,
                    action_url="/progress",
                    metadata_json=json.dumps({"key": milestone_key, "streak": m})
                )
                if n:
                    created_notifs.append(n)
                break

    # 6. Product Replenishment Reminder check
    recent_replenish = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.notification_type == NotificationTypeEnum.REPLENISHMENT,
        Notification.created_at >= (now - timedelta(days=7))
    ).first()

    if adherence_count >= 28 and not recent_replenish:
        n = create_notification(
            db=db,
            user_id=user_id,
            title="📦 Product Replenishment Advisory",
            message="You have been using your daily core regimen for over 4 weeks! Check your active serums and SPF to replenish before running low.",
            notification_type=NotificationTypeEnum.REPLENISHMENT,
            priority=NotificationPriorityEnum.LOW,
            action_url="/products"
        )
        if n:
            created_notifs.append(n)

    return created_notifs
