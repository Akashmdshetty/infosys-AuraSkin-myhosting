import logging
import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.models import User, SkinAssessment, Recommendation, SkinProfile
from app.services.evidence_service import get_all_ingredient_evidence
from app.services.safety_service import evaluate_ingredient_safety

logger = logging.getLogger(__name__)

def generate_evidence_recommendations(db: Session, user: User, assessment: SkinAssessment) -> List[Recommendation]:
    skin_prof: SkinProfile = user.skin_profile
    skin_type = skin_prof.skin_type.value if (skin_prof and skin_prof.skin_type) else "NORMAL"
    allergies = skin_prof.allergies if skin_prof else ""
    sensitivities = skin_prof.sensitivities if skin_prof else ""

    # Parse primary and secondary concerns
    primary_concern = assessment.primary_concern
    secondary_concerns = json.loads(assessment.secondary_concerns) if assessment.secondary_concerns else []
    all_target_concerns = [primary_concern] + secondary_concerns

    # Fetch candidate evidence database
    all_evidence = get_all_ingredient_evidence()
    
    # Run safety evaluation
    safety_eval = evaluate_ingredient_safety(all_evidence, allergies, sensitivities, skin_type)
    approved_ingredients = safety_eval.approved_ingredients

    recommendations_to_save: List[Recommendation] = []

    # Map prioritized concerns to evidence-backed active ingredients
    for concern in all_target_concerns:
        for ing in approved_ingredients:
            targets = ing["target_concerns"]
            if any(concern.lower() in t.lower() or t.lower() in concern.lower() for t in targets):
                # Avoid duplicate recommendations
                if not any(r.ingredient_or_category == ing["ingredient_name"] for r in recommendations_to_save):
                    rec = Recommendation(
                        user_id=user.id,
                        assessment_id=assessment.id,
                        recommendation_type="INGREDIENT",
                        ingredient_or_category=ing["ingredient_name"],
                        reason=f"Evidence-backed active targeted for concern '{concern}' and biocompatible with {skin_type} skin.",
                        user_factor_trigger=f"Prioritized concern: {concern} | Skin type: {skin_type}",
                        target_concern=concern,
                        precautions=ing.get("sensitivity_warnings", "Patch test before full application."),
                        evidence_reference=f"{ing['evidence_level']} - {ing['source_reference']}"
                    )
                    recommendations_to_save.append(rec)

    # Always include baseline hydrators if approved
    barrier_actives = [ing for ing in approved_ingredients if ing["ingredient_name"] in ["Hyaluronic Acid", "Ceramides (NP / AP / EOP)"]]
    for ing in barrier_actives:
        if not any(r.ingredient_or_category == ing["ingredient_name"] for r in recommendations_to_save):
            rec = Recommendation(
                user_id=user.id,
                assessment_id=assessment.id,
                recommendation_type="INGREDIENT",
                ingredient_or_category=ing["ingredient_name"],
                reason="Essential epidermal barrier maintenance ingredient to preserve lipid integrity and transepidermal hydration.",
                user_factor_trigger=f"Baseline barrier health optimization for {skin_type} profile",
                target_concern="Barrier Maintenance",
                precautions=ing.get("sensitivity_warnings", "Hypoallergenic and non-comedogenic."),
                evidence_reference=f"{ing['evidence_level']} - {ing['source_reference']}"
            )
            recommendations_to_save.append(rec)

    # Product category recommendations
    category_recs = [
        {
            "category": "Broad-Spectrum Mineral Sunscreen SPF 50+",
            "reason": "Crucial daily defense against photo-aging, pigment dark spots, and solar oxidative stress.",
            "trigger": "Environmental UV protection guidelines",
            "concern": "Sun Exposure / Hyperpigmentation Prevention",
            "precautions": "Reapply every 2 hours during direct outdoor exposure.",
            "evidence": "Level I Clinical Evidence - American Academy of Dermatology (AAD)"
        },
        {
            "category": "Nourishing Night Recovery Lipids / Ceramides",
            "reason": "Supports nocturnal cellular repair and lipid barrier replenishment while sleeping.",
            "trigger": "Nocturnal dermal restoration cycle",
            "concern": "Dryness & Barrier Support",
            "precautions": "Apply as final step over hydration serum.",
            "evidence": "Clinical Dermatology Review - DermNet NZ"
        }
    ]

    for cat in category_recs:
        if not any(r.ingredient_or_category == cat["category"] for r in recommendations_to_save):
            rec = Recommendation(
                user_id=user.id,
                assessment_id=assessment.id,
                recommendation_type="PRODUCT_CATEGORY",
                ingredient_or_category=cat["category"],
                reason=cat["reason"],
                user_factor_trigger=cat["trigger"],
                target_concern=cat["concern"],
                precautions=cat["precautions"],
                evidence_reference=cat["evidence"]
            )
            recommendations_to_save.append(rec)

    # Save recommendations to DB
    for r in recommendations_to_save:
        db.add(r)
    db.commit()

    logger.info("Saved %d evidence-backed recommendations for user_id=%s", len(recommendations_to_save), user.id)
    return recommendations_to_save
