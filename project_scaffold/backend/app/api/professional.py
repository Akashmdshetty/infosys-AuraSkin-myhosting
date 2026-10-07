import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models import (
    User, RoleEnum, VerificationStatus, ConsultationRequest,
    SkinAssessment, SkinHealthScore, SkincareRoutine, ProgressRecord,
    RoutineAdherenceRecord, ProductRecommendation, Product
)
from app.schemas.user import UserResponse
from app.schemas.skin_intelligence import SkinIntelligenceReport, SkinAssessmentResponse, ScoreComponentDetail
from app.schemas.consultation import ConsultationCreate, ConsultationResponse, ConsultationUpdate
from app.services.report_service import generate_skin_intelligence_report

router = APIRouter()

def verify_professional_access(current_user: User):
    if current_user.role not in [RoleEnum.SKINCARE_CONSULTANT, RoleEnum.DERMATOLOGIST, RoleEnum.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Professional account required.")
    
    if current_user.role != RoleEnum.ADMIN and current_user.verification_status != VerificationStatus.VERIFIED:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Professional account pending administrator verification.")


@router.get("/directory", response_model=List[UserResponse])
def get_professional_directory(db: Session = Depends(get_db)):
    """Public/Authenticated endpoint to list all verified Skincare Consultants & Dermatologists."""
    professionals = db.query(User).filter(
        User.role.in_([RoleEnum.SKINCARE_CONSULTANT, RoleEnum.DERMATOLOGIST]),
        User.verification_status == VerificationStatus.VERIFIED
    ).all()
    return [UserResponse.model_validate(p) for p in professionals]


@router.get("/clients", response_model=List[UserResponse])
def get_clients(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verify_professional_access(current_user)
    clients = db.query(User).filter(User.role == RoleEnum.USER).all()
    return [UserResponse.model_validate(c) for c in clients]


@router.get("/client-report/{client_id}", response_model=SkinIntelligenceReport)
def get_client_report(client_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verify_professional_access(current_user)
    client_user = db.query(User).filter(User.id == client_id).first()
    if not client_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client user not found.")
    return generate_skin_intelligence_report(db, client_user)


@router.get("/clients/{client_id}/overview", response_model=dict)
def get_client_overview(client_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verify_professional_access(current_user)
    client_user = db.query(User).filter(User.id == client_id).first()
    if not client_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client user not found.")

    latest_assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == client_id).order_by(SkinAssessment.created_at.desc()).first()
    latest_score = db.query(SkinHealthScore).filter(SkinHealthScore.user_id == client_id).order_by(SkinHealthScore.created_at.desc()).first()
    progress_count = db.query(ProgressRecord).filter(ProgressRecord.user_id == client_id).count()
    adherences = db.query(RoutineAdherenceRecord).filter(RoutineAdherenceRecord.user_id == client_id).all()
    avg_adherence = round((sum(a.adherence_rate for a in adherences) / len(adherences)) * 100, 1) if adherences else 0.0

    skin_prof = client_user.skin_profile

    return {
        "client": {
            "id": client_user.id,
            "name": client_user.name,
            "email": client_user.email,
            "age": client_user.age,
            "country": client_user.country
        },
        "skin_profile": {
            "skin_type": skin_prof.skin_type.value if (skin_prof and skin_prof.skin_type) else "NOT_CONFIGURED",
            "concerns": skin_prof.skin_concerns if skin_prof else "None",
            "allergies": skin_prof.allergies if skin_prof else "None",
            "sensitivities": skin_prof.sensitivities if skin_prof else "None"
        },
        "latest_aurascore": latest_score.total_score if latest_score else None,
        "primary_concern": latest_assessment.primary_concern if latest_assessment else None,
        "assessment_confidence": round(latest_assessment.confidence_score * 100, 1) if latest_assessment else None,
        "total_progress_snapshots": progress_count,
        "average_adherence_pct": avg_adherence
    }


@router.get("/clients/{client_id}/assessments", response_model=List[SkinAssessmentResponse])
def get_client_assessments(client_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verify_professional_access(current_user)
    assessments = db.query(SkinAssessment).filter(SkinAssessment.user_id == client_id).order_by(SkinAssessment.created_at.desc()).all()
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


@router.get("/clients/{client_id}/progress", response_model=dict)
def get_client_progress(client_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verify_professional_access(current_user)
    records = db.query(ProgressRecord).filter(ProgressRecord.user_id == client_id).order_by(ProgressRecord.recorded_at.asc()).all()
    adherences = db.query(RoutineAdherenceRecord).filter(RoutineAdherenceRecord.user_id == client_id).order_by(RoutineAdherenceRecord.date.asc()).all()

    return {
        "client_id": client_id,
        "snapshots": [
            {
                "id": r.id,
                "total_score": r.total_score,
                "barrier_status": r.barrier_status,
                "recorded_at": r.recorded_at.isoformat()
            } for r in records
        ],
        "adherence_logs": [
            {
                "date": a.date,
                "morning_completed": a.morning_completed,
                "evening_completed": a.evening_completed,
                "adherence_rate": a.adherence_rate
            } for a in adherences
        ]
    }


@router.post("/consultations", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
def create_consultation_request(
    payload: ConsultationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Endpoint for clients to contact a verified consultant or dermatologist."""
    target_prof = db.query(User).filter(
        User.id == payload.professional_id,
        User.role.in_([RoleEnum.SKINCARE_CONSULTANT, RoleEnum.DERMATOLOGIST])
    ).first()

    if not target_prof:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selected specialist not found or unavailable.")

    consultation = ConsultationRequest(
        client_id=current_user.id,
        professional_id=payload.professional_id,
        subject=payload.subject,
        message=payload.message,
        primary_concern=payload.primary_concern,
        status="PENDING"
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)
    return ConsultationResponse.model_validate(consultation)


@router.get("/consultations", response_model=List[ConsultationResponse])
def get_my_consultations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get consultations sent (if client) or received (if professional/admin)."""
    if current_user.role in [RoleEnum.SKINCARE_CONSULTANT, RoleEnum.DERMATOLOGIST, RoleEnum.ADMIN]:
        consultations = db.query(ConsultationRequest).filter(
            ConsultationRequest.professional_id == current_user.id
        ).order_by(ConsultationRequest.created_at.desc()).all()
    else:
        consultations = db.query(ConsultationRequest).filter(
            ConsultationRequest.client_id == current_user.id
        ).order_by(ConsultationRequest.created_at.desc()).all()

    return [ConsultationResponse.model_validate(c) for c in consultations]


@router.patch("/consultations/{consultation_id}", response_model=ConsultationResponse)
def update_consultation_status(
    consultation_id: int,
    payload: ConsultationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Professional endpoint to review and respond to a consultation request."""
    consultation = db.query(ConsultationRequest).filter(ConsultationRequest.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation request not found.")

    if consultation.professional_id != current_user.id and current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this consultation.")

    if payload.status:
        consultation.status = payload.status
    if payload.response_notes is not None:
        consultation.response_notes = payload.response_notes

    db.commit()
    db.refresh(consultation)
    return ConsultationResponse.model_validate(consultation)
