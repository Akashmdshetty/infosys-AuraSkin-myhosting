from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    brand: str
    category: str
    description: str
    price: float
    ingredients: str
    active_ingredients: str
    skin_types: List[str]
    skin_concerns: List[str]
    fragrance_free: bool = True
    alcohol_free: bool = True
    cruelty_free: bool = True
    status: str = "ACTIVE"
    image_url: Optional[str] = None

    @field_validator("skin_types", "skin_concerns", mode="before")
    @classmethod
    def parse_csv_or_list(cls, v: Any) -> List[str]:
        if isinstance(v, list):
            return [str(x).strip() for x in v if str(x).strip()]
        if isinstance(v, str):
            return [x.strip() for x in v.split(",") if x.strip()]
        return []

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProductScoreBreakdown(BaseModel):
    skin_type_points: int = 20
    concern_match_points: int = 20
    ingredient_compatibility_points: int = 20
    barrier_support_points: int = 15
    routine_compatibility_points: int = 15
    total_score: int = 90

class ProductSuitabilityDetail(BaseModel):
    product: ProductResponse
    suitability_score: int  # 0 to 100
    recommended: bool
    reasons: List[str]
    matching_concerns: List[str]
    compatible_ingredients: List[str]
    potential_conflicts: List[str]
    price: float
    budget_fit: str  # "EXCELLENT", "GOOD", "ABOVE_BUDGET"
    score_breakdown: Optional[ProductScoreBreakdown] = None

class AddToRoutineRequest(BaseModel):
    time_of_day: str = "AM"  # "AM", "PM", or "BOTH"
    notes: Optional[str] = None

class ProductRecommendationRequest(BaseModel):
    category: Optional[str] = None
    budget_max: Optional[float] = None  # in INR ₹
    target_concern: Optional[str] = None
    limit: Optional[int] = 10

class ProductRecommendationResponse(BaseModel):
    user_skin_type: str
    primary_concern: str
    total_matches: int
    recommendations: List[ProductSuitabilityDetail]
    budget_filter_applied: Optional[float] = None
    top_recommended_category: Optional[str] = None

class ProductComparisonRequest(BaseModel):
    product_ids: List[int]

class ProductComparisonItem(BaseModel):
    product: ProductResponse
    suitability_score: int
    is_safe_for_user: bool
    reasons: List[str]
    allergen_conflicts: List[str]
    sensitivity_conflicts: List[str]
    key_actives: List[str]
    target_concerns_addressed: List[str]
    barrier_support: bool
    fragrance_free: bool
    price: float

class ProductComparisonResponse(BaseModel):
    compared_products: List[ProductComparisonItem]
    best_match_id: Optional[int] = None
    best_value_id: Optional[int] = None
    summary_verdict: str

class AlternativeProductsResponse(BaseModel):
    unsuitable_product: ProductResponse
    unsuitability_reason: str
    alternatives: List[ProductSuitabilityDetail]
