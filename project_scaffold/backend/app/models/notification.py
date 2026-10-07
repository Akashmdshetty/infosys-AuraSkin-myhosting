from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base

class NotificationTypeEnum(str, enum.Enum):
    AM_ROUTINE = "AM_ROUTINE"
    PM_ROUTINE = "PM_ROUTINE"
    HYDRATION = "HYDRATION"
    SLEEP = "SLEEP"
    REPLENISHMENT = "REPLENISHMENT"
    MILESTONE = "MILESTONE"
    SYSTEM = "SYSTEM"

class NotificationPriorityEnum(str, enum.Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    URGENT = "URGENT"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationTypeEnum), default=NotificationTypeEnum.SYSTEM, nullable=False, index=True)
    priority = Column(Enum(NotificationPriorityEnum), default=NotificationPriorityEnum.NORMAL, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime, nullable=True)
    action_url = Column(String(255), nullable=True)
    metadata_json = Column(Text, nullable=True)  # Optional JSON extra data
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="notifications")


class NotificationPreferences(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    email_enabled = Column(Boolean, default=True, nullable=False)
    in_app_enabled = Column(Boolean, default=True, nullable=False)
    am_routine_reminder = Column(Boolean, default=True, nullable=False)
    pm_routine_reminder = Column(Boolean, default=True, nullable=False)
    hydration_reminder = Column(Boolean, default=True, nullable=False)
    sleep_reminder = Column(Boolean, default=True, nullable=False)
    replenishment_reminder = Column(Boolean, default=True, nullable=False)
    milestone_alerts = Column(Boolean, default=True, nullable=False)
    quiet_hours_enabled = Column(Boolean, default=False, nullable=False)
    quiet_hours_start = Column(String(10), default="22:00", nullable=True)
    quiet_hours_end = Column(String(10), default="07:00", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notification_preferences")
