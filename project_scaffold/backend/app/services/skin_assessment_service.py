import logging
import json
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.models import (
    User, SkinProfile, LifestyleProfile, SleepRecord, HydrationRecord, EnvironmentalExposure, SkinAssessment
)

logger = logging.getLogger(__name__)

SUPPORTED_CONCERNS = [
    "Acne", "Hyperpigmentation", "Dark Spots", "Dry Skin", "Oily Skin",
    "Sensitive Skin", "Wrinkles", "Fine Lines", "Redness", "Uneven Skin Tone"
]

def analyze_skin_profile(db: Session, user: User) -> SkinAssessment:
    skin_prof: SkinProfile = user.skin_profile
    life_prof: LifestyleProfile = user.lifestyle_profile
    sleep_recs: List[SleepRecord] = user.sleep_records or []
    hydra_recs: List[HydrationRecord] = user.hydration_records or []
    env_recs: List[EnvironmentalExposure] = user.environment_records or []

    # 1. Data Completeness & Confidence Score
    total_data_points = 5
    present_points = 0
    missing_data_notes = []

    if skin_prof: present_points += 1
    else: missing_data_notes.append("Skin profile missing")

    if life_prof: present_points += 1
    else: missing_data_notes.append("Lifestyle profile missing")

    if sleep_recs: present_points += 1
    else: missing_data_notes.append("Sleep records missing")

    if hydra_recs: present_points += 1
    else: missing_data_notes.append("Hydration logs missing")

    if env_recs: present_points += 1
    else: missing_data_notes.append("Environmental exposure logs missing")

    data_completeness = round(present_points / total_data_points, 2)
    confidence_score = round(0.50 + (data_completeness * 0.45), 2)  # Base 50% + up to 45%

    # 2. Extract and Normalize Reported Concerns
    reported_concerns_str = skin_prof.skin_concerns if (skin_prof and skin_prof.skin_concerns) else ""
    raw_concern_tokens = [c.strip().replace("_", " ").title() for c in reported_concerns_str.split(",") if c.strip()]
    
    candidate_concerns = []
    for c in raw_concern_tokens:
        matched = False
        for sc in SUPPORTED_CONCERNS:
            if sc.lower() in c.lower() or c.lower() in sc.lower():
                if sc not in candidate_concerns:
                    candidate_concerns.append(sc)
                matched = True
        if not matched and c and c not in candidate_concerns:
            candidate_concerns.append(c)

    # 3. Inferred Concerns based on biometrics & profile
    if skin_prof and skin_prof.skin_type:
        st = skin_prof.skin_type.value
        if st == "OILY" and "Oily Skin" not in candidate_concerns:
            candidate_concerns.append("Oily Skin")
        elif st == "DRY" and "Dry Skin" not in candidate_concerns:
            candidate_concerns.append("Dry Skin")
        elif st == "SENSITIVE" and "Sensitive Skin" not in candidate_concerns:
            candidate_concerns.append("Sensitive Skin")

    if skin_prof and skin_prof.sensitivities and "Sensitive Skin" not in candidate_concerns:
        candidate_concerns.append("Sensitive Skin")

    if env_recs and env_recs[-1].sun_exposure_hours > 3:
        if "Hyperpigmentation" not in candidate_concerns and "Dark Spots" not in candidate_concerns:
            candidate_concerns.append("Uneven Skin Tone")

    if not candidate_concerns:
        candidate_concerns = ["Uneven Skin Tone"]

    # 4. Concern Prioritization Engine (Deterministic Weighting)
    concern_weights: Dict[str, float] = {}
    for idx, c in enumerate(candidate_concerns):
        # Base weight from order reported
        concern_weights[c] = 100.0 - (idx * 15.0)

        # Risk factor boosters
        if c in ["Acne", "Redness"] and life_prof and life_prof.stress_level and life_prof.stress_level.value == "HIGH":
            concern_weights[c] += 20.0
        if c in ["Hyperpigmentation", "Dark Spots", "Wrinkles", "Fine Lines"] and env_recs and env_recs[-1].sun_exposure_hours > 3:
            concern_weights[c] += 25.0
        if c in ["Dry Skin", "Sensitive Skin"] and skin_prof and skin_prof.sensitivities:
            concern_weights[c] += 20.0
        if c in ["Uneven Skin Tone", "Dark Spots"] and sleep_recs and sleep_recs[-1].sleep_hours < 6:
            concern_weights[c] += 15.0

    sorted_concerns = sorted(candidate_concerns, key=lambda c: concern_weights[c], reverse=True)
    primary_concern = sorted_concerns[0]
    secondary_concerns = sorted_concerns[1:] if len(sorted_concerns) > 1 else ["Barrier Maintenance"]

    # Prioritization explanation
    why_primary_prioritized = (
        f"'{primary_concern}' was prioritized as primary based on reported user profile, "
        f"supported by skin type ({skin_prof.skin_type.value if skin_prof and skin_prof.skin_type else 'Unspecified'}) "
        f"and biometrics logs."
    )

    # 5. Identify Risk Factors and Supporting Factors
    risk_factors = []
    supporting_factors = []

    if life_prof and life_prof.stress_level and life_prof.stress_level.value == "HIGH":
        risk_factors.append("High Stress Level (Elevated cortisol indicator affecting sebum production & barrier restoration)")
    elif life_prof and life_prof.stress_level and life_prof.stress_level.value == "LOW":
        supporting_factors.append("Low Stress Levels (Supports cellular regeneration)")

    if sleep_recs:
        latest_sleep = sleep_recs[-1]
        quality_str = latest_sleep.sleep_quality.value if latest_sleep.sleep_quality else "AVERAGE"
        if latest_sleep.sleep_hours < 7 or quality_str in ["POOR", "AVERAGE"]:
            risk_factors.append(f"Sub-optimal Sleep ({latest_sleep.sleep_hours} hrs, quality: {quality_str})")
        else:
            supporting_factors.append(f"Restorative Sleep ({latest_sleep.sleep_hours} hrs, quality: {quality_str})")
    else:
        risk_factors.append("Sleep quality tracking data missing")

    if hydra_recs:
        latest_hydra = hydra_recs[-1]
        water_val = latest_hydra.water_consumed or 0
        if water_val < 2000:
            risk_factors.append(f"Low Daily Hydration ({water_val} ml/day vs target 2500 ml)")
        else:
            supporting_factors.append(f"Optimal Hydration Intake ({water_val} ml/day)")
    else:
        risk_factors.append("Hydration tracking data missing")

    if env_recs:
        latest_env = env_recs[-1]
        if latest_env.sun_exposure_hours >= 3:
            risk_factors.append(f"Elevated UV Exposure ({latest_env.sun_exposure_hours} hrs sun duration - oxidative stress risk)")
        else:
            supporting_factors.append(f"Moderate Environmental UV Duration ({latest_env.sun_exposure_hours} hrs)")

    if not risk_factors:
        risk_factors.append("No major environmental or lifestyle risk indicators detected.")
    if not supporting_factors:
        supporting_factors.append("Basic skin profile recorded.")

    raw_payload_dict = {
        "skin_type": skin_prof.skin_type.value if (skin_prof and skin_prof.skin_type) else "UNSPECIFIED",
        "allergies": skin_prof.allergies if skin_prof else "",
        "sensitivities": skin_prof.sensitivities if skin_prof else "",
        "data_completeness": data_completeness,
        "confidence_score": confidence_score,
        "missing_data_notes": missing_data_notes,
        "why_primary_prioritized": why_primary_prioritized
    }

    assessment = SkinAssessment(
        user_id=user.id,
        primary_concern=primary_concern,
        secondary_concerns=json.dumps(secondary_concerns),
        risk_factors=json.dumps(risk_factors),
        supporting_factors=json.dumps(supporting_factors),
        data_completeness=data_completeness,
        confidence_score=confidence_score,
        raw_payload=json.dumps(raw_payload_dict)
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    logger.info("Skin Assessment generated deterministically: assessment_id=%s, primary_concern=%s, confidence=%.2f", assessment.id, primary_concern, confidence_score)
    return assessment
