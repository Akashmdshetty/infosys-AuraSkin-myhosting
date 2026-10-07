import logging
from typing import List, Dict, Any, Set

logger = logging.getLogger(__name__)

class SafetyEvaluationResult:
    def __init__(
        self,
        approved_ingredients: List[Dict[str, Any]],
        excluded_ingredients: List[Dict[str, Any]],
        safety_notes: List[str],
        requires_dermatologist_escalation: bool
    ):
        self.approved_ingredients = approved_ingredients
        self.excluded_ingredients = excluded_ingredients  # Contains {"ingredient": name, "status": "excluded", "reason": text}
        self.safety_notes = safety_notes
        self.requires_dermatologist_escalation = requires_dermatologist_escalation

def evaluate_ingredient_safety(
    candidate_ingredients: List[Dict[str, Any]],
    user_allergies_str: str = "",
    user_sensitivities_str: str = "",
    skin_type: str = "NORMAL"
) -> SafetyEvaluationResult:
    approved: List[Dict[str, Any]] = []
    excluded: List[Dict[str, Any]] = []
    safety_notes: List[str] = []
    escalate = False

    allergies_list = [a.strip().lower() for a in (user_allergies_str or "").split(",") if a.strip()]
    sensitivities_list = [s.strip().lower() for s in (user_sensitivities_str or "").split(",") if s.strip()]

    # Standard safety precautions
    if "sensitive" in skin_type.lower() or any("sensitive" in s for s in sensitivities_list):
        safety_notes.append("Sensitive skin barrier alert: Potent exfoliant acids and retinoids require buffering and patch testing.")

    for ing in candidate_ingredients:
        name = ing["ingredient_name"]
        name_lower = name.lower()
        conflict_found = False
        conflict_reason = ""

        # Check explicit user allergies
        for allergy in allergies_list:
            if allergy in name_lower or any(word in name_lower for word in allergy.split() if len(word) > 3):
                conflict_found = True
                conflict_reason = f"Conflicts with recorded user allergy: '{allergy}'"
                break
        
        # Check explicit user sensitivities
        if not conflict_found:
            for sens in sensitivities_list:
                if sens in name_lower or ("retinoid" in name_lower and "retin" in sens) or ("acid" in name_lower and "acid" in sens and "hyaluronic" not in name_lower):
                    conflict_found = True
                    conflict_reason = f"Conflicts with recorded skin sensitivity: '{sens}'"
                    break

        # Check skin type contraindications
        if not conflict_found and skin_type.upper() == "SENSITIVE" and "retinoid" in name_lower:
            conflict_found = True
            conflict_reason = "Strong retinoid excluded for sensitive barrier profile; hydrating barrier alternatives prioritized."

        if conflict_found:
            excluded_item = dict(ing)
            excluded_item["status"] = "excluded"
            excluded_item["reason"] = conflict_reason
            excluded_item["exclusion_reason"] = conflict_reason
            excluded.append(excluded_item)
            logger.info("Safety exclusion triggered for %s: %s", name, conflict_reason)
        else:
            approved.append(ing)

    # Escalation indicator checks
    if any("cyst" in a or "severe" in a or "lesion" in a for a in allergies_list + sensitivities_list):
        escalate = True
        safety_notes.append("Severe dermal conditions detected in profile. Clinical evaluation by a certified Dermatologist is recommended.")

    return SafetyEvaluationResult(
        approved_ingredients=approved,
        excluded_ingredients=excluded,
        safety_notes=safety_notes,
        requires_dermatologist_escalation=escalate
    )
