from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class IngredientInteractionDetail(BaseModel):
    with_ingredient: str
    interaction_type: str  # CONFLICT, CAUTION, SYNERGISTIC, NEUTRAL
    severity: str          # HIGH, MEDIUM, LOW, NONE
    explanation: str

class IngredientDetail(BaseModel):
    name: str
    category: str
    primary_benefits: str
    suitable_skin_types: List[str]
    target_concerns: List[str]
    conflicting_ingredients: List[str]
    sensitivity_warnings: str
    evidence_level: str
    source_reference: str
    review_date: Optional[str] = "2026-01-01"
    common_uses: Optional[str] = None
    precautions: Optional[str] = None
    interactions: Optional[List[IngredientInteractionDetail]] = []

class IngredientSuitabilityRequest(BaseModel):
    ingredient_name: Optional[str] = None
    ingredients_list: Optional[List[str]] = None
    custom_formula_text: Optional[str] = None

class IngredientAnalysisResult(BaseModel):
    ingredient: str
    suitable: bool
    reason: str
    severity: str  # HIGH, MEDIUM, LOW, SAFE
    category: Optional[str] = None
    benefits: Optional[str] = None
    precautions: Optional[str] = None
    evidence_reference: Optional[str] = None

class IngredientSuitabilityResponse(BaseModel):
    user_skin_type: str
    has_compromised_barrier: bool
    total_analyzed: int
    suitable_count: int
    conflict_count: int
    results: List[IngredientAnalysisResult]
    overall_safety_summary: str
    general_precautions: List[str]

class IngredientInteractionCheckRequest(BaseModel):
    ingredients: List[str]

class IngredientInteractionCheckResponse(BaseModel):
    has_conflicts: bool
    conflict_count: int
    interactions: List[IngredientInteractionDetail]
    recommendation: str
