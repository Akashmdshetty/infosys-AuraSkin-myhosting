from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any

# Skin Assessment Schemas
class SkinAssessmentRequest(BaseModel):
    notes: Optional[str] = None

class SkinAssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    primary_concern: str
    secondary_concerns: List[str]
    risk_factors: List[str]
    supporting_factors: List[str]
    data_completeness: float
    confidence_score: float
    raw_payload: Optional[Dict[str, Any]] = None
    created_at: datetime

# Skin Score Breakdown
class ScoreComponentDetail(BaseModel):
    earned: float
    max_possible: float
    label: str
    explanation: str
    normalized_score: Optional[float] = None
    weight: Optional[float] = None

class SkinHealthScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    assessment_id: Optional[int]
    total_score: int
    skin_condition_score: int
    lifestyle_score: int
    sleep_score: int
    routine_consistency_score: int
    hydration_score: int
    breakdown_components: List[ScoreComponentDetail]
    top_impact_factors: List[str]
    created_at: datetime

# Skincare Routine Step & Response
class RoutineStep(BaseModel):
    step_number: int
    category: str
    product_type: str
    key_ingredients: List[str]
    instructions: str
    frequency: str
    safety_notes: Optional[str] = None

class SkincareRoutineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    assessment_id: Optional[int]
    morning_routine: List[RoutineStep]
    evening_routine: List[RoutineStep]
    weekly_routine: List[RoutineStep]
    seasonal_notes: Optional[str] = None
    safety_notes: Optional[str] = None
    created_at: datetime

# Recommendations Schema
class RecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    assessment_id: Optional[int]
    recommendation_type: str
    ingredient_or_category: str
    reason: str
    user_factor_trigger: Optional[str] = None
    target_concern: Optional[str] = None
    precautions: Optional[str] = None
    evidence_reference: Optional[str] = None
    created_at: datetime

# Evidence Knowledge Base Schema
class IngredientEvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ingredient_name: str
    category: str
    primary_benefits: str
    suitable_skin_types: List[str]
    target_concerns: List[str]
    conflicting_ingredients: List[str]
    sensitivity_warnings: Optional[str] = None
    evidence_level: str
    source_reference: str
    review_date: Optional[str] = None

# Full 18-Part Skin Intelligence Report
class SkinIntelligenceReport(BaseModel):
    # 1. User Summary
    user_summary: Dict[str, Any]
    # 2. Skin Profile
    skin_profile: Dict[str, Any]
    # 3. Overall Skin Health Score
    overall_skin_health_score: int
    # 4. Score Breakdown
    score_breakdown: List[ScoreComponentDetail]
    # 5. Primary Concern
    primary_concern: str
    # 6. Secondary Concerns
    secondary_concerns: List[str]
    # 7. Risk Factors
    risk_factors: List[str]
    # 8. Positive Factors
    positive_factors: List[str]
    # 9. Personalized Morning Routine
    morning_routine: List[RoutineStep]
    # 10. Personalized Evening Routine
    evening_routine: List[RoutineStep]
    # 11. Weekly Plan
    weekly_routine: List[RoutineStep]
    # 12. Ingredient Recommendations
    ingredient_recommendations: List[RecommendationResponse]
    # 13. Product-category Recommendations
    product_category_recommendations: List[RecommendationResponse]
    # 14. Why These Recommendations?
    why_these_recommendations: List[Dict[str, str]]
    # 15. Safety Notes
    safety_notes: List[str]
    # 16. Evidence/References
    evidence_references: List[Dict[str, str]]
    # 17. Assessment Confidence
    assessment_confidence: float
    data_completeness: float
    confidence_explanation: str
    # 18. Recommended Next Steps
    recommended_next_steps: List[str]
    generated_at: datetime
