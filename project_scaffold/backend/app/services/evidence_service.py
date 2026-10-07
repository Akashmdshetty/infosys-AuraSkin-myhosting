import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Pre-seeded evidence knowledge base of dermatological active ingredients
EVIDENCE_KNOWLEDGE_BASE: List[Dict[str, Any]] = [
    {
        "ingredient_name": "Salicylic Acid (BHA)",
        "category": "Exfoliant / Beta Hydroxy Acid",
        "primary_benefits": "Lipophilic acid that penetrates pores, clears sebum, unclogs comedones, and reduces inflammation.",
        "suitable_skin_types": ["OILY", "COMBINATION", "NORMAL"],
        "target_concerns": ["Acne", "Oily Skin", "Dark Spots", "Uneven Skin Tone"],
        "conflicting_ingredients": ["Retinoids", "AHAs/BHAs (high concentrations)"],
        "sensitivity_warnings": "May cause dryness or desquamation if overused on sensitive skin.",
        "evidence_level": "High (Level I Clinical Evidence)",
        "source_reference": "American Academy of Dermatology (AAD) Acne Management Guidelines (2024)",
        "review_date": "2026-01-01"
    },
    {
        "ingredient_name": "Niacinamide (Vitamin B3)",
        "category": "Antioxidant / Barrier Support",
        "primary_benefits": "Enhances ceramide synthesis, regulates sebum secretion, reduces hyperpigmentation and facial redness.",
        "suitable_skin_types": ["DRY", "OILY", "COMBINATION", "SENSITIVE", "NORMAL"],
        "target_concerns": ["Hyperpigmentation", "Dark Spots", "Redness", "Uneven Skin Tone", "Oily Skin"],
        "conflicting_ingredients": [],
        "sensitivity_warnings": "Well tolerated; concentrations above 10% may cause transient mild flushing in reactive skin.",
        "evidence_level": "High (Peer-Reviewed Clinical Trials)",
        "source_reference": "Journal of Clinical and Aesthetic Dermatology (DermNet Dermatology Review)",
        "review_date": "2026-01-01"
    },
    {
        "ingredient_name": "Retinoids (Adapalene / Tretinoin / Retinol)",
        "category": "Cellular Turnover / Vitamin A Derivative",
        "primary_benefits": "Accelerates keratinocyte turnover, stimulates type I collagen production, prevents microcomedones, smoothes fine lines.",
        "suitable_skin_types": ["NORMAL", "OILY", "COMBINATION"],
        "target_concerns": ["Wrinkles", "Fine Lines", "Acne", "Hyperpigmentation", "Uneven Skin Tone"],
        "conflicting_ingredients": ["AHAs/BHAs", "Vitamin C (L-Ascorbic Acid simultaneous use)", "Benzoyl Peroxide"],
        "sensitivity_warnings": "Contraindicated in pregnancy/lactation. High risk of retinization (dryness, erythema) if not introduced gradually.",
        "evidence_level": "Gold Standard (FDA Approved & Level I Medical Evidence)",
        "source_reference": "FDA OTC Monograph & American Academy of Dermatology Guidelines",
        "review_date": "2026-01-01"
    },
    {
        "ingredient_name": "Hyaluronic Acid",
        "category": "Humectant Hydrator",
        "primary_benefits": "Binds up to 1000x its weight in water, plump epidermal tissue, restores natural moisturizing factor (NMF).",
        "suitable_skin_types": ["DRY", "OILY", "COMBINATION", "SENSITIVE", "NORMAL"],
        "target_concerns": ["Dry Skin", "Fine Lines", "Sensitive Skin"],
        "conflicting_ingredients": [],
        "sensitivity_warnings": "Non-comedogenic and hypoallergenic.",
        "evidence_level": "High (Clinical Hydration Studies)",
        "source_reference": "DermNet NZ Dermatological Pharmacology Digest",
        "review_date": "2026-01-01"
    },
    {
        "ingredient_name": "Vitamin C (L-Ascorbic Acid / Derivatives)",
        "category": "Potent Antioxidant / Tyrosinase Inhibitor",
        "primary_benefits": "Neutralizes reactive oxygen species (ROS) from UV exposure, inhibits melanogenesis, brightens dull skin tone.",
        "suitable_skin_types": ["NORMAL", "DRY", "COMBINATION", "OILY"],
        "target_concerns": ["Hyperpigmentation", "Dark Spots", "Uneven Skin Tone", "Fine Lines"],
        "conflicting_ingredients": ["Retinoids", "Niacinamide (if unbuffered L-Ascorbic Acid)"],
        "sensitivity_warnings": "Low pH L-Ascorbic Acid can irritate highly sensitive or compromised skin barriers.",
        "evidence_level": "High (Level I Clinical Evidence)",
        "source_reference": "Journal of Investigative Dermatology",
        "review_date": "2026-01-01"
    },
    {
        "ingredient_name": "Ceramides (NP / AP / EOP)",
        "category": "Barrier Repair Lipids",
        "primary_benefits": "Replenishes intercellular lipid matrix, reduces transepidermal water loss (TEWL), calms irritated skin.",
        "suitable_skin_types": ["DRY", "SENSITIVE", "NORMAL", "COMBINATION", "OILY"],
        "target_concerns": ["Dry Skin", "Sensitive Skin", "Redness"],
        "conflicting_ingredients": [],
        "sensitivity_warnings": "Extremely gentle, biocompatible.",
        "evidence_level": "High (Level I Dermatological Evidence)",
        "source_reference": "American Academy of Dermatology (AAD) Barrier Function Studies",
        "review_date": "2026-01-01"
    },
    {
        "ingredient_name": "Peptides (Signal & Copper Peptides)",
        "category": "Cell Signaling Biomolecules",
        "primary_benefits": "Promotes elastin and collagen matrix synthesis, improves skin elasticity, supports tissue remodeling.",
        "suitable_skin_types": ["NORMAL", "DRY", "COMBINATION", "OILY", "SENSITIVE"],
        "target_concerns": ["Wrinkles", "Fine Lines", "Uneven Skin Tone"],
        "conflicting_ingredients": ["Strong Acids (Direct AHAs/BHAs)"],
        "sensitivity_warnings": "Well tolerated across skin types.",
        "evidence_level": "Moderate-High (Peer-Reviewed In-Vivo Studies)",
        "source_reference": "International Journal of Cosmetic Science",
        "review_date": "2026-01-01"
    },
    {
        "ingredient_name": "AHAs (Glycolic Acid / Lactic Acid)",
        "category": "Alpha Hydroxy Acid Exfoliant",
        "primary_benefits": "Dissolves desmosomes between dead superficial skin cells, boosts hydration (Lactic), improves texture.",
        "suitable_skin_types": ["DRY", "NORMAL", "COMBINATION"],
        "target_concerns": ["Hyperpigmentation", "Dark Spots", "Uneven Skin Tone", "Fine Lines"],
        "conflicting_ingredients": ["Retinoids", "BHA (simultaneous high dose)"],
        "sensitivity_warnings": "Increases photosensitivity; mandatory SPF 30+ daily.",
        "evidence_level": "High (Level I Evidence)",
        "source_reference": "FDA Cosmetic Safety Guidelines & DermNet Review",
        "review_date": "2026-01-01"
    }
]

def get_all_ingredient_evidence() -> List[Dict[str, Any]]:
    return EVIDENCE_KNOWLEDGE_BASE

def get_evidence_for_concern(concern: str) -> List[Dict[str, Any]]:
    results = []
    for item in EVIDENCE_KNOWLEDGE_BASE:
        if any(concern.lower() in tc.lower() for tc in item["target_concerns"]):
            results.append(item)
    return results
