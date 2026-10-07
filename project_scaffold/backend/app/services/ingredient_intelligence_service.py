import logging
import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models import User, SkinProfile, SkinAssessment
from app.services.evidence_service import EVIDENCE_KNOWLEDGE_BASE
from app.services.safety_service import evaluate_ingredient_safety
from app.schemas.ingredient_intelligence import (
    IngredientDetail, IngredientInteractionDetail, IngredientAnalysisResult,
    IngredientSuitabilityResponse, IngredientInteractionCheckResponse
)

logger = logging.getLogger(__name__)

# Extended detailed ingredient dictionary
EXTENDED_INGREDIENT_CATALOG: Dict[str, Dict[str, Any]] = {
    "salicylic acid": {
        "name": "Salicylic Acid (BHA)",
        "category": "Exfoliant / Beta Hydroxy Acid",
        "primary_benefits": "Lipophilic acid that penetrates pores, clears excess sebum, unclogs comedones, and reduces inflammation.",
        "suitable_skin_types": ["OILY", "COMBINATION", "NORMAL"],
        "target_concerns": ["Acne", "Oily Skin", "Dark Spots", "Uneven Skin Tone"],
        "conflicting_ingredients": ["Retinoids", "AHAs/BHAs (high concentrations)"],
        "sensitivity_warnings": "May cause dryness, desquamation, or irritation if overused or applied to a broken barrier.",
        "evidence_level": "High (Level I Clinical Evidence)",
        "source_reference": "American Academy of Dermatology (AAD) Acne Guidelines (2024)",
        "common_uses": "Pore clearing, breakout control, keratolytic exfoliation",
        "precautions": "Avoid combining with potent retinoids in the same application; patch test before use.",
        "interactions": [
            {
                "with_ingredient": "Retinoids",
                "interaction_type": "CONFLICT",
                "severity": "HIGH",
                "explanation": "Simultaneous application can disrupt the lipid moisture barrier and trigger severe erythema and flaking."
            },
            {
                "with_ingredient": "Niacinamide",
                "interaction_type": "SYNERGISTIC",
                "severity": "NONE",
                "explanation": "Niacinamide calms inflammation and supports the epidermal barrier during salicylic exfoliation."
            }
        ]
    },
    "niacinamide": {
        "name": "Niacinamide (Vitamin B3)",
        "category": "Antioxidant / Barrier Support",
        "primary_benefits": "Enhances ceramide synthesis, regulates sebum secretion, reduces hyperpigmentation and calms facial redness.",
        "suitable_skin_types": ["DRY", "OILY", "COMBINATION", "SENSITIVE", "NORMAL"],
        "target_concerns": ["Hyperpigmentation", "Dark Spots", "Redness", "Uneven Skin Tone", "Oily Skin"],
        "conflicting_ingredients": [],
        "sensitivity_warnings": "Generally well tolerated; high concentrations (>10%) may cause transient flushing.",
        "evidence_level": "High (Peer-Reviewed Clinical Trials)",
        "source_reference": "Journal of Clinical and Aesthetic Dermatology",
        "common_uses": "Barrier reinforcement, sebum balance, tone brightening, post-inflammatory erythema fade",
        "precautions": "Ideal at 2% to 5% concentrations for sensitive skins.",
        "interactions": [
            {
                "with_ingredient": "Hyaluronic Acid",
                "interaction_type": "SYNERGISTIC",
                "severity": "NONE",
                "explanation": "Provides dual moisture barrier strengthening and deep hydration."
            },
            {
                "with_ingredient": "Vitamin C (L-Ascorbic Acid)",
                "interaction_type": "CAUTION",
                "severity": "LOW",
                "explanation": "In unbuffered low-pH formulations, slight flushing may occur; optimal when spaced AM/PM."
            }
        ]
    },
    "retinoids": {
        "name": "Retinoids (Adapalene / Tretinoin / Retinol)",
        "category": "Cellular Turnover / Vitamin A Derivative",
        "primary_benefits": "Accelerates keratinocyte turnover, stimulates type I collagen synthesis, prevents microcomedones, and smoothes fine lines.",
        "suitable_skin_types": ["NORMAL", "OILY", "COMBINATION"],
        "target_concerns": ["Wrinkles", "Fine Lines", "Acne", "Hyperpigmentation", "Uneven Skin Tone"],
        "conflicting_ingredients": ["AHAs/BHAs", "Salicylic Acid", "Benzoyl Peroxide", "Vitamin C"],
        "sensitivity_warnings": "Contraindicated in pregnancy/lactation. High risk of retinization (dryness, peeling) if not introduced gradually.",
        "evidence_level": "Gold Standard (FDA Approved & Level I Medical Evidence)",
        "source_reference": "FDA OTC Monograph & American Academy of Dermatology Guidelines",
        "common_uses": "Anti-aging cellular remodeling, acne reduction, texture smoothing",
        "precautions": "Apply only at night; introduce 1-2 times weekly; mandatory broad-spectrum SPF 50+ daily.",
        "interactions": [
            {
                "with_ingredient": "Salicylic Acid",
                "interaction_type": "CONFLICT",
                "severity": "HIGH",
                "explanation": "Over-exfoliation and intense barrier disruption."
            },
            {
                "with_ingredient": "Ceramides",
                "interaction_type": "SYNERGISTIC",
                "severity": "NONE",
                "explanation": "Ceramides buffer retinoid-induced dryness and reinforce lipid matrix integrity."
            }
        ]
    },
    "hyaluronic acid": {
        "name": "Hyaluronic Acid",
        "category": "Humectant Hydrator",
        "primary_benefits": "Binds up to 1000x its molecular weight in water, plumping epidermal tissue and restoring natural moisturizing factor (NMF).",
        "suitable_skin_types": ["DRY", "OILY", "COMBINATION", "SENSITIVE", "NORMAL"],
        "target_concerns": ["Dry Skin", "Fine Lines", "Sensitive Skin"],
        "conflicting_ingredients": [],
        "sensitivity_warnings": "Non-comedogenic, hypoallergenic, and universal biocompatibility.",
        "evidence_level": "High (Clinical Hydration Studies)",
        "source_reference": "DermNet NZ Dermatological Pharmacology Digest",
        "common_uses": "Deep dermal hydration, moisture retention, surface plumping",
        "precautions": "Apply on damp skin followed by an occlusive moisturizer to lock in hydration.",
        "interactions": [
            {
                "with_ingredient": "All Actives",
                "interaction_type": "SYNERGISTIC",
                "severity": "NONE",
                "explanation": "Safely combines with all active ingredients and enhances tissue tolerability."
            }
        ]
    },
    "vitamin c": {
        "name": "Vitamin C (L-Ascorbic Acid / Derivatives)",
        "category": "Potent Antioxidant / Tyrosinase Inhibitor",
        "primary_benefits": "Neutralizes solar reactive oxygen species (ROS), suppresses melanogenesis, brightens dullness, and boosts collagen.",
        "suitable_skin_types": ["NORMAL", "DRY", "COMBINATION", "OILY"],
        "target_concerns": ["Hyperpigmentation", "Dark Spots", "Uneven Skin Tone", "Fine Lines"],
        "conflicting_ingredients": ["Retinoids", "Benzoyl Peroxide"],
        "sensitivity_warnings": "Low pH pure L-Ascorbic Acid can irritate sensitized barriers; derivatives like Sodium Ascorbyl Phosphate are milder.",
        "evidence_level": "High (Level I Clinical Evidence)",
        "source_reference": "Journal of Investigative Dermatology",
        "common_uses": "Morning antioxidant photoprotection, dark spot lightening, collagen synthesis",
        "precautions": "Store away from heat and light to prevent oxidation; pair with SPF for maximum UV defense.",
        "interactions": [
            {
                "with_ingredient": "Retinoids",
                "interaction_type": "CAUTION",
                "severity": "MEDIUM",
                "explanation": "Best separated into Vitamin C (AM) and Retinoid (PM) to avoid irritation and pH cancellation."
            },
            {
                "with_ingredient": "Sunscreen (SPF)",
                "interaction_type": "SYNERGISTIC",
                "severity": "NONE",
                "explanation": "Forms a powerful photoprotective shield against UV radiation and free radical oxidation."
            }
        ]
    },
    "ceramides": {
        "name": "Ceramides (NP / AP / EOP)",
        "category": "Barrier Repair Lipids",
        "primary_benefits": "Replenishes the intercellular lipid matrix (50% of stratum corneum), reduces TEWL, and calms irritated skin.",
        "suitable_skin_types": ["DRY", "SENSITIVE", "NORMAL", "COMBINATION", "OILY"],
        "target_concerns": ["Dry Skin", "Sensitive Skin", "Redness"],
        "conflicting_ingredients": [],
        "sensitivity_warnings": "Extremely gentle, bio-identical lipid complex.",
        "evidence_level": "High (Level I Dermatological Evidence)",
        "source_reference": "American Academy of Dermatology (AAD) Barrier Function Studies",
        "common_uses": "Barrier restoration, skin recovery, post-procedure calming, moisture sealing",
        "precautions": "None; essential foundational ingredient for all skin types.",
        "interactions": [
            {
                "with_ingredient": "Retinoids & Acids",
                "interaction_type": "SYNERGISTIC",
                "severity": "NONE",
                "explanation": "Protects and rebuilds the skin lipid barrier when using exfoliating actives."
            }
        ]
    },
    "peptides": {
        "name": "Peptides (Signal & Copper Peptides)",
        "category": "Cell Signaling Biomolecules",
        "primary_benefits": "Promotes elastin and collagen matrix synthesis, improves skin elasticity, and accelerates cellular repair.",
        "suitable_skin_types": ["NORMAL", "DRY", "COMBINATION", "OILY", "SENSITIVE"],
        "target_concerns": ["Wrinkles", "Fine Lines", "Uneven Skin Tone"],
        "conflicting_ingredients": ["Strong Direct Acids (Direct AHAs/BHAs)"],
        "sensitivity_warnings": "Highly tolerated across reactive profiles.",
        "evidence_level": "Moderate-High (Peer-Reviewed In-Vivo Studies)",
        "source_reference": "International Journal of Cosmetic Science",
        "common_uses": "Structural firming, anti-aging recovery, barrier resilience",
        "precautions": "Avoid layering copper peptides directly with strong ascorbic acid or unbuffered AHAs.",
        "interactions": [
            {
                "with_ingredient": "Hyaluronic Acid",
                "interaction_type": "SYNERGISTIC",
                "severity": "NONE",
                "explanation": "Synergistically boosts moisture retention and collagen matrix plumping."
            }
        ]
    },
    "ahas/bhas": {
        "name": "AHAs/BHAs (Glycolic, Lactic, Salicylic Acid)",
        "category": "Chemical Exfoliants",
        "primary_benefits": "Loosens dead desmosomal bonds, clears superficial dead cell accumulation, refines texture, and boosts cellular renewal.",
        "suitable_skin_types": ["NORMAL", "COMBINATION", "OILY"],
        "target_concerns": ["Hyperpigmentation", "Dark Spots", "Uneven Skin Tone", "Acne"],
        "conflicting_ingredients": ["Retinoids", "High Dose Vitamin C"],
        "sensitivity_warnings": "Increases photosensitivity; mandatory daily SPF 30+; avoid on compromised barriers.",
        "evidence_level": "High (Level I Clinical Evidence)",
        "source_reference": "FDA Cosmetic Safety Guidelines & DermNet Review",
        "common_uses": "Surface smoothing, radiant tone exfoliation, cellular renewal",
        "precautions": "Limit to 1-3 times weekly; do not combine with physical scrubs.",
        "interactions": [
            {
                "with_ingredient": "Retinoids",
                "interaction_type": "CONFLICT",
                "severity": "HIGH",
                "explanation": "Extreme barrier breakdown and increased trans-epidermal water loss."
            }
        ]
    },
    "centella asiatica": {
        "name": "Centella Asiatica (Cica / Madecassoside)",
        "category": "Botanical Calming Active",
        "primary_benefits": "Potent anti-inflammatory agent that accelerates wound healing, synthesizes collagen, and soothes acute erythema.",
        "suitable_skin_types": ["SENSITIVE", "DRY", "NORMAL", "OILY", "COMBINATION"],
        "target_concerns": ["Redness", "Sensitive Skin", "Acne"],
        "conflicting_ingredients": [],
        "sensitivity_warnings": "Extremely safe and calming.",
        "evidence_level": "High (Clinical Dermatology Trials)",
        "source_reference": "Phytomedicine & Journal of Dermatological Science",
        "common_uses": "Redness reduction, irritation relief, barrier rescue",
        "precautions": "None; excellent for post-active recovery.",
        "interactions": [
            {
                "with_ingredient": "All Actives",
                "interaction_type": "SYNERGISTIC",
                "severity": "NONE",
                "explanation": "Acts as an anti-inflammatory cushion against active irritation."
            }
        ]
    },
    "azelaic acid": {
        "name": "Azelaic Acid",
        "category": "Dicarboxylic Acid / Antibacterial & Anti-inflammatory",
        "primary_benefits": "Selectively targets hyperactive melanocytes, reduces Cutibacterium acnes, and calms rosacea-related redness.",
        "suitable_skin_types": ["SENSITIVE", "OILY", "COMBINATION", "NORMAL", "DRY"],
        "target_concerns": ["Acne", "Redness", "Hyperpigmentation", "Dark Spots"],
        "conflicting_ingredients": [],
        "sensitivity_warnings": "Mild tingling upon initial applications; safe during pregnancy.",
        "evidence_level": "High (Level I Medical Evidence & FDA Approval)",
        "source_reference": "Cochrane Systematic Review for Rosacea and Acne",
        "common_uses": "Rosacea calming, post-inflammatory hyperpigmentation clearance, gentle breakout management",
        "precautions": "Can be used morning or night; well tolerated even by sensitive skin.",
        "interactions": [
            {
                "with_ingredient": "Niacinamide",
                "interaction_type": "SYNERGISTIC",
                "severity": "NONE",
                "explanation": "Powerful dual action against redness, acne lesions, and pigmentation."
            }
        ]
    }
}

def get_all_ingredients_catalog() -> List[IngredientDetail]:
    result: List[IngredientDetail] = []
    for key, data in EXTENDED_INGREDIENT_CATALOG.items():
        interactions = [IngredientInteractionDetail(**i) for i in data.get("interactions", [])]
        result.append(IngredientDetail(
            name=data["name"],
            category=data["category"],
            primary_benefits=data["primary_benefits"],
            suitable_skin_types=data["suitable_skin_types"],
            target_concerns=data["target_concerns"],
            conflicting_ingredients=data["conflicting_ingredients"],
            sensitivity_warnings=data["sensitivity_warnings"],
            evidence_level=data["evidence_level"],
            source_reference=data["source_reference"],
            review_date=data.get("review_date", "2026-01-01"),
            common_uses=data.get("common_uses"),
            precautions=data.get("precautions"),
            interactions=interactions
        ))
    return result

def get_ingredient_by_name(name: str) -> Optional[IngredientDetail]:
    cleaned = name.lower().strip()
    for key, data in EXTENDED_INGREDIENT_CATALOG.items():
        if key in cleaned or cleaned in key or data["name"].lower() in cleaned or cleaned in data["name"].lower():
            interactions = [IngredientInteractionDetail(**i) for i in data.get("interactions", [])]
            return IngredientDetail(
                name=data["name"],
                category=data["category"],
                primary_benefits=data["primary_benefits"],
                suitable_skin_types=data["suitable_skin_types"],
                target_concerns=data["target_concerns"],
                conflicting_ingredients=data["conflicting_ingredients"],
                sensitivity_warnings=data["sensitivity_warnings"],
                evidence_level=data["evidence_level"],
                source_reference=data["source_reference"],
                review_date=data.get("review_date", "2026-01-01"),
                common_uses=data.get("common_uses"),
                precautions=data.get("precautions"),
                interactions=interactions
            )
    return None

def analyze_ingredient_suitability(
    db: Session,
    user: User,
    ingredient_name: Optional[str] = None,
    ingredients_list: Optional[List[str]] = None,
    custom_formula_text: Optional[str] = None
) -> IngredientSuitabilityResponse:
    skin_prof: Optional[SkinProfile] = user.skin_profile
    skin_type = skin_prof.skin_type.value if (skin_prof and skin_prof.skin_type) else "NORMAL"
    allergies = (skin_prof.allergies or "") if skin_prof else ""
    sensitivities = (skin_prof.sensitivities or "") if skin_prof else ""

    # Parse candidates
    candidates: List[str] = []
    if ingredient_name:
        candidates.append(ingredient_name.strip())
    if ingredients_list:
        candidates.extend([i.strip() for i in ingredients_list if i.strip()])
    if custom_formula_text:
        # Split by commas or semicolons or newlines
        split_items = re.split(r'[,;\n]+', custom_formula_text)
        candidates.extend([s.strip() for s in split_items if s.strip()])

    # Deduplicate
    unique_candidates: List[str] = []
    for c in candidates:
        if c and not any(c.lower() == uc.lower() for uc in unique_candidates):
            unique_candidates.append(c)

    if not unique_candidates:
        # Default to all catalog ingredients
        unique_candidates = [data["name"] for data in EXTENDED_INGREDIENT_CATALOG.values()]

    ignore_words = {"none", "none recorded", "n/a", "no", "nil", "nothing"}
    allergies_lower = [a.strip().lower() for a in allergies.split(",") if a.strip() and a.strip().lower() not in ignore_words]
    sensitivities_lower = [s.strip().lower() for s in sensitivities.split(",") if s.strip() and s.strip().lower() not in ignore_words]

    results: List[IngredientAnalysisResult] = []
    suitable_count = 0
    conflict_count = 0

    # Extended list of recognized cosmetic carriers and bases
    SAFE_CARRIERS = {
        "aqua", "water", "glycerin", "caprylic/capric triglyceride", "butylene glycol",
        "propylene glycol", "xanthan gum", "dimethicone", "phenoxyethanol", "cetearyl alcohol",
        "butyrospermum parkii", "butyrospermum parkii (shea) butter", "shea butter", "panthenol",
        "allantoin", "squalane", "tocopherol", "alpha tocopherol", "tocopheryl acetate",
        "phytosphingosine", "cholesterol", "sodium hyaluronate", "hydrolyzed hyaluronic acid",
        "potassium sorbate", "sodium benzoate", "disodium edta", "laureth-23", "ethoxydiglycol",
        "triethanolamine", "carbomer", "ethylhexylglycerin", "stearic acid", "cetyl alcohol"
    }

    # Fragrance components and potential irritants
    FRAGRANCE_IRRITANTS = {
        "limonene", "linalool", "citral", "geraniol", "eugenol", "coumarin", "citronellol",
        "farnesol", "fragrance", "parfum", "fragrance (parfum)", "bht", "bha (preservative)",
        "alcohol denat", "sd alcohol", "isopropyl alcohol"
    }

    for ing_query in unique_candidates:
        matched_info = get_ingredient_by_name(ing_query)
        ing_name = matched_info.name if matched_info else ing_query
        ing_lower = ing_name.lower()

        # Check allergy conflict (HIGH severity)
        allergy_conflict = False
        allergy_reason = ""
        for alg in allergies_lower:
            if alg in ing_lower or (len(alg) > 3 and alg in ing_query.lower()):
                allergy_conflict = True
                allergy_reason = f"Conflicts with documented user allergy: '{alg}'"
                break

        if allergy_conflict:
            results.append(IngredientAnalysisResult(
                ingredient=ing_name,
                suitable=False,
                reason=allergy_reason,
                severity="HIGH",
                category=matched_info.category if matched_info else "Allergen Alert",
                benefits=matched_info.primary_benefits if matched_info else None,
                precautions="STRICT CONTRAINDICATION: Avoid this ingredient entirely.",
                evidence_reference=matched_info.evidence_level if matched_info else "Clinical Allergen Protocol"
            ))
            conflict_count += 1
            continue

        # Check sensitivity conflict (MEDIUM severity)
        sensitivity_conflict = False
        sensitivity_reason = ""
        for sens in sensitivities_lower:
            if sens in ing_lower or ("retinoid" in ing_lower and "retin" in sens) or ("acid" in ing_lower and "acid" in sens and "hyaluronic" not in ing_lower):
                sensitivity_conflict = True
                sensitivity_reason = f"Triggers documented skin sensitivity: '{sens}'"
                break

        if sensitivity_conflict:
            results.append(IngredientAnalysisResult(
                ingredient=ing_name,
                suitable=False,
                reason=sensitivity_reason,
                severity="MEDIUM",
                category=matched_info.category if matched_info else "Active Ingredient",
                benefits=matched_info.primary_benefits if matched_info else None,
                precautions="Requires patch test or gradual introduction; lower strength recommended.",
                evidence_reference=matched_info.evidence_level if matched_info else "Dermatology Sensitivity Standard"
            ))
            conflict_count += 1
            continue

        # Check skin type mismatch (CAUTION severity)
        if matched_info and skin_type.upper() not in [st.upper() for st in matched_info.suitable_skin_types]:
            if skin_type.upper() == "SENSITIVE" and any("acid" in ing_lower or "retin" in ing_lower for _ in [1]):
                results.append(IngredientAnalysisResult(
                    ingredient=ing_name,
                    suitable=False,
                    reason=f"Contraindicated for {skin_type} skin due to potential barrier irritation.",
                    severity="CAUTION",
                    category=matched_info.category,
                    benefits=matched_info.primary_benefits,
                    precautions=matched_info.precautions,
                    evidence_reference=matched_info.evidence_level
                ))
                conflict_count += 1
                continue

        # Check recognized fragrance allergens or high-volatility oils
        if any(f in ing_lower for f in FRAGRANCE_IRRITANTS) or "oil" in ing_lower and any(b in ing_lower for b in ["eucalyptus", "lemon", "lavender", "peppermint", "citrus"]):
            results.append(IngredientAnalysisResult(
                ingredient=ing_query.strip(),
                suitable=False,
                reason="Fragrance component or volatile essential oil; potential contact sensitizer for reactive skin barriers.",
                severity="CAUTION",
                category="Fragrance Allergen / Essential Oil",
                benefits="Aromatic sensory enhancement.",
                precautions="Perform patch test before facial use. May cause sensitization in compromised skin barriers.",
                evidence_reference="EU Cosmetic Fragrance Directive & SCCS Guidelines"
            ))
            conflict_count += 1
            continue

        # Check unknown ingredient vs common benign cosmetics solvents/carriers
        if not matched_info:
            if any(sc in ing_lower for sc in SAFE_CARRIERS):
                results.append(IngredientAnalysisResult(
                    ingredient=ing_query.strip(),
                    suitable=True,
                    reason=f"Formulation carrier/emollient compatible with {skin_type} skin.",
                    severity="SAFE",
                    category="Formulation Base / Emollient",
                    benefits="Provides vehicle stability and surface moisture barrier support.",
                    precautions="Standard cosmetic formulation component.",
                    evidence_reference="Cosmetic Ingredient Review (CIR)"
                ))
                suitable_count += 1
                continue
            else:
                results.append(IngredientAnalysisResult(
                    ingredient=ing_query.strip(),
                    suitable=False,
                    reason="AuraSkin could not confidently identify this ingredient. We will not classify it without sufficient scientific data.",
                    severity="UNKNOWN",
                    category="Unverified Active / Excipient",
                    benefits="Pending laboratory & clinical classification.",
                    precautions="Exercise caution and patch test before wide application.",
                    evidence_reference="Awaiting Clinical Literature Indexing"
                ))
                conflict_count += 1
                continue

        # Passed all safety checks -> SAFE
        suitable_count += 1
        results.append(IngredientAnalysisResult(
            ingredient=ing_name,
            suitable=True,
            reason=f"Biocompatible with {skin_type} skin profile and active dermal objectives.",
            severity="SAFE",
            category=matched_info.category,
            benefits=matched_info.primary_benefits,
            precautions=matched_info.precautions or "Standard patch test advised.",
            evidence_reference=matched_info.evidence_level
        ))

    summary = (
        f"Analyzed {len(results)} ingredients for {skin_type} skin profile: "
        f"{suitable_count} biocompatible, {conflict_count} flagged (conflicts, cautions, or unverified)."
    )

    general_precautions = [
        "Always introduce only one potent active ingredient at a time into your routine.",
        "Perform a 24-hour patch test behind the ear before full facial application.",
        "Maintain adequate sun protection (SPF 50+) when utilizing exfoliating acids or retinoids."
    ]

    return IngredientSuitabilityResponse(
        user_skin_type=skin_type,
        has_compromised_barrier="sensitive" in skin_type.lower() or conflict_count > 2,
        total_analyzed=len(results),
        suitable_count=suitable_count,
        conflict_count=conflict_count,
        results=results,
        overall_safety_summary=summary,
        general_precautions=general_precautions
    )

def check_ingredient_interactions(ingredients: List[str]) -> IngredientInteractionCheckResponse:
    interactions_found: List[IngredientInteractionDetail] = []
    cleaned = [i.strip().lower() for i in ingredients if i.strip()]

    # Rules of chemical interactions
    has_retinoid = any("retin" in i for i in cleaned)
    has_salicylic = any("salicylic" in i or "bha" in i for i in cleaned)
    has_aha = any("glycolic" in i or "lactic" in i or "aha" in i for i in cleaned)
    has_vit_c = any("ascorbic" in i or "vitamin c" in i for i in cleaned)
    has_benzoyl = any("benzoyl" in i for i in cleaned)
    has_niacinamide = any("niacinamide" in i for i in cleaned)
    has_ceramides = any("ceramide" in i for i in cleaned)
    has_hyaluronic = any("hyaluronic" in i for i in cleaned)

    if has_retinoid and has_salicylic:
        interactions_found.append(IngredientInteractionDetail(
            with_ingredient="Retinoids + Salicylic Acid (BHA)",
            interaction_type="CONFLICT",
            severity="HIGH",
            explanation="Concurrent direct layering strips essential lipids, accelerates desquamation, and induces barrier breakdown."
        ))

    if has_retinoid and has_aha:
        interactions_found.append(IngredientInteractionDetail(
            with_ingredient="Retinoids + AHAs (Glycolic / Lactic Acid)",
            interaction_type="CONFLICT",
            severity="HIGH",
            explanation="Dual heavy exfoliation significantly compromises stratum corneum barrier and causes redness/flaking."
        ))

    if has_vit_c and has_benzoyl:
        interactions_found.append(IngredientInteractionDetail(
            with_ingredient="Vitamin C (L-Ascorbic) + Benzoyl Peroxide",
            interaction_type="CONFLICT",
            severity="MEDIUM",
            explanation="Benzoyl peroxide oxidizes L-Ascorbic Acid instantly, rendering both molecules inactive."
        ))

    if has_vit_c and has_retinoid:
        interactions_found.append(IngredientInteractionDetail(
            with_ingredient="Vitamin C + Retinoids",
            interaction_type="CAUTION",
            severity="MEDIUM",
            explanation="Different optimal pH requirements. Recommended to apply Vitamin C in AM and Retinoids in PM."
        ))

    if has_niacinamide and has_salicylic:
        interactions_found.append(IngredientInteractionDetail(
            with_ingredient="Niacinamide + Salicylic Acid",
            interaction_type="SYNERGISTIC",
            severity="NONE",
            explanation="Excellent clinical pair: BHA unclogs pores while Niacinamide soothes inflammation and prevents irritation."
        ))

    if has_ceramides and (has_retinoid or has_aha or has_salicylic):
        interactions_found.append(IngredientInteractionDetail(
            with_ingredient="Ceramides + Exfoliating Actives",
            interaction_type="SYNERGISTIC",
            severity="NONE",
            explanation="Ceramides reinforce lipid bilayer matrix and prevent trans-epidermal water loss caused by potent actives."
        ))

    if has_hyaluronic:
        interactions_found.append(IngredientInteractionDetail(
            with_ingredient="Hyaluronic Acid + Moisture Barrier",
            interaction_type="SYNERGISTIC",
            severity="NONE",
            explanation="Universal humectant pairing safely optimizes hydration across all active formulations."
        ))

    has_conflicts = any(i.interaction_type == "CONFLICT" for i in interactions_found)
    conflict_count = sum(1 for i in interactions_found if i.interaction_type == "CONFLICT")

    if has_conflicts:
        recommendation = "Active conflicts detected. Separate conflicting ingredients into alternating AM/PM routines or alternate days."
    elif any(i.interaction_type == "CAUTION" for i in interactions_found):
        recommendation = "Mild caution advised. Space application times (e.g. morning vs. evening) to maximize bioavailability."
    else:
        recommendation = "Formula pairing is chemically stable and biocompatible."

    return IngredientInteractionCheckResponse(
        has_conflicts=has_conflicts,
        conflict_count=conflict_count,
        interactions=interactions_found,
        recommendation=recommendation
    )
