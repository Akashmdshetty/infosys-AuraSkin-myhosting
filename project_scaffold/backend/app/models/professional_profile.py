from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class ProfessionalProfile(Base):
    __tablename__ = "professional_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    professional_title = Column(String, nullable=True)
    qualifications = Column(Text, nullable=True)
    certifications = Column(Text, nullable=True)
    years_experience = Column(Integer, nullable=True)
    area_of_expertise = Column(String, nullable=True)
    organization = Column(String, nullable=True)
    registration_number = Column(String, nullable=True)
    country = Column(String, nullable=True)
    verification_docs_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="professional_profile")
