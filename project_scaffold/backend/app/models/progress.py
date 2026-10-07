from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class ProgressRecord(Base):
    __tablename__ = "progress_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id"), nullable=True)
    total_score = Column(Integer, nullable=False)            # 0 - 100
    skin_condition_score = Column(Integer, nullable=False)   # 0 - 35
    lifestyle_score = Column(Integer, nullable=False)        # 0 - 20
    sleep_score = Column(Integer, nullable=False)            # 0 - 15
    routine_consistency_score = Column(Integer, nullable=False) # 0 - 20
    hydration_score = Column(Integer, nullable=False)        # 0 - 10
    concern_levels = Column(Text, nullable=True)             # JSON dict of concern ratings e.g. {"Acne": 2, "Redness": 1}
    barrier_status = Column(String, nullable=True)           # "HEALTHY", "COMPROMISED", "IMPROVING"
    notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="progress_records")


class RoutineAdherenceRecord(Base):
    __tablename__ = "routine_adherence_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(String, nullable=False, index=True)        # YYYY-MM-DD
    morning_completed = Column(Boolean, default=False, nullable=False)
    evening_completed = Column(Boolean, default=False, nullable=False)
    completed_steps = Column(Text, nullable=True)            # JSON array of completed steps
    missed_steps = Column(Text, nullable=True)               # JSON array of missed steps
    adherence_rate = Column(Float, default=0.0, nullable=False)  # 0.0 to 1.0 (or 0% to 100%)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="routine_adherence_records")
