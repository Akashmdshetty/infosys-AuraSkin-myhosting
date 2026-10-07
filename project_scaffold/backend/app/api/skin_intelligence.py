import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models import User, SkinAssessment, SkinHealthScore, SkincareRoutine, Recommendation
from app.schemas.skin_intelligence import (
    SkinAssessmentResponse, SkinHealthScoreResponse, SkincareRoutineResponse,
    RecommendationResponse, SkinIntelligenceReport, ScoreComponentDetail, RoutineStep
)
from app.services.skin_assessment_service import analyze_skin_profile
from app.services.scoring_service import calculate_skin_health_score
from app.services.routine_generation_service import generate_personalized_routine
from app.services.recommendation_service import generate_evidence_recommendations
from app.services.report_service import generate_skin_intelligence_report

router = APIRouter()

@router.post("/skin-assessment", response_model=SkinAssessmentResponse, status_code=status.HTTP_201_CREATED)
def trigger_skin_assessment(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    assessment = analyze_skin_profile(db, current_user)
    sec_concerns = json.loads(assessment.secondary_concerns) if assessment.secondary_concerns else []
    r_factors = json.loads(assessment.risk_factors) if assessment.risk_factors else []
    s_factors = json.loads(assessment.supporting_factors) if assessment.supporting_factors else []
    raw_p = json.loads(assessment.raw_payload) if assessment.raw_payload else {}

    return SkinAssessmentResponse(
        id=assessment.id,
        user_id=assessment.user_id,
        primary_concern=assessment.primary_concern,
        secondary_concerns=sec_concerns,
        risk_factors=r_factors,
        supporting_factors=s_factors,
        data_completeness=assessment.data_completeness,
        confidence_score=assessment.confidence_score,
        raw_payload=raw_p,
        created_at=assessment.created_at
    )

@router.get("/skin-assessment/latest", response_model=SkinAssessmentResponse)
def get_latest_assessment(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == current_user.id).order_by(SkinAssessment.created_at.desc()).first()
    if not assessment:
        assessment = analyze_skin_profile(db, current_user)

    sec_concerns = json.loads(assessment.secondary_concerns) if assessment.secondary_concerns else []
    r_factors = json.loads(assessment.risk_factors) if assessment.risk_factors else []
    s_factors = json.loads(assessment.supporting_factors) if assessment.supporting_factors else []
    raw_p = json.loads(assessment.raw_payload) if assessment.raw_payload else {}

    return SkinAssessmentResponse(
        id=assessment.id,
        user_id=assessment.user_id,
        primary_concern=assessment.primary_concern,
        secondary_concerns=sec_concerns,
        risk_factors=r_factors,
        supporting_factors=s_factors,
        data_completeness=assessment.data_completeness,
        confidence_score=assessment.confidence_score,
        raw_payload=raw_p,
        created_at=assessment.created_at
    )

@router.get("/skin-assessment/history", response_model=List[SkinAssessmentResponse])
def get_assessment_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    assessments = db.query(SkinAssessment).filter(SkinAssessment.user_id == current_user.id).order_by(SkinAssessment.created_at.desc()).all()
    results = []
    for a in assessments:
        sec_concerns = json.loads(a.secondary_concerns) if a.secondary_concerns else []
        r_factors = json.loads(a.risk_factors) if a.risk_factors else []
        s_factors = json.loads(a.supporting_factors) if a.supporting_factors else []
        raw_p = json.loads(a.raw_payload) if a.raw_payload else {}

        results.append(SkinAssessmentResponse(
            id=a.id,
            user_id=a.user_id,
            primary_concern=a.primary_concern,
            secondary_concerns=sec_concerns,
            risk_factors=r_factors,
            supporting_factors=s_factors,
            data_completeness=a.data_completeness,
            confidence_score=a.confidence_score,
            raw_payload=raw_p,
            created_at=a.created_at
        ))
    return results

@router.get("/skin-score", response_model=SkinHealthScoreResponse)
def get_skin_score(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == current_user.id).order_by(SkinAssessment.created_at.desc()).first()
    if not assessment:
        assessment = analyze_skin_profile(db, current_user)

    score_rec = db.query(SkinHealthScore).filter(SkinHealthScore.user_id == current_user.id).order_by(SkinHealthScore.created_at.desc()).first()
    if not score_rec or score_rec.assessment_id != assessment.id:
        score_rec = calculate_skin_health_score(db, current_user, assessment)

    breakdown_raw = json.loads(score_rec.score_breakdown) if score_rec.score_breakdown else []
    breakdown_list = [ScoreComponentDetail(**b) for b in breakdown_raw]
    impact_factors = json.loads(score_rec.top_impact_factors) if score_rec.top_impact_factors else []

    return SkinHealthScoreResponse(
        id=score_rec.id,
        user_id=score_rec.user_id,
        assessment_id=score_rec.assessment_id,
        total_score=score_rec.total_score,
        skin_condition_score=score_rec.skin_condition_score,
        lifestyle_score=score_rec.lifestyle_score,
        sleep_score=score_rec.sleep_score,
        routine_consistency_score=score_rec.routine_consistency_score,
        hydration_score=score_rec.hydration_score,
        breakdown_components=breakdown_list,
        top_impact_factors=impact_factors,
        created_at=score_rec.created_at
    )

@router.get("/routine/current", response_model=SkincareRoutineResponse)
def get_current_routine(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == current_user.id).order_by(SkinAssessment.created_at.desc()).first()
    if not assessment:
        assessment = analyze_skin_profile(db, current_user)

    routine_rec = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == current_user.id).order_by(SkincareRoutine.created_at.desc()).first()
    if not routine_rec or routine_rec.assessment_id != assessment.id:
        routine_rec = generate_personalized_routine(db, current_user, assessment)

    morning_steps = [RoutineStep(**s) for s in json.loads(routine_rec.morning_routine)]
    evening_steps = [RoutineStep(**s) for s in json.loads(routine_rec.evening_routine)]
    weekly_steps = [RoutineStep(**s) for s in json.loads(routine_rec.weekly_routine)]

    return SkincareRoutineResponse(
        id=routine_rec.id,
        user_id=routine_rec.user_id,
        assessment_id=routine_rec.assessment_id,
        morning_routine=morning_steps,
        evening_routine=evening_steps,
        weekly_routine=weekly_steps,
        seasonal_notes=routine_rec.seasonal_notes,
        safety_notes=routine_rec.safety_notes,
        created_at=routine_rec.created_at
    )

@router.post("/routine/generate", response_model=SkincareRoutineResponse)
def force_generate_routine(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    assessment = analyze_skin_profile(db, current_user)
    routine_rec = generate_personalized_routine(db, current_user, assessment)

    morning_steps = [RoutineStep(**s) for s in json.loads(routine_rec.morning_routine)]
    evening_steps = [RoutineStep(**s) for s in json.loads(routine_rec.evening_routine)]
    weekly_steps = [RoutineStep(**s) for s in json.loads(routine_rec.weekly_routine)]

    return SkincareRoutineResponse(
        id=routine_rec.id,
        user_id=routine_rec.user_id,
        assessment_id=routine_rec.assessment_id,
        morning_routine=morning_steps,
        evening_routine=evening_steps,
        weekly_routine=weekly_steps,
        seasonal_notes=routine_rec.seasonal_notes,
        safety_notes=routine_rec.safety_notes,
        created_at=routine_rec.created_at
    )

@router.get("/recommendations", response_model=List[RecommendationResponse])
def get_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == current_user.id).order_by(SkinAssessment.created_at.desc()).first()
    if not assessment:
        assessment = analyze_skin_profile(db, current_user)

    recs = db.query(Recommendation).filter(Recommendation.user_id == current_user.id, Recommendation.assessment_id == assessment.id).all()
    if not recs:
        recs = generate_evidence_recommendations(db, current_user, assessment)

    return [RecommendationResponse.model_validate(r) for r in recs]

@router.get("/reports/skin-intelligence", response_model=SkinIntelligenceReport)
def get_skin_intelligence_report(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return generate_skin_intelligence_report(db, current_user)
