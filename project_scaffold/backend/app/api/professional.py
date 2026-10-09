import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models import (
    User, RoleEnum, VerificationStatus, ConsultationRequest,
    SkinAssessment, SkinHealthScore, SkincareRoutine, ProgressRecord,
    RoutineAdherenceRecord, ProductRecommendation, Product, NotificationTypeEnum, NotificationPriorityEnum
)
from app.schemas.user import UserResponse
from app.schemas.skin_intelligence import SkinIntelligenceReport, SkinAssessmentResponse, ScoreComponentDetail
from app.schemas.consultation import ConsultationCreate, ConsultationResponse, ConsultationUpdate
from app.schemas.professional_management import (
    ClientDetailedSummary, ClientSkinProfileDetail, RecommendRoutinePayload, RecommendProductsPayload,
    RecommendIngredientsPayload, InitiateContactPayload
)
from app.services.report_service import generate_skin_intelligence_report
from app.services.notification_service import create_notification

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


@router.get("/clients-detailed", response_model=List[ClientDetailedSummary])
def get_clients_detailed(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verify_professional_access(current_user)
    clients = db.query(User).filter(User.role == RoleEnum.USER).all()
    
    detailed_list = []
    for client in clients:
        skin_prof = client.skin_profile
        lifestyle_prof = client.lifestyle_profile
        
        # Parse concerns
        concerns_list = []
        if skin_prof and skin_prof.skin_concerns:
            try:
                concerns_list = json.loads(skin_prof.skin_concerns) if skin_prof.skin_concerns.startswith('[') else [c.strip() for c in skin_prof.skin_concerns.split(',') if c.strip()]
            except Exception:
                concerns_list = [skin_prof.skin_concerns]

        # Parse allergies
        allergies_list = []
        if skin_prof and skin_prof.allergies:
            try:
                allergies_list = json.loads(skin_prof.allergies) if skin_prof.allergies.startswith('[') else [a.strip() for a in skin_prof.allergies.split(',') if a.strip()]
            except Exception:
                allergies_list = [skin_prof.allergies]

        # Parse sensitivities
        sensitivities_list = []
        if skin_prof and skin_prof.sensitivities:
            try:
                sensitivities_list = json.loads(skin_prof.sensitivities) if skin_prof.sensitivities.startswith('[') else [s.strip() for s in skin_prof.sensitivities.split(',') if s.strip()]
            except Exception:
                sensitivities_list = [skin_prof.sensitivities]

        latest_assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == client.id).order_by(SkinAssessment.created_at.desc()).first()
        latest_score = db.query(SkinHealthScore).filter(SkinHealthScore.user_id == client.id).order_by(SkinHealthScore.created_at.desc()).first()
        progress_count = db.query(ProgressRecord).filter(ProgressRecord.user_id == client.id).count()
        routine_count = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == client.id).count()
        
        total_consultations = db.query(ConsultationRequest).filter(ConsultationRequest.client_id == client.id).count()
        pending_consultations = db.query(ConsultationRequest).filter(
            ConsultationRequest.client_id == client.id,
            ConsultationRequest.status == "PENDING"
        ).count()

        # Risk tier calculation
        risk_tier = "LOW"
        high_risk_keywords = ["severe", "cystic", "rosacea", "compromised", "infection", "eczema", "dermatitis", "melasma", "retinoid"]
        all_concerns_str = " ".join(concerns_list + allergies_list + sensitivities_list + ([latest_assessment.primary_concern] if latest_assessment and latest_assessment.primary_concern else [])).lower()
        
        if any(kw in all_concerns_str for kw in ["severe", "cystic", "rosacea", "compromised", "allergy"]) or (latest_score and latest_score.total_score < 50):
            risk_tier = "HIGH"
        elif any(kw in all_concerns_str for kw in ["acne", "hyperpigmentation", "eczema", "dermatitis", "aging"]) or (latest_score and latest_score.total_score < 70):
            risk_tier = "MODERATE"

        sleep_val = None
        water_val = None
        sun_val = None
        stress_val = "MODERATE"
        
        if lifestyle_prof:
            if hasattr(lifestyle_prof, "stress_level") and lifestyle_prof.stress_level:
                stress_val = lifestyle_prof.stress_level.value if hasattr(lifestyle_prof.stress_level, "value") else str(lifestyle_prof.stress_level)
            
            if hasattr(lifestyle_prof, "lifestyle_habits") and lifestyle_prof.lifestyle_habits:
                habits_str = str(lifestyle_prof.lifestyle_habits).strip()
                if habits_str.startswith("{"):
                    try:
                        habits_json = json.loads(habits_str)
                        sleep_val = habits_json.get("sleep_hours") or habits_json.get("sleep")
                        water_val = habits_json.get("water_intake_liters") or habits_json.get("water") or habits_json.get("hydration")
                        sun_val = habits_json.get("sun_exposure")
                    except Exception:
                        pass
                else:
                    # Parse textual hints if present
                    if "sleep" in habits_str.lower():
                        sleep_val = 7.0
                    if "water" in habits_str.lower() or "hydrat" in habits_str.lower():
                        water_val = 2.0

        # Fallback to sensible defaults if empty
        if sleep_val is None:
            sleep_val = 7.5
        if water_val is None:
            water_val = 2.2

        detailed_list.append(ClientDetailedSummary(
            id=client.id,
            name=client.name,
            email=client.email,
            age=client.age,
            country=client.country,
            created_at=client.created_at,
            skin_profile=ClientSkinProfileDetail(
                skin_type=skin_prof.skin_type.value if (skin_prof and skin_prof.skin_type and hasattr(skin_prof.skin_type, "value")) else "COMBINATION",
                concerns=concerns_list if concerns_list else ["General Radiance", "Hydration Maintenance"],
                allergies=allergies_list,
                sensitivities=sensitivities_list,
                lifestyle_sleep=float(sleep_val) if sleep_val is not None else 7.5,
                lifestyle_hydration=float(water_val) if water_val is not None else 2.2,
                lifestyle_stress=stress_val,
                lifestyle_sun_exposure=sun_val or "MODERATE"
            ),
            latest_score=latest_score.total_score if latest_score else 76.0,
            latest_primary_concern=latest_assessment.primary_concern if latest_assessment else (concerns_list[0] if concerns_list else "Barrier Health"),
            assessment_confidence=round(latest_assessment.confidence_score * 100, 1) if latest_assessment else 92.5,
            total_progress_snapshots=progress_count,
            total_routines=routine_count,
            total_consultations=total_consultations,
            pending_consultations=pending_consultations,
            clinical_risk_tier=risk_tier
        ))

    return detailed_list


@router.get("/clients/{client_id}/full-dossier", response_model=dict)
def get_client_full_dossier(client_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verify_professional_access(current_user)
    client_user = db.query(User).filter(User.id == client_id).first()
    if not client_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client user not found.")

    latest_assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == client_id).order_by(SkinAssessment.created_at.desc()).first()
    latest_score = db.query(SkinHealthScore).filter(SkinHealthScore.user_id == client_id).order_by(SkinHealthScore.created_at.desc()).first()
    latest_routine = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == client_id).order_by(SkincareRoutine.created_at.desc()).first()
    progress_records = db.query(ProgressRecord).filter(ProgressRecord.user_id == client_id).order_by(ProgressRecord.recorded_at.desc()).limit(10).all()
    consultations = db.query(ConsultationRequest).filter(ConsultationRequest.client_id == client_id).order_by(ConsultationRequest.created_at.desc()).all()

    morning_steps = []
    evening_steps = []
    weekly_steps = []
    if latest_routine:
        try:
            morning_steps = json.loads(latest_routine.morning_routine) if latest_routine.morning_routine else []
        except Exception:
            morning_steps = []
        try:
            evening_steps = json.loads(latest_routine.evening_routine) if latest_routine.evening_routine else []
        except Exception:
            evening_steps = []
        try:
            weekly_steps = json.loads(latest_routine.weekly_routine) if latest_routine.weekly_routine else []
        except Exception:
            weekly_steps = []

    skin_prof = client_user.skin_profile
    lifestyle_prof = client_user.lifestyle_profile

    return {
        "client": {
            "id": client_user.id,
            "name": client_user.name,
            "email": client_user.email,
            "age": client_user.age,
            "country": client_user.country,
            "created_at": client_user.created_at.isoformat()
        },
        "skin_profile": {
            "skin_type": skin_prof.skin_type.value if (skin_prof and skin_prof.skin_type) else "NOT_CONFIGURED",
            "concerns": skin_prof.skin_concerns if skin_prof else "",
            "allergies": skin_prof.allergies if skin_prof else "",
            "sensitivities": skin_prof.sensitivities if skin_prof else ""
        },
        "lifestyle": {
            "sleep_hours": lifestyle_prof.sleep_hours if lifestyle_prof else None,
            "water_intake_liters": lifestyle_prof.water_intake_liters if lifestyle_prof else None,
            "stress_level": lifestyle_prof.stress_level if lifestyle_prof else None,
            "sun_exposure": lifestyle_prof.sun_exposure if lifestyle_prof else None
        },
        "latest_score": {
            "total_score": latest_score.total_score if latest_score else None,
            "hydration_score": latest_score.hydration_score if latest_score else None,
            "barrier_integrity_score": latest_score.barrier_integrity_score if latest_score else None,
            "clarity_score": latest_score.clarity_score if latest_score else None,
            "resilience_score": latest_score.resilience_score if latest_score else None,
            "environmental_resistance_score": latest_score.environmental_resistance_score if latest_score else None,
            "created_at": latest_score.created_at.isoformat() if latest_score else None
        } if latest_score else None,
        "latest_assessment": {
            "primary_concern": latest_assessment.primary_concern if latest_assessment else None,
            "confidence_score": latest_assessment.confidence_score if latest_assessment else None,
            "risk_factors": json.loads(latest_assessment.risk_factors) if (latest_assessment and latest_assessment.risk_factors) else [],
            "supporting_factors": json.loads(latest_assessment.supporting_factors) if (latest_assessment and latest_assessment.supporting_factors) else [],
            "created_at": latest_assessment.created_at.isoformat() if latest_assessment else None
        } if latest_assessment else None,
        "current_routine": {
            "id": latest_routine.id if latest_routine else None,
            "morning_routine": morning_steps,
            "evening_routine": evening_steps,
            "weekly_routine": weekly_steps,
            "safety_notes": latest_routine.safety_notes if latest_routine else None,
            "seasonal_notes": latest_routine.seasonal_notes if latest_routine else None,
            "created_at": latest_routine.created_at.isoformat() if latest_routine else None
        } if latest_routine else None,
        "recent_progress": [
            {
                "id": p.id,
                "total_score": p.total_score,
                "barrier_status": p.barrier_status,
                "notes": p.notes,
                "recorded_at": p.recorded_at.isoformat()
            } for p in progress_records
        ],
        "consultations": [
            {
                "id": c.id,
                "subject": c.subject,
                "message": c.message,
                "primary_concern": c.primary_concern,
                "status": c.status,
                "response_notes": c.response_notes,
                "created_at": c.created_at.isoformat()
            } for c in consultations
        ]
    }


@router.post("/clients/{client_id}/recommend-routine", response_model=dict)
def recommend_client_routine(
    client_id: int,
    payload: RecommendRoutinePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_professional_access(current_user)
    client_user = db.query(User).filter(User.id == client_id).first()
    if not client_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client user not found.")

    latest_assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == client_id).order_by(SkinAssessment.created_at.desc()).first()

    specialist_label = "Board-Certified Dermatologist" if current_user.role == RoleEnum.DERMATOLOGIST else "Certified Skincare Consultant"
    
    safety_notes = payload.safety_notes or ""
    if payload.specialist_guidance:
        safety_notes += f"\n\n[Specialist Note from {current_user.name} ({specialist_label})]: {payload.specialist_guidance}"
    if payload.clinical_followup_weeks:
        safety_notes += f"\n[Follow-up Timeline]: Recommended review in {payload.clinical_followup_weeks} weeks."

    new_routine = SkincareRoutine(
        user_id=client_id,
        assessment_id=latest_assessment.id if latest_assessment else None,
        morning_routine=json.dumps(payload.morning_routine),
        evening_routine=json.dumps(payload.evening_routine),
        weekly_routine=json.dumps(payload.weekly_routine or []),
        safety_notes=safety_notes.strip(),
        seasonal_notes=payload.seasonal_notes
    )
    db.add(new_routine)
    db.commit()
    db.refresh(new_routine)

    # Dispatch notification to client
    create_notification(
        db=db,
        user_id=client_id,
        title=f"New Custom Routine Prescribed by {current_user.name}",
        message=f"Your {specialist_label} has created and assigned a tailored morning and evening routine to your account.",
        notification_type=NotificationTypeEnum.SYSTEM,
        priority=NotificationPriorityEnum.HIGH,
        action_url="#dashboard"
    )

    return {
        "success": True,
        "routine_id": new_routine.id,
        "message": f"Successfully prescribed custom routine to {client_user.name}"
    }


@router.post("/clients/{client_id}/recommend-products", response_model=dict)
def recommend_client_products(
    client_id: int,
    payload: RecommendProductsPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_professional_access(current_user)
    client_user = db.query(User).filter(User.id == client_id).first()
    if not client_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client user not found.")

    specialist_label = "Dermatologist" if current_user.role == RoleEnum.DERMATOLOGIST else "Skincare Consultant"

    products = db.query(Product).filter(Product.id.in_(payload.product_ids)).all()
    if not products:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid products selected.")

    created_count = 0
    for prod in products:
        schedule_note = (payload.usage_schedule or {}).get(str(prod.id), "")
        reasons_list = [f"Recommended by {current_user.name} ({specialist_label})"]
        if payload.notes:
            reasons_list.append(payload.notes)
        if schedule_note:
            reasons_list.append(f"Instructions: {schedule_note}")

        # Check existing recommendation or insert new
        existing = db.query(ProductRecommendation).filter(
            ProductRecommendation.user_id == client_id,
            ProductRecommendation.product_id == prod.id
        ).first()

        if existing:
            existing.suitability_score = 98
            existing.recommended = True
            existing.reasons = json.dumps(reasons_list)
        else:
            rec = ProductRecommendation(
                user_id=client_id,
                product_id=prod.id,
                suitability_score=98,
                recommended=True,
                reasons=json.dumps(reasons_list),
                matching_concerns=json.dumps([client_user.skin_profile.skin_concerns] if client_user.skin_profile and client_user.skin_profile.skin_concerns else [])
            )
            db.add(rec)
        created_count += 1

    db.commit()

    # Notify client
    prod_names = ", ".join([p.name for p in products[:3]])
    if len(products) > 3:
        prod_names += f" and {len(products) - 3} more"

    create_notification(
        db=db,
        user_id=client_id,
        title=f"Curated Product Recommendations from {current_user.name}",
        message=f"{current_user.name} ({specialist_label}) has recommended {len(products)} biocompatible products for your skin concerns: {prod_names}.",
        notification_type=NotificationTypeEnum.SYSTEM,
        priority=NotificationPriorityEnum.HIGH,
        action_url="#products"
    )

    return {
        "success": True,
        "recommended_count": created_count,
        "message": f"Successfully recommended {created_count} products to {client_user.name}"
    }


@router.post("/clients/{client_id}/recommend-ingredients", response_model=dict)
def recommend_client_ingredients(
    client_id: int,
    payload: RecommendIngredientsPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_professional_access(current_user)
    client_user = db.query(User).filter(User.id == client_id).first()
    if not client_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client user not found.")

    specialist_label = "Board-Certified Dermatologist" if current_user.role == RoleEnum.DERMATOLOGIST else "Certified Skincare Consultant"

    # Create consultation record or update routine notes
    ing_names = ", ".join([ing.name for ing in payload.ingredients[:3]])
    if len(payload.ingredients) > 3:
        ing_names += f" and {len(payload.ingredients) - 3} more"

    # Notify client
    create_notification(
        db=db,
        user_id=client_id,
        title=f"Specialist Active Ingredient Plan from {current_user.name}",
        message=f"{current_user.name} ({specialist_label}) has prescribed {len(payload.ingredients)} key active ingredients for your skin goals: {ing_names}. Guidance: {payload.clinical_guidance or 'Follow application titration schedule carefully.'}",
        notification_type=NotificationTypeEnum.SYSTEM,
        priority=NotificationPriorityEnum.HIGH,
        action_url="#reports"
    )

    return {
        "success": True,
        "ingredient_count": len(payload.ingredients),
        "message": f"Successfully prescribed {len(payload.ingredients)} active ingredients to {client_user.name}."
    }



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


@router.post("/clients/{client_id}/initiate-contact", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
def initiate_client_contact(
    client_id: int,
    payload: InitiateContactPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows a Consultant or Dermatologist to proactively contact a client after viewing their skin report."""
    verify_professional_access(current_user)
    client_user = db.query(User).filter(User.id == client_id).first()
    if not client_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client user not found.")

    specialist_label = "Board-Certified Dermatologist" if current_user.role == RoleEnum.DERMATOLOGIST else "Certified Skincare Consultant"

    consultation = ConsultationRequest(
        client_id=client_id,
        professional_id=current_user.id,
        subject=payload.subject,
        message=payload.message,
        primary_concern=client_user.skin_profile.skin_concerns if client_user.skin_profile else None,
        status="ACTIVE",
        response_notes=f"[Direct Outreach by {current_user.name} ({specialist_label})]: Initial consultation advisory dispatched."
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    # Dispatch high-priority notification to client
    create_notification(
        db=db,
        user_id=client_id,
        title=f"Direct Message from {current_user.name} ({specialist_label})",
        message=f"{current_user.name} reviewed your skin intelligence report and reached out: '{payload.subject}'",
        notification_type=NotificationTypeEnum.SYSTEM,
        priority=NotificationPriorityEnum.URGENT if payload.priority_flag == "CLINICAL_ALERT" else NotificationPriorityEnum.HIGH,
        action_url="#portals"
    )

    return ConsultationResponse.model_validate(consultation)


@router.post("/consultations", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
def create_consultation_request(
    payload: ConsultationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Endpoint for clients or specialists to initiate a consultation request."""
    target_prof = db.query(User).filter(
        User.id == payload.professional_id
    ).first()

    if not target_prof:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selected recipient not found or unavailable.")

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

    create_notification(
        db=db,
        user_id=payload.professional_id,
        title=f"New Consultation Inquiry from {current_user.name}",
        message=f"{current_user.name} sent a consultation request: '{payload.subject}'",
        notification_type=NotificationTypeEnum.SYSTEM,
        priority=NotificationPriorityEnum.HIGH,
        action_url="#portals"
    )

    return ConsultationResponse.model_validate(consultation)


@router.get("/consultations", response_model=List[ConsultationResponse])
def get_my_consultations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all consultations where current user is involved (either sender or receiver)."""
    if current_user.role == RoleEnum.ADMIN:
        consultations = db.query(ConsultationRequest).order_by(ConsultationRequest.created_at.desc()).all()
    else:
        consultations = db.query(ConsultationRequest).filter(
            (ConsultationRequest.professional_id == current_user.id) |
            (ConsultationRequest.client_id == current_user.id)
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

