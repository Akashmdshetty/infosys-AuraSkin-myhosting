import logging
import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models import User, SkinAssessment, SkincareRoutine, SkinProfile
from app.services.evidence_service import get_all_ingredient_evidence
from app.services.safety_service import evaluate_ingredient_safety

logger = logging.getLogger(__name__)

def generate_personalized_routine(db: Session, user: User, assessment: SkinAssessment) -> SkincareRoutine:
    skin_prof: SkinProfile = user.skin_profile
    skin_type = skin_prof.skin_type.value if (skin_prof and skin_prof.skin_type) else "NORMAL"
    allergies = skin_prof.allergies if skin_prof else ""
    sensitivities = skin_prof.sensitivities if skin_prof else ""

    # Evaluate approved actives
    all_evidence = get_all_ingredient_evidence()
    safety_eval = evaluate_ingredient_safety(all_evidence, allergies, sensitivities, skin_type)
    approved_active_names = {ing["ingredient_name"] for ing in safety_eval.approved_ingredients}

    primary = assessment.primary_concern.lower()
    secondary_concerns_str = assessment.secondary_concerns.lower() if assessment.secondary_concerns else ""

    # ---------------------------------------------------------
    # 1. MORNING ROUTINE GENERATION
    # ---------------------------------------------------------
    # Step 1: Cleanser selection
    if skin_type in ["DRY", "SENSITIVE"]:
        am_cleanser_type = "Gentle Hydrating Cream Cleanser"
        am_cleanser_ing = ["Ceramides (NP / AP / EOP)", "Glycerin"]
        am_cleanser_notes = "Gently removes overnight secretions without disrupting lipid barrier."
    elif skin_type == "OILY":
        am_cleanser_type = "Clarifying Foaming Cleanser"
        am_cleanser_ing = ["Salicylic Acid (BHA)"] if "Salicylic Acid (BHA)" in approved_active_names else ["Zinc PCA", "Glycerin"]
        am_cleanser_notes = "Clears excess nocturnal sebum and unclogs pore channels."
    else:
        am_cleanser_type = "Balanced Gel Cleanser"
        am_cleanser_ing = ["Glycerin", "Centella Asiatica"]
        am_cleanser_notes = "Maintains optimal pH and refreshes morning skin."

    # Step 2: AM Active Treatment selection
    if "hyperpigmentation" in primary or "dark spots" in primary or "uneven" in primary:
        am_active_type = "Brightening & Pigment Correction Serum"
        if "Vitamin C (L-Ascorbic Acid / Derivatives)" in approved_active_names:
            am_active_ing = ["Vitamin C (L-Ascorbic Acid / Derivatives)"]
        elif "Niacinamide (Vitamin B3)" in approved_active_names:
            am_active_ing = ["Niacinamide (Vitamin B3)"]
        else:
            am_active_ing = ["Hyaluronic Acid"]
    elif "acne" in primary or "oily" in primary:
        am_active_type = "Sebum Regulating & Pore Clarifying Serum"
        if "Niacinamide (Vitamin B3)" in approved_active_names:
            am_active_ing = ["Niacinamide (Vitamin B3)"]
        elif "Salicylic Acid (BHA)" in approved_active_names:
            am_active_ing = ["Salicylic Acid (BHA)"]
        else:
            am_active_ing = ["Zinc PCA"]
    else:
        am_active_type = "Hydrating Antioxidant Defense Serum"
        am_active_ing = ["Hyaluronic Acid", "Niacinamide (Vitamin B3)"] if "Niacinamide (Vitamin B3)" in approved_active_names else ["Hyaluronic Acid"]

    morning_steps = [
        {
            "step_number": 1,
            "category": "Cleansing",
            "product_type": am_cleanser_type,
            "key_ingredients": am_cleanser_ing,
            "instructions": "Massage onto damp skin for 60 seconds and rinse thoroughly with tepid water.",
            "frequency": "Daily AM",
            "safety_notes": am_cleanser_notes
        },
        {
            "step_number": 2,
            "category": "Treatment",
            "product_type": am_active_type,
            "key_ingredients": am_active_ing,
            "instructions": "Apply 3-4 drops to clean face and neck, gently patting into skin.",
            "frequency": "Daily AM",
            "safety_notes": "Follow immediately with moisturizer and broad-spectrum SPF."
        },
        {
            "step_number": 3,
            "category": "Moisturizing",
            "product_type": "Lightweight Barrier Restorative Gel Cream" if skin_type == "OILY" else "Nourishing Barrier Restorative Cream",
            "key_ingredients": ["Hyaluronic Acid", "Ceramides (NP / AP / EOP)"],
            "instructions": "Smooth evenly over face to lock in hydration.",
            "frequency": "Daily AM",
            "safety_notes": "Non-comedogenic formula optimized for daytime layer."
        },
        {
            "step_number": 4,
            "category": "Sun Protection",
            "product_type": "Broad-Spectrum Mineral Sunscreen SPF 50+",
            "key_ingredients": ["Zinc Oxide", "Titanium Dioxide"],
            "instructions": "Apply generously 15 minutes before sun exposure. Reapply every 2 hours outdoors.",
            "frequency": "Daily AM (Mandatory)",
            "safety_notes": "Essential defense against photo-aging, dark spots, and solar oxidative damage."
        }
    ]

    # ---------------------------------------------------------
    # 2. EVENING ROUTINE GENERATION
    # ---------------------------------------------------------
    # PM Active Treatment selection with safety conflict checks
    if ("wrinkle" in primary or "fine lines" in primary or "aging" in primary) and "Retinoids (Adapalene / Tretinoin / Retinol)" in approved_active_names:
        pm_active_type = "Dermal Renewal Retinoid Treatment"
        pm_active_ing = ["Retinoids (Adapalene / Tretinoin / Retinol)"]
        pm_instructions = "Apply pea-sized amount to clean, completely dry skin 2-3 nights per week."
        pm_safety = "Do NOT combine simultaneously with strong AHA/BHA exfoliants on the same evening."
    elif ("acne" in primary or "pore" in primary) and "Salicylic Acid (BHA)" in approved_active_names:
        pm_active_type = "BHA Pore Clarifying Solution"
        pm_active_ing = ["Salicylic Acid (BHA)"]
        pm_instructions = "Apply thin layer to dry skin."
        pm_safety = "Dissolves pore blockage; avoid eye contour area."
    elif "Niacinamide (Vitamin B3)" in approved_active_names:
        pm_active_type = "Barrier Repairing & Calming Serum"
        pm_active_ing = ["Niacinamide (Vitamin B3)", "Hyaluronic Acid"]
        pm_instructions = "Smooth over face and neck."
        pm_safety = "Soothes skin and reinforces lipid barrier integrity."
    else:
        pm_active_type = "Intensive Epidermal Hydration Serum"
        pm_active_ing = ["Hyaluronic Acid", "Ceramides (NP / AP / EOP)"]
        pm_instructions = "Pat gently into face until absorbed."
        pm_safety = "Hypoallergenic and non-irritating."

    evening_steps = [
        {
            "step_number": 1,
            "category": "Cleansing",
            "product_type": "Double Cleanse - Micellar Cleanser followed by Gel Cleanser",
            "key_ingredients": ["Plant-derived Squalane", "Ceramides"],
            "instructions": "Dissolve sunscreen, pollutants, and excess sebum, then rinse thoroughly.",
            "frequency": "Daily PM",
            "safety_notes": "Cleanses pores without stripping natural epidermal lipids."
        },
        {
            "step_number": 2,
            "category": "Treatment",
            "product_type": pm_active_type,
            "key_ingredients": pm_active_ing,
            "instructions": pm_instructions,
            "frequency": "2-3x per week PM" if "retinoid" in pm_active_type.lower() else "Daily PM",
            "safety_notes": pm_safety
        },
        {
            "step_number": 3,
            "category": "Night Care",
            "product_type": "Intensive Nocturnal Lipid Recovery Balm",
            "key_ingredients": ["Ceramides (NP / AP / EOP)", "Peptides (Signal & Copper Peptides)", "Hyaluronic Acid"],
            "instructions": "Massage gently as final evening step to support cellular renewal while sleeping.",
            "frequency": "Daily PM",
            "safety_notes": "Protects against overnight transepidermal water loss (TEWL)."
        }
    ]

    # ---------------------------------------------------------
    # 3. WEEKLY TREATMENT PLAN
    # ---------------------------------------------------------
    weekly_steps = [
        {
            "step_number": 1,
            "category": "Exfoliation",
            "product_type": "Weekly Chemical Exfoliating Treatment",
            "key_ingredients": ["AHAs (Glycolic Acid / Lactic Acid)"] if "AHAs (Glycolic Acid / Lactic Acid)" in approved_active_names else (
                ["Salicylic Acid (BHA)"] if "Salicylic Acid (BHA)" in approved_active_names else ["Enzymatic Exfoliant"]
            ),
            "instructions": "Apply on a non-retinoid evening after cleansing for 10 minutes, then rinse.",
            "frequency": "1x per week PM",
            "safety_notes": "Space out from retinoid treatment nights to prevent barrier distress."
        },
        {
            "step_number": 2,
            "category": "Treatment Mask",
            "product_type": "Hydrating & Soothing Bio-Cellulose Mask",
            "key_ingredients": ["Hyaluronic Acid", "Niacinamide", "Centella Asiatica"],
            "instructions": "Apply for 15-20 minutes on weekend evening.",
            "frequency": "1-2x per week PM",
            "safety_notes": "Surges deep moisture and calms environmental irritation."
        }
    ]

    seasonal_notes = "Adjust moisturizer density in drier/colder months. Increase broad-spectrum sunscreen application in high UV index seasons."
    safety_notes_summary = "\n".join(safety_eval.safety_notes) if safety_eval.safety_notes else "Routine validated as conflict-free and compliant with safety guidelines."

    routine = SkincareRoutine(
        user_id=user.id,
        assessment_id=assessment.id,
        morning_routine=json.dumps(morning_steps),
        evening_routine=json.dumps(evening_steps),
        weekly_routine=json.dumps(weekly_steps),
        seasonal_notes=seasonal_notes,
        safety_notes=safety_notes_summary
    )

    db.add(routine)
    db.commit()
    db.refresh(routine)

    logger.info("Skincare Routine generated deterministically for user_id=%s (primary_concern=%s, skin_type=%s)", user.id, primary, skin_type)
    return routine

def add_product_to_user_routine(
    db: Session,
    user: User,
    product: Any,
    time_of_day: str = "AM"
) -> SkincareRoutine:
    # 1. Fetch current routine or generate if none exists
    routine = db.query(SkincareRoutine).filter(
        SkincareRoutine.user_id == user.id
    ).order_by(SkincareRoutine.created_at.desc()).first()

    if not routine:
        assessment = user.assessments[-1] if user.assessments else None
        if not assessment:
            from app.services.skin_assessment_service import analyze_skin_profile
            assessment = analyze_skin_profile(db, user)
        routine = generate_personalized_routine(db, user, assessment)

    morning_steps = json.loads(routine.morning_routine) if routine.morning_routine else []
    evening_steps = json.loads(routine.evening_routine) if routine.evening_routine else []

    # Map product category to step category and placement
    cat = product.category.strip()
    key_ings = [a.strip() for a in product.active_ingredients.split(",") if a.strip()]

    new_step = {
        "step_number": 0,  # Will be renumbered
        "category": cat,
        "product_type": f"{product.name} ({product.brand})",
        "key_ingredients": key_ings,
        "instructions": f"Apply {product.name} following standard cleansing protocol.",
        "frequency": f"Daily {time_of_day}",
        "safety_notes": f"Added to custom routine from Product Intelligence ({product.brand})."
    }

    # Helper to insert or replace in a steps list based on category
    def insert_or_update_step(steps_list: List[Dict[str, Any]], step_item: Dict[str, Any]) -> List[Dict[str, Any]]:
        # Check if same category already exists -> replace or append
        replaced = False
        updated: List[Dict[str, Any]] = []
        for s in steps_list:
            if s.get("category", "").lower() == step_item["category"].lower():
                updated.append(step_item)
                replaced = True
            else:
                updated.append(s)
        if not replaced:
            updated.append(step_item)
        # Renumber steps
        for idx, s in enumerate(updated, start=1):
            s["step_number"] = idx
        return updated

    if time_of_day.upper() in ["AM", "BOTH"]:
        morning_steps = insert_or_update_step(morning_steps, dict(new_step, frequency="Daily AM"))
    if time_of_day.upper() in ["PM", "BOTH"]:
        evening_steps = insert_or_update_step(evening_steps, dict(new_step, frequency="Daily PM"))
    if time_of_day.upper() in ["WEEKLY", "WEEK"]:
        weekly_steps = json.loads(routine.weekly_routine) if routine.weekly_routine else []
        weekly_steps = insert_or_update_step(weekly_steps, dict(new_step, frequency="1-2x per week PM"))
        routine.weekly_routine = json.dumps(weekly_steps)

    routine.morning_routine = json.dumps(morning_steps)
    routine.evening_routine = json.dumps(evening_steps)
    db.commit()
    db.refresh(routine)

    logger.info("Successfully added product id=%d to user_id=%d routine for %s", product.id, user.id, time_of_day)
    return routine

