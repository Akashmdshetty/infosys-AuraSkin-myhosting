from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base

class SkinTypeEnum(str, enum.Enum):
    NORMAL = "NORMAL"
    DRY = "DRY"
    OILY = "OILY"
    COMBINATION = "COMBINATION"
    SENSITIVE = "SENSITIVE"

# Concerns stored as comma‑separated values for simplicity
class SkinProfile(Base):
    __tablename__ = "skin_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    skin_type = Column(Enum(SkinTypeEnum), nullable=False)
    skin_concerns = Column(Text)  # e.g. "ACNE,DRY_SKIN"
    allergies = Column(Text)
    sensitivities = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="skin_profile")
