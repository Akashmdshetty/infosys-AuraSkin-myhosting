from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import json

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models import User, ProgressRecord, RoutineAdherenceRecord
from app.schemas.progress import (
    ProgressRecordResponse, ProgressSnapshotCreate, RoutineAdherenceCreate,
    RoutineAdherenceResponse, ProgressTrendsResponse, BeforeAfterComparisonResponse
)
from app.services.progress_tracking_service import (
    record_progress_snapshot, record_routine_adherence,
    get_progress_trends, get_before_after_comparison
)

router = APIRouter()

@router.get("/history", response_model=List[ProgressRecordResponse])
def get_progress_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full chronological history of skin health progress records."""
    records = db.query(ProgressRecord).filter(
        ProgressRecord.user_id == current_user.id
    ).order_by(ProgressRecord.recorded_at.desc()).all()

    results: List[ProgressRecordResponse] = []
    for r in records:
        c_levels = json.loads(r.concern_levels) if r.concern_levels else {}
        results.append(ProgressRecordResponse(
            id=r.id,
            user_id=r.user_id,
            assessment_id=r.assessment_id,
            total_score=r.total_score,
            skin_condition_score=r.skin_condition_score,
            lifestyle_score=r.lifestyle_score,
            sleep_score=r.sleep_score,
            routine_consistency_score=r.routine_consistency_score,
            hydration_score=r.hydration_score,
            concern_levels=c_levels,
            barrier_status=r.barrier_status,
            notes=r.notes,
            recorded_at=r.recorded_at
        ))
    return results

@router.post("/snapshot", response_model=ProgressRecordResponse, status_code=status.HTTP_201_CREATED)
def create_progress_snapshot(
    request: ProgressSnapshotCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record a new longitudinal skin health assessment snapshot."""
    r = record_progress_snapshot(
        db=db,
        user=current_user,
        notes=request.notes,
        concern_levels=request.concern_levels
    )
    c_levels = json.loads(r.concern_levels) if r.concern_levels else {}
    return ProgressRecordResponse(
        id=r.id,
        user_id=r.user_id,
        assessment_id=r.assessment_id,
        total_score=r.total_score,
        skin_condition_score=r.skin_condition_score,
        lifestyle_score=r.lifestyle_score,
        sleep_score=r.sleep_score,
        routine_consistency_score=r.routine_consistency_score,
        hydration_score=r.hydration_score,
        concern_levels=c_levels,
        barrier_status=r.barrier_status,
        notes=r.notes,
        recorded_at=r.recorded_at
    )

@router.post("/adherence", response_model=RoutineAdherenceResponse)
def log_routine_adherence(
    request: RoutineAdherenceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log daily AM/PM skincare routine completion and adherence rate."""
    rec = record_routine_adherence(
        db=db,
        user=current_user,
        date_str=request.date,
        morning_completed=request.morning_completed,
        evening_completed=request.evening_completed,
        completed_steps=request.completed_steps,
        missed_steps=request.missed_steps,
        notes=request.notes
    )
    return RoutineAdherenceResponse(
        id=rec.id,
        user_id=rec.user_id,
        date=rec.date,
        morning_completed=rec.morning_completed,
        evening_completed=rec.evening_completed,
        completed_steps=json.loads(rec.completed_steps) if rec.completed_steps else [],
        missed_steps=json.loads(rec.missed_steps) if rec.missed_steps else [],
        adherence_rate=rec.adherence_rate,
        notes=rec.notes,
        created_at=rec.created_at
    )

@router.get("/adherence", response_model=List[RoutineAdherenceResponse])
def get_routine_adherence(
    days: int = Query(14, description="Number of past days to retrieve"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve recent routine adherence logs."""
    records = db.query(RoutineAdherenceRecord).filter(
        RoutineAdherenceRecord.user_id == current_user.id
    ).order_by(RoutineAdherenceRecord.date.desc()).limit(days).all()

    return [
        RoutineAdherenceResponse(
            id=r.id,
            user_id=r.user_id,
            date=r.date,
            morning_completed=r.morning_completed,
            evening_completed=r.evening_completed,
            completed_steps=json.loads(r.completed_steps) if r.completed_steps else [],
            missed_steps=json.loads(r.missed_steps) if r.missed_steps else [],
            adherence_rate=r.adherence_rate,
            notes=r.notes,
            created_at=r.created_at
        )
        for r in records
    ]

@router.get("/trends", response_model=ProgressTrendsResponse)
def get_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate multi-dimensional score trends, improvement rates, and trajectory analytics."""
    return get_progress_trends(db, current_user)

@router.get("/comparison", response_model=BeforeAfterComparisonResponse)
def get_before_after(
    baseline_id: Optional[int] = Query(None, description="Optional baseline progress snapshot ID"),
    current_id: Optional[int] = Query(None, description="Optional comparison snapshot ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate deterministic Before / After clinical progress comparison with IMPROVED/STABLE/DECLINED status."""
    return get_before_after_comparison(db, current_user, baseline_id=baseline_id, current_id=current_id)
