from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base

class RoleEnum(str, enum.Enum):
    USER = "USER"
    SKINCARE_CONSULTANT = "SKINCARE_CONSULTANT"
    DERMATOLOGIST = "DERMATOLOGIST"
    ADMIN = "ADMIN"

class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email"),)

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.USER, nullable=False)
    requested_role = Column(Enum(RoleEnum), default=RoleEnum.USER, nullable=True)
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.VERIFIED, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    age = Column(Integer, nullable=True)
    country = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # One‑to‑one relationships
    skin_profile = relationship("SkinProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    lifestyle_profile = relationship("LifestyleProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    professional_profile = relationship("ProfessionalProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

    # One‑to‑many relationships
    sleep_records = relationship("SleepRecord", back_populates="user", cascade="all, delete-orphan")
    hydration_records = relationship("HydrationRecord", back_populates="user", cascade="all, delete-orphan")
    environment_records = relationship("EnvironmentalExposure", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("SkinAssessment", back_populates="user", cascade="all, delete-orphan")
    health_scores = relationship("SkinHealthScore", back_populates="user", cascade="all, delete-orphan")
    routines = relationship("SkincareRoutine", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    product_recommendations = relationship("ProductRecommendation", back_populates="user", cascade="all, delete-orphan")
    progress_records = relationship("ProgressRecord", back_populates="user", cascade="all, delete-orphan")
    routine_adherence_records = relationship("RoutineAdherenceRecord", back_populates="user", cascade="all, delete-orphan")
    email_verification_tokens = relationship("EmailVerificationToken", cascade="all, delete-orphan", foreign_keys="EmailVerificationToken.user_id")
    password_reset_tokens = relationship("PasswordResetToken", cascade="all, delete-orphan", foreign_keys="PasswordResetToken.user_id")
    consultations_as_client = relationship("ConsultationRequest", cascade="all, delete-orphan", foreign_keys="[ConsultationRequest.client_id]", back_populates="client")
    consultations_as_professional = relationship("ConsultationRequest", cascade="all, delete-orphan", foreign_keys="[ConsultationRequest.professional_id]", back_populates="professional")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    notification_preferences = relationship("NotificationPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")

