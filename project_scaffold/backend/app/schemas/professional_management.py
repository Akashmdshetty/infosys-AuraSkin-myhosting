from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.models import RoleEnum, VerificationStatus
from app.schemas.user import UserResponse

class ClientSkinProfileDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    skin_type: str = "NOT_CONFIGURED"
    concerns: List[str] = []
    allergies: List[str] = []
    sensitivities: List[str] = []
    lifestyle_sleep: Optional[float] = None
    lifestyle_hydration: Optional[float] = None
    lifestyle_stress: Optional[str] = None
    lifestyle_sun_exposure: Optional[str] = None

class ClientDetailedSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    age: Optional[int] = None
    country: Optional[str] = None
    created_at: datetime
    skin_profile: ClientSkinProfileDetail
    latest_score: Optional[float] = None
    latest_primary_concern: Optional[str] = None
    assessment_confidence: Optional[float] = None
    total_progress_snapshots: int = 0
    total_routines: int = 0
    total_consultations: int = 0
    pending_consultations: int = 0
    clinical_risk_tier: str = "LOW"  # "HIGH", "MODERATE", "LOW"

class RoutineStepItem(BaseModel):
    step_number: int
    step_name: str
    product_category: str
    recommended_product_name: Optional[str] = None
    application_frequency: str = "Daily"
    instructions: Optional[str] = None
    key_active_ingredients: Optional[List[str]] = []

class RecommendRoutinePayload(BaseModel):
    morning_routine: List[Dict[str, Any]]
    evening_routine: List[Dict[str, Any]]
    weekly_routine: Optional[List[Dict[str, Any]]] = None
    safety_notes: Optional[str] = None
    seasonal_notes: Optional[str] = None
    specialist_guidance: Optional[str] = None
    clinical_followup_weeks: Optional[int] = None

class RecommendProductsPayload(BaseModel):
    product_ids: List[int]
    notes: Optional[str] = None
    usage_schedule: Optional[Dict[str, str]] = None  # e.g. {"1": "Morning after toner", "4": "Night 2x weekly"}

class AdminRoleUpdatePayload(BaseModel):
    role: RoleEnum
    verification_status: Optional[VerificationStatus] = None

class AdminStatusUpdatePayload(BaseModel):
    status: VerificationStatus

class InitiateContactPayload(BaseModel):
    subject: str
    message: str
    priority_flag: Optional[str] = "NORMAL"  # NORMAL, URGENT, CLINICAL_ALERT

class AdminContactPayload(BaseModel):
    target_user_id: int
    subject: str
    message: str
    advisory_type: Optional[str] = "ADMINISTRATIVE_NOTICE" # ADMINISTRATIVE_NOTICE, VERIFICATION_INQUIRY, COMPLIANCE

class IngredientRecommendationItem(BaseModel):
    name: str
    category: str = "Active" # Botanical, Peptide, Retinoid, Acid, Antioxidant, Clinical Active
    concentration: Optional[str] = None # e.g. "0.05%", "2%", "10%"
    frequency: str = "Daily" # "AM only", "PM only", "2x weekly", "Daily"
    target_concern: str
    application_notes: Optional[str] = None

class RecommendIngredientsPayload(BaseModel):
    ingredients: List[IngredientRecommendationItem]
    clinical_guidance: Optional[str] = None
    contraindications_to_avoid: Optional[List[str]] = []


