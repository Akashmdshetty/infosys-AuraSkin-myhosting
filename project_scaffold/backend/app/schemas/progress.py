from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ProgressSnapshotCreate(BaseModel):
    notes: Optional[str] = None
    concern_levels: Optional[Dict[str, int]] = None  # e.g. {"Acne": 2, "Redness": 1}

class ProgressRecordResponse(BaseModel):
    id: int
    user_id: int
    assessment_id: Optional[int] = None
    total_score: int
    skin_condition_score: int
    lifestyle_score: int
    sleep_score: int
    routine_consistency_score: int
    hydration_score: int
    concern_levels: Optional[Dict[str, int]] = None
    barrier_status: Optional[str] = "HEALTHY"
    notes: Optional[str] = None
    recorded_at: datetime

    class Config:
        from_attributes = True

class RoutineAdherenceCreate(BaseModel):
    date: Optional[str] = None  # YYYY-MM-DD, defaults to today
    morning_completed: bool = False
    evening_completed: bool = False
    completed_steps: Optional[List[str]] = []
    missed_steps: Optional[List[str]] = []
    notes: Optional[str] = None

class RoutineAdherenceResponse(BaseModel):
    id: int
    user_id: int
    date: str
    morning_completed: bool
    evening_completed: bool
    completed_steps: List[str]
    missed_steps: List[str]
    adherence_rate: float
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ConcernTrendItem(BaseModel):
    concern: str
    initial_severity: int
    current_severity: int
    status: str  # "IMPROVED", "STABLE", "WORSENED"

class ScoreTrendPoint(BaseModel):
    date: str
    total_score: int
    skin_condition_score: int
    lifestyle_score: int
    sleep_score: int
    hydration_score: int
    routine_consistency_score: int

class ProgressTrendsResponse(BaseModel):
    overall_change: str               # e.g. "+15.5%"
    trend: str                        # "improving", "stable", "declining"
    routine_adherence_change: str     # e.g. "+20%"
    hydration_change: str             # e.g. "+12%"
    sleep_change: str                 # e.g. "+5%"
    lifestyle_change: str             # e.g. "+10%"
    major_improvements: List[str]
    historical_points: List[ScoreTrendPoint]
    recent_adherence_rate: float      # average 0.0 - 1.0
    concern_trends: List[ConcernTrendItem]

class MetricComparisonDetail(BaseModel):
    metric_name: str
    baseline_value: float
    current_value: float
    change_value: float
    change_percentage: str
    status: str  # "IMPROVED", "STABLE", "DECLINED"
    interpretation: str

class BeforeAfterComparisonResponse(BaseModel):
    baseline_date: str
    current_date: str
    baseline_score: int
    current_score: int
    overall_status: str  # "IMPROVED", "STABLE", "DECLINED"
    metrics: List[MetricComparisonDetail]
    concern_comparisons: List[ConcernTrendItem]
    clinical_summary: str
