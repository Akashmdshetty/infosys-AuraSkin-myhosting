import logging
import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models import (
    User, SkinAssessment, SkinHealthScore, SkinProfile, LifestyleProfile, SleepRecord, HydrationRecord, EnvironmentalExposure
)

logger = logging.getLogger(__name__)

def calculate_skin_health_score(db: Session, user: User, assessment: SkinAssessment) -> SkinHealthScore:
    skin_prof: SkinProfile = user.skin_profile
    life_prof: LifestyleProfile = user.lifestyle_profile
    sleep_recs: List[SleepRecord] = user.sleep_records or []
    hydra_recs: List[HydrationRecord] = user.hydration_records or []
    env_recs: List[EnvironmentalExposure] = user.environment_records or []

    # ---------------------------------------------------------
    # 1. Skin Condition Assessment (Normalized 0-100, Weight: 35%)
    # ---------------------------------------------------------
    if skin_prof:
        norm_skin_cond = 100.0
        if skin_prof.skin_concerns:
            concerns_count = len([c for c in skin_prof.skin_concerns.split(",") if c.strip()])
            norm_skin_cond -= min(concerns_count * 10.0, 40.0)
        if skin_prof.sensitivities:
            norm_skin_cond -= 10.0
        if env_recs:
            latest_env = env_recs[-1]
            if latest_env.sun_exposure_hours > 3:
                norm_skin_cond -= 10.0
        norm_skin_cond = max(norm_skin_cond, 10.0)
    else:
        norm_skin_cond = 60.0  # Fallback baseline when profile unconfigured

    skin_cond_earned = round(norm_skin_cond * 0.35, 2)

    # ---------------------------------------------------------
    # 2. Lifestyle Habits (Normalized 0-100, Weight: 20%)
    # ---------------------------------------------------------
    if life_prof or env_recs:
        norm_lifestyle = 100.0
        if life_prof:
            if life_prof.stress_level and life_prof.stress_level.value == "HIGH":
                norm_lifestyle -= 35.0
            elif life_prof.stress_level and life_prof.stress_level.value == "MODERATE":
                norm_lifestyle -= 15.0
        if env_recs:
            latest_env = env_recs[-1]
            if latest_env.sun_exposure_hours > 5:
                norm_lifestyle -= 35.0
            elif latest_env.sun_exposure_hours > 3:
                norm_lifestyle -= 20.0
        norm_lifestyle = max(norm_lifestyle, 10.0)
    else:
        norm_lifestyle = 70.0  # Fallback baseline

    lifestyle_earned = round(norm_lifestyle * 0.20, 2)

    # ---------------------------------------------------------
    # 3. Sleep Quality (Normalized 0-100, Weight: 15%)
    # ---------------------------------------------------------
    if sleep_recs:
        latest_sleep = sleep_recs[-1]
        hours = latest_sleep.sleep_hours
        quality = latest_sleep.sleep_quality.value if latest_sleep.sleep_quality else "AVERAGE"

        # Hours component (0-100)
        if 7 <= hours <= 9:
            hours_score = 100.0
        elif hours < 7:
            hours_score = max(0.0, 100.0 - (7.0 - hours) * 20.0)
        else:  # > 9 hrs
            hours_score = 90.0

        # Quality component (0-100)
        if quality == "EXCELLENT":
            quality_score = 100.0
        elif quality == "GOOD":
            quality_score = 85.0
        elif quality == "AVERAGE":
            quality_score = 65.0
        else:  # POOR
            quality_score = 40.0

        norm_sleep = (hours_score * 0.5) + (quality_score * 0.5)
        norm_sleep = max(min(norm_sleep, 100.0), 0.0)
    else:
        norm_sleep = 60.0  # Missing data fallback

    sleep_earned = round(norm_sleep * 0.15, 2)

    # ---------------------------------------------------------
    # 4. Routine Consistency (Normalized 0-100, Weight: 20%)
    # ---------------------------------------------------------
    # Based on tracking activity data completeness and active routine adherence
    present_modules = (1 if skin_prof else 0) + (1 if life_prof else 0) + (1 if sleep_recs else 0) + (1 if hydra_recs else 0) + (1 if env_recs else 0)
    norm_routine_consistency = (present_modules / 5.0) * 100.0
    norm_routine_consistency = max(min(norm_routine_consistency, 100.0), 0.0)

    routine_consistency_earned = round(norm_routine_consistency * 0.20, 2)

    # ---------------------------------------------------------
    # 5. Hydration Level (Normalized 0-100, Weight: 10%)
    # ---------------------------------------------------------
    target_water = 2500.0
    if hydra_recs:
        latest_hydra = hydra_recs[-1]
        water_ml = float(latest_hydra.water_consumed or 0)
        norm_hydration = (water_ml / target_water) * 100.0
        norm_hydration = max(min(norm_hydration, 100.0), 0.0)
    else:
        norm_hydration = 50.0  # Missing data fallback

    hydration_earned = round(norm_hydration * 0.10, 2)

    # ---------------------------------------------------------
    # Total Score Calculation (0-100)
    # ---------------------------------------------------------
    exact_sum = skin_cond_earned + lifestyle_earned + sleep_earned + routine_consistency_earned + hydration_earned
    total_score = int(round(exact_sum))
    total_score = max(min(total_score, 100), 0)

    # ---------------------------------------------------------
    # Detailed Breakdown for UI and Reports
    # ---------------------------------------------------------
    breakdown_list = [
        {
            "earned": skin_cond_earned,
            "max_possible": 35.0,
            "normalized_score": round(norm_skin_cond, 1),
            "weight": 0.35,
            "label": "Skin Condition Assessment",
            "explanation": f"Score: {round(norm_skin_cond, 1)}/100 × 35% weight = {skin_cond_earned} pts."
        },
        {
            "earned": lifestyle_earned,
            "max_possible": 20.0,
            "normalized_score": round(norm_lifestyle, 1),
            "weight": 0.20,
            "label": "Lifestyle & Environment",
            "explanation": f"Score: {round(norm_lifestyle, 1)}/100 × 20% weight = {lifestyle_earned} pts."
        },
        {
            "earned": sleep_earned,
            "max_possible": 15.0,
            "normalized_score": round(norm_sleep, 1),
            "weight": 0.15,
            "label": "Sleep Quality",
            "explanation": f"Score: {round(norm_sleep, 1)}/100 × 15% weight = {sleep_earned} pts."
        },
        {
            "earned": routine_consistency_earned,
            "max_possible": 20.0,
            "normalized_score": round(norm_routine_consistency, 1),
            "weight": 0.20,
            "label": "Routine Consistency",
            "explanation": f"Score: {round(norm_routine_consistency, 1)}/100 × 20% weight = {routine_consistency_earned} pts."
        },
        {
            "earned": hydration_earned,
            "max_possible": 10.0,
            "normalized_score": round(norm_hydration, 1),
            "weight": 0.10,
            "label": "Hydration Level",
            "explanation": f"Score: {round(norm_hydration, 1)}/100 × 10% weight = {hydration_earned} pts."
        }
    ]

    # Top impact factors
    deficits = [
        ("Skin Condition Concerns", 35.0 - skin_cond_earned),
        ("Lifestyle & Stress Load", 20.0 - lifestyle_earned),
        ("Sleep Restoration Deficit", 15.0 - sleep_earned),
        ("Routine Adherence Gap", 20.0 - routine_consistency_earned),
        ("Hydration Intake Deficit", 10.0 - hydration_earned),
    ]
    deficits.sort(key=lambda x: x[1], reverse=True)

    top_impact_factors = []
    for factor_name, deficit in deficits:
        if deficit > 1.5:
            top_impact_factors.append(f"{factor_name} (-{round(deficit, 1)} pts impact)")

    if not top_impact_factors:
        top_impact_factors.append("Optimal skin health balance across all metrics!")

    score_record = SkinHealthScore(
        user_id=user.id,
        assessment_id=assessment.id,
        total_score=total_score,
        skin_condition_score=int(round(norm_skin_cond)),
        lifestyle_score=int(round(norm_lifestyle)),
        sleep_score=int(round(norm_sleep)),
        routine_consistency_score=int(round(norm_routine_consistency)),
        hydration_score=int(round(norm_hydration)),
        score_breakdown=json.dumps(breakdown_list),
        top_impact_factors=json.dumps(top_impact_factors)
    )

    db.add(score_record)
    db.commit()
    db.refresh(score_record)

    logger.info("Skin Health Score calculated deterministically: score_id=%s, total_score=%d", score_record.id, total_score)
    return score_record
