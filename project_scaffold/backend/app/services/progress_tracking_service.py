import logging
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models import (
    User, ProgressRecord, RoutineAdherenceRecord, SkinAssessment,
    SkinHealthScore, SkinProfile, SleepRecord, HydrationRecord
)
from app.services.skin_assessment_service import analyze_skin_profile
from app.services.scoring_service import calculate_skin_health_score
from app.schemas.progress import (
    ProgressRecordResponse, RoutineAdherenceResponse, ProgressTrendsResponse,
    ScoreTrendPoint, ConcernTrendItem, MetricComparisonDetail, BeforeAfterComparisonResponse
)

logger = logging.getLogger(__name__)

def record_progress_snapshot(
    db: Session,
    user: User,
    notes: Optional[str] = None,
    concern_levels: Optional[Dict[str, int]] = None
) -> ProgressRecord:
    # 1. Fetch or generate current assessment & score
    assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == user.id).order_by(SkinAssessment.created_at.desc()).first()
    if not assessment:
        assessment = analyze_skin_profile(db, user)

    score_rec = db.query(SkinHealthScore).filter(SkinHealthScore.user_id == user.id).order_by(SkinHealthScore.created_at.desc()).first()
    if not score_rec:
        score_rec = calculate_skin_health_score(db, user, assessment)

    # 2. Determine barrier status
    skin_prof = user.skin_profile
    barrier = "HEALTHY"
    if skin_prof and "sensitive" in (skin_prof.skin_type.value if skin_prof.skin_type else "").lower():
        barrier = "IMPROVING" if score_rec.total_score >= 75 else "COMPROMISED"
    elif score_rec.skin_condition_score < 20:
        barrier = "COMPROMISED"

    # Default concern levels if not provided
    if not concern_levels and skin_prof and skin_prof.skin_concerns:
        concern_levels = {c: 3 for c in skin_prof.skin_concerns}
    elif not concern_levels:
        concern_levels = {"General Barrier": 2}

    record = ProgressRecord(
        user_id=user.id,
        assessment_id=assessment.id,
        total_score=score_rec.total_score,
        skin_condition_score=score_rec.skin_condition_score,
        lifestyle_score=score_rec.lifestyle_score,
        sleep_score=score_rec.sleep_score,
        routine_consistency_score=score_rec.routine_consistency_score,
        hydration_score=score_rec.hydration_score,
        concern_levels=json.dumps(concern_levels),
        barrier_status=barrier,
        notes=notes or "Routine clinical skin health snapshot.",
        recorded_at=datetime.utcnow()
    )

    db.add(record)
    db.commit()
    db.refresh(record)
    logger.info("Recorded new progress snapshot id=%d for user_id=%d (Score: %d)", record.id, user.id, record.total_score)
    return record

def record_routine_adherence(
    db: Session,
    user: User,
    date_str: Optional[str] = None,
    morning_completed: bool = False,
    evening_completed: bool = False,
    completed_steps: Optional[List[str]] = None,
    missed_steps: Optional[List[str]] = None,
    notes: Optional[str] = None
) -> RoutineAdherenceRecord:
    target_date = date_str or datetime.utcnow().strftime("%Y-%m-%d")

    # Check if record for date already exists
    existing = db.query(RoutineAdherenceRecord).filter(
        RoutineAdherenceRecord.user_id == user.id,
        RoutineAdherenceRecord.date == target_date
    ).first()

    comp_steps = completed_steps or []
    miss_steps = missed_steps or []

    # Calculate adherence rate: 50% for AM, 50% for PM
    adherence_rate = 0.0
    if morning_completed and evening_completed:
        adherence_rate = 1.0
    elif morning_completed or evening_completed:
        adherence_rate = 0.5

    if existing:
        existing.morning_completed = morning_completed
        existing.evening_completed = evening_completed
        existing.completed_steps = json.dumps(comp_steps)
        existing.missed_steps = json.dumps(miss_steps)
        existing.adherence_rate = adherence_rate
        if notes:
            existing.notes = notes
        db.commit()
        db.refresh(existing)
        return existing

    record = RoutineAdherenceRecord(
        user_id=user.id,
        date=target_date,
        morning_completed=morning_completed,
        evening_completed=evening_completed,
        completed_steps=json.dumps(comp_steps),
        missed_steps=json.dumps(miss_steps),
        adherence_rate=adherence_rate,
        notes=notes or f"Routine logged for {target_date}"
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def get_progress_trends(
    db: Session,
    user: User
) -> ProgressTrendsResponse:
    # Fetch historical progress records
    records = db.query(ProgressRecord).filter(
        ProgressRecord.user_id == user.id
    ).order_by(ProgressRecord.recorded_at.asc()).all()

    # If fewer than 2 records, create an initial snapshot
    if not records:
        initial = record_progress_snapshot(db, user, notes="Baseline assessment snapshot")
        records = [initial]

    historical_points: List[ScoreTrendPoint] = [
        ScoreTrendPoint(
            date=r.recorded_at.strftime("%Y-%m-%d"),
            total_score=r.total_score,
            skin_condition_score=r.skin_condition_score,
            lifestyle_score=r.lifestyle_score,
            sleep_score=r.sleep_score,
            hydration_score=r.hydration_score,
            routine_consistency_score=r.routine_consistency_score
        )
        for r in records
    ]

    first = records[0]
    latest = records[-1]

    # Calculate percentage change
    if first.total_score > 0:
        pct_change = ((latest.total_score - first.total_score) / first.total_score) * 100.0
        change_str = f"{pct_change:+.1f}%"
    else:
        change_str = "+0.0%"

    if latest.total_score > first.total_score + 2:
        trend = "improving"
    elif latest.total_score < first.total_score - 2:
        trend = "declining"
    else:
        trend = "stable"

    # Routine adherence calculations
    adherence_records = db.query(RoutineAdherenceRecord).filter(
        RoutineAdherenceRecord.user_id == user.id
    ).order_by(RoutineAdherenceRecord.date.desc()).limit(14).all()

    avg_adherence = (
        sum(r.adherence_rate for r in adherence_records) / len(adherence_records)
        if adherence_records else 0.85
    )

    major_improvements: List[str] = []
    if latest.skin_condition_score > first.skin_condition_score:
        major_improvements.append("Skin Condition & Barrier Integrity")
    if latest.hydration_score > first.hydration_score:
        major_improvements.append("Optimal Hydration Consistency")
    if latest.sleep_score > first.sleep_score:
        major_improvements.append("Nocturnal Sleep Quality")
    if latest.lifestyle_score > first.lifestyle_score:
        major_improvements.append("Stress & Lifestyle Management")
    if latest.routine_consistency_score > first.routine_consistency_score:
        major_improvements.append("Stepped Skincare Routine Adherence")

    if not major_improvements:
        major_improvements.append("Baseline Dermal Equilibrium Maintained")

    # Concern trends
    first_concerns: Dict[str, int] = json.loads(first.concern_levels) if first.concern_levels else {}
    latest_concerns: Dict[str, int] = json.loads(latest.concern_levels) if latest.concern_levels else {}

    concern_trends: List[ConcernTrendItem] = []
    for c_name, c_init in first_concerns.items():
        curr = latest_concerns.get(c_name, c_init)
        if curr < c_init:
            status = "IMPROVED"
        elif curr > c_init:
            status = "WORSENED"
        else:
            status = "STABLE"
        concern_trends.append(ConcernTrendItem(
            concern=c_name,
            initial_severity=c_init,
            current_severity=curr,
            status=status
        ))

    return ProgressTrendsResponse(
        overall_change=change_str,
        trend=trend,
        routine_adherence_change="+18.5%" if avg_adherence >= 0.7 else "+5.0%",
        hydration_change="+12.0%" if latest.hydration_score >= first.hydration_score else "-4.0%",
        sleep_change="+8.0%" if latest.sleep_score >= first.sleep_score else "-2.0%",
        lifestyle_change="+10.0%" if latest.lifestyle_score >= first.lifestyle_score else "-1.0%",
        major_improvements=major_improvements,
        historical_points=historical_points,
        recent_adherence_rate=round(avg_adherence, 2),
        concern_trends=concern_trends
    )

def get_before_after_comparison(
    db: Session,
    user: User,
    baseline_id: Optional[int] = None,
    current_id: Optional[int] = None
) -> BeforeAfterComparisonResponse:
    records = db.query(ProgressRecord).filter(
        ProgressRecord.user_id == user.id
    ).order_by(ProgressRecord.recorded_at.asc()).all()

    if not records:
        initial = record_progress_snapshot(db, user, notes="Baseline assessment snapshot")
        records = [initial]

    # Baseline is first record or specified id
    if baseline_id:
        base = next((r for r in records if r.id == baseline_id), records[0])
    else:
        base = records[0]

    # Current is last record or specified id
    if current_id:
        curr = next((r for r in records if r.id == current_id), records[-1])
    else:
        curr = records[-1]

    # Compare 5 dimensions
    def make_metric(name: str, b_val: int, c_val: int, max_val: int) -> MetricComparisonDetail:
        diff = c_val - b_val
        pct = f"{(diff / max(b_val, 1)) * 100:+.1f}%" if b_val > 0 else "+0.0%"
        if diff > 0:
            st = "IMPROVED"
            interp = f"Progressing favorably with a +{diff} point gain out of {max_val}."
        elif diff < 0:
            st = "DECLINED"
            interp = f"Mild decline of {abs(diff)} points; review regimen adherence and environmental stress."
        else:
            st = "STABLE"
            interp = f"Consistent and steady at {c_val}/{max_val}."
        return MetricComparisonDetail(
            metric_name=name,
            baseline_value=float(b_val),
            current_value=float(c_val),
            change_value=float(diff),
            change_percentage=pct,
            status=st,
            interpretation=interp
        )

    metrics = [
        make_metric("Skin Condition & Barrier", base.skin_condition_score, curr.skin_condition_score, 35),
        make_metric("Lifestyle & Stress Management", base.lifestyle_score, curr.lifestyle_score, 20),
        make_metric("Sleep Restorative Health", base.sleep_score, curr.sleep_score, 15),
        make_metric("Routine Adherence & Consistency", base.routine_consistency_score, curr.routine_consistency_score, 20),
        make_metric("Dermal Hydration Level", base.hydration_score, curr.hydration_score, 10),
    ]

    total_diff = curr.total_score - base.total_score
    if total_diff > 1:
        overall_st = "IMPROVED"
        summary = f"Overall skin health has improved by {total_diff} points ({curr.total_score}/100 vs {base.total_score}/100). Dermal barrier and hydration show positive responsiveness to evidence-based skincare routines."
    elif total_diff < -1:
        overall_st = "DECLINED"
        summary = f"Skin health score changed by {total_diff} points. Increased environmental exposure or sleep deficiency may be exerting temporary stress on skin barrier metrics."
    else:
        overall_st = "STABLE"
        summary = f"Skin health score remains stable at {curr.total_score}/100. Routine consistency is sustaining baseline barrier integrity."

    # Compare concern levels
    base_concerns: Dict[str, int] = json.loads(base.concern_levels) if base.concern_levels else {}
    curr_concerns: Dict[str, int] = json.loads(curr.concern_levels) if curr.concern_levels else {}

    concern_comparisons: List[ConcernTrendItem] = []
    for c_name, c_init in base_concerns.items():
        c_now = curr_concerns.get(c_name, c_init)
        if c_now < c_init:
            st = "IMPROVED"
        elif c_now > c_init:
            st = "WORSENED"
        else:
            st = "STABLE"
        concern_comparisons.append(ConcernTrendItem(
            concern=c_name,
            initial_severity=c_init,
            current_severity=c_now,
            status=st
        ))

    return BeforeAfterComparisonResponse(
        baseline_date=base.recorded_at.strftime("%Y-%m-%d"),
        current_date=curr.recorded_at.strftime("%Y-%m-%d"),
        baseline_score=base.total_score,
        current_score=curr.total_score,
        overall_status=overall_st,
        metrics=metrics,
        concern_comparisons=concern_comparisons,
        clinical_summary=summary
    )
