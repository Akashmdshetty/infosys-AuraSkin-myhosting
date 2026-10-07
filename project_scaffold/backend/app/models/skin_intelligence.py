from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class SkinAssessment(Base):
    __tablename__ = "skin_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    primary_concern = Column(String, nullable=False)
    secondary_concerns = Column(Text, nullable=True)  # JSON or comma-separated string
    risk_factors = Column(Text, nullable=True)        # JSON string
    supporting_factors = Column(Text, nullable=True)  # JSON string
    data_completeness = Column(Float, nullable=False, default=1.0)
    confidence_score = Column(Float, nullable=False, default=1.0)
    raw_payload = Column(Text, nullable=True)          # Stored JSON string summary
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="assessments")

class SkinHealthScore(Base):
    __tablename__ = "skin_health_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id"), nullable=True, index=True)
    total_score = Column(Integer, nullable=False)            # Out of 100
    skin_condition_score = Column(Integer, nullable=False)   # Out of 35
    lifestyle_score = Column(Integer, nullable=False)        # Out of 20
    sleep_score = Column(Integer, nullable=False)            # Out of 15
    routine_consistency_score = Column(Integer, nullable=False) # Out of 20
    hydration_score = Column(Integer, nullable=False)        # Out of 10
    score_breakdown = Column(Text, nullable=True)            # Detailed explanation text/JSON
    top_impact_factors = Column(Text, nullable=True)         # Calculated impact drivers JSON
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="health_scores")

class SkincareRoutine(Base):
    __tablename__ = "skincare_routines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id"), nullable=True, index=True)
    morning_routine = Column(Text, nullable=False)           # JSON string of steps
    evening_routine = Column(Text, nullable=False)           # JSON string of steps
    weekly_routine = Column(Text, nullable=True)            # JSON string of weekly treatments
    seasonal_notes = Column(Text, nullable=True)
    safety_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="routines")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id"), nullable=True, index=True)
    recommendation_type = Column(String, nullable=False)    # INGREDIENT or PRODUCT_CATEGORY
    ingredient_or_category = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    user_factor_trigger = Column(String, nullable=True)
    target_concern = Column(String, nullable=True)
    precautions = Column(Text, nullable=True)
    evidence_reference = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="recommendations")

class IngredientEvidence(Base):
    __tablename__ = "ingredient_evidence"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)
    primary_benefits = Column(Text, nullable=False)
    suitable_skin_types = Column(Text, nullable=False)       # JSON or CSV
    target_concerns = Column(Text, nullable=False)           # JSON or CSV
    conflicting_ingredients = Column(Text, nullable=True)    # JSON or CSV
    sensitivity_warnings = Column(Text, nullable=True)
    evidence_level = Column(String, nullable=False, default="High (Peer-Reviewed / Clinical)")
    source_reference = Column(Text, nullable=False)
    review_date = Column(String, nullable=True, default="2026-01-01")
