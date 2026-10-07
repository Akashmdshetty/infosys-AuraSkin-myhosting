from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.ingredient_intelligence import (
    IngredientDetail, IngredientSuitabilityRequest, IngredientSuitabilityResponse,
    IngredientInteractionCheckRequest, IngredientInteractionCheckResponse
)
from app.services.ingredient_intelligence_service import (
    get_all_ingredients_catalog, get_ingredient_by_name,
    analyze_ingredient_suitability, check_ingredient_interactions
)

router = APIRouter()

@router.get("", response_model=List[IngredientDetail])
@router.get("/", response_model=List[IngredientDetail])
def list_ingredients():
    """Retrieve full educational and evidence-backed ingredient encyclopedia."""
    return get_all_ingredients_catalog()

@router.get("/{ingredient_name}", response_model=IngredientDetail)
def get_ingredient(ingredient_name: str):
    """Retrieve specific ingredient details, benefits, precautions, and interactions."""
    ing = get_ingredient_by_name(ingredient_name)
    if not ing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingredient '{ingredient_name}' not found in the intelligence encyclopedia."
        )
    return ing

@router.post("/analyze", response_model=IngredientSuitabilityResponse)
def analyze_ingredients(
    request: IngredientSuitabilityRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze ingredient suitability against authenticated user's skin profile,
    allergies, sensitivities, and barrier status.
    """
    return analyze_ingredient_suitability(
        db=db,
        user=current_user,
        ingredient_name=request.ingredient_name,
        ingredients_list=request.ingredients_list,
        custom_formula_text=request.custom_formula_text
    )

@router.post("/interactions", response_model=IngredientInteractionCheckResponse)
def check_interactions(request: IngredientInteractionCheckRequest):
    """
    Evaluate cross-ingredient chemical interaction stability, conflicts, and synergies.
    """
    if not request.ingredients:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide at least one ingredient to evaluate."
        )
    return check_ingredient_interactions(request.ingredients)
