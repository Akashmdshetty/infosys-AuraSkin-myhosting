from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models import User, Product
from app.schemas.product_intelligence import (
    ProductResponse, ProductSuitabilityDetail, ProductRecommendationRequest,
    ProductRecommendationResponse, ProductComparisonRequest, ProductComparisonResponse,
    AlternativeProductsResponse, AddToRoutineRequest
)
from app.services.product_intelligence_service import (
    seed_products_if_empty, evaluate_product_suitability,
    get_product_recommendations, compare_products, get_alternative_products
)

router = APIRouter()

@router.get("", response_model=List[ProductResponse])
@router.get("/", response_model=List[ProductResponse])
def list_products(
    category: Optional[str] = Query(None, description="Filter by category (e.g. Face Wash, Moisturizer, Sunscreen)"),
    skin_type: Optional[str] = Query(None, description="Filter by compatible skin type"),
    search: Optional[str] = Query(None, description="Search product name or brand"),
    budget_max: Optional[float] = Query(None, description="Maximum budget in INR"),
    db: Session = Depends(get_db)
):
    """Retrieve full catalog of skincare products with optional filters."""
    seed_products_if_empty(db)
    query = db.query(Product).filter(Product.status == "ACTIVE")

    if category and category.strip():
        query = query.filter(Product.category.ilike(f"%{category.strip()}%"))
    if skin_type and skin_type.strip():
        query = query.filter(Product.skin_types.ilike(f"%{skin_type.strip()}%"))
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter((Product.name.ilike(term)) | (Product.brand.ilike(term)) | (Product.active_ingredients.ilike(term)))
    if budget_max is not None:
        query = query.filter(Product.price <= budget_max)

    return query.all()

@router.get("/{product_id}", response_model=ProductSuitabilityDetail)
def get_product_details(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get product specifications and personal suitability score for current authenticated user."""
    seed_products_if_empty(db)
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return evaluate_product_suitability(prod, current_user)

@router.post("/recommend", response_model=ProductRecommendationResponse)
def get_recommendations(
    request: ProductRecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate explainable personalized product recommendations taking into account
    skin type, concerns, allergies, sensitivities, barrier status, and budget.
    """
    return get_product_recommendations(
        db=db,
        user=current_user,
        category=request.category,
        budget_max=request.budget_max,
        target_concern=request.target_concern,
        limit=request.limit or 10
    )

@router.post("/compare", response_model=ProductComparisonResponse)
def compare_products_endpoint(
    request: ProductComparisonRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Compare 2 to 4 products side-by-side with suitability scores, allergen safety,
    key actives, barrier support, and value verdict.
    """
    if len(request.product_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide at least 2 product IDs to compare."
        )
    return compare_products(db, current_user, request.product_ids)

@router.get("/{product_id}/alternatives", response_model=AlternativeProductsResponse)
def get_alternatives(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve safer, higher-suitability alternative products if a selected product
    has contraindications, allergen conflicts, or skin type mismatch.
    """
    try:
        return get_alternative_products(db, current_user, product_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/{product_id}/add-to-routine", response_model=Dict[str, Any])
def add_product_to_routine_endpoint(
    product_id: int,
    request: AddToRoutineRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Integrate a recommended or biocompatible product directly into the user's active AM/PM skincare routine.
    """
    seed_products_if_empty(db)
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    eval_detail = evaluate_product_suitability(prod, current_user)
    if any("ALLERGY" in conf for conf in eval_detail.potential_conflicts):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot add product: contains documented allergen conflict ({eval_detail.potential_conflicts[0]})."
        )

    from app.services.routine_generation_service import add_product_to_user_routine
    updated_routine = add_product_to_user_routine(db, current_user, prod, time_of_day=request.time_of_day)

    return {
        "message": f"Successfully integrated '{prod.name}' into your daily {request.time_of_day} routine.",
        "product_id": prod.id,
        "product_name": prod.name,
        "time_of_day": request.time_of_day,
        "routine_id": updated_routine.id
    }

