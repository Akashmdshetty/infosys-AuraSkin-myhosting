from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.notification import NotificationTypeEnum, NotificationPriorityEnum

class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: NotificationTypeEnum = NotificationTypeEnum.SYSTEM
    priority: NotificationPriorityEnum = NotificationPriorityEnum.NORMAL
    action_url: Optional[str] = None
    metadata_json: Optional[str] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int

class NotificationPreferencesResponse(BaseModel):
    user_id: int
    email_enabled: bool = True
    in_app_enabled: bool = True
    am_routine_reminder: bool = True
    pm_routine_reminder: bool = True
    hydration_reminder: bool = True
    sleep_reminder: bool = True
    replenishment_reminder: bool = True
    milestone_alerts: bool = True
    quiet_hours_enabled: bool = False
    quiet_hours_start: Optional[str] = "22:00"
    quiet_hours_end: Optional[str] = "07:00"
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class NotificationPreferencesUpdate(BaseModel):
    email_enabled: Optional[bool] = None
    in_app_enabled: Optional[bool] = None
    am_routine_reminder: Optional[bool] = None
    pm_routine_reminder: Optional[bool] = None
    hydration_reminder: Optional[bool] = None
    sleep_reminder: Optional[bool] = None
    replenishment_reminder: Optional[bool] = None
    milestone_alerts: Optional[bool] = None
    quiet_hours_enabled: Optional[bool] = None
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None

    model_config = ConfigDict(extra="ignore")
