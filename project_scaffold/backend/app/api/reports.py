from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models import User, RoleEnum, VerificationStatus
from app.schemas.skin_intelligence import SkinIntelligenceReport
from app.services.report_service import (
    generate_skin_intelligence_report,
    generate_assessment_report,
    generate_aurascore_report,
    generate_routine_report,
    generate_product_recommendation_report,
    generate_ingredient_safety_report,
    generate_progress_report,
    generate_before_after_report,
    generate_report_pdf,
    generate_report_excel
)

router = APIRouter()

def resolve_target_user(current_user: User, client_id: Optional[int], db: Session) -> User:
    """Helper to resolve target user respecting RBAC: users only see own data; professionals/admins can view clients."""
    if client_id is not None and client_id != current_user.id:
        if current_user.role not in [RoleEnum.SKINCARE_CONSULTANT, RoleEnum.DERMATOLOGIST, RoleEnum.ADMIN]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Cannot view other users' reports.")
        
        if current_user.role != RoleEnum.ADMIN and current_user.verification_status != VerificationStatus.VERIFIED:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Professional account pending verification.")
        
        target = db.query(User).filter(User.id == client_id).first()
        if not target:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client user not found.")
        return target
    return current_user


@router.get("/comprehensive", response_model=SkinIntelligenceReport)
def get_comprehensive_report(
    client_id: Optional[int] = Query(None, description="Optional client_id for professionals/admins"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full 18-part Skin Intelligence Report."""
    target_user = resolve_target_user(current_user, client_id, db)
    return generate_skin_intelligence_report(db, target_user)


@router.get("/assessment", response_model=dict)
def get_assessment_subreport(
    client_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve focused Skin Assessment Report."""
    target_user = resolve_target_user(current_user, client_id, db)
    return generate_assessment_report(db, target_user)


@router.get("/aurascore", response_model=dict)
def get_aurascore_subreport(
    client_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve 5-Factor AuraScore Report."""
    target_user = resolve_target_user(current_user, client_id, db)
    return generate_aurascore_report(db, target_user)


@router.get("/routine", response_model=dict)
def get_routine_subreport(
    client_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve Personalized Routine Report."""
    target_user = resolve_target_user(current_user, client_id, db)
    return generate_routine_report(db, target_user)


@router.get("/products", response_model=dict)
def get_products_subreport(
    client_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve Product & Ingredient Recommendations Report."""
    target_user = resolve_target_user(current_user, client_id, db)
    return generate_product_recommendation_report(db, target_user)


@router.get("/safety", response_model=dict)
def get_safety_subreport(
    client_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve Ingredient Safety & Contraindications Report."""
    target_user = resolve_target_user(current_user, client_id, db)
    return generate_ingredient_safety_report(db, target_user)


@router.get("/progress", response_model=dict)
def get_progress_subreport(
    client_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve Progress & Longitudinal Analytics Report."""
    target_user = resolve_target_user(current_user, client_id, db)
    return generate_progress_report(db, target_user)


@router.get("/before-after", response_model=dict)
def get_before_after_subreport(
    client_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve Before/After Clinical Comparison Report."""
    target_user = resolve_target_user(current_user, client_id, db)
    return generate_before_after_report(db, target_user)


@router.get("/export/pdf")
def export_report_pdf(
    client_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export clinical report as a branded, styled PDF document."""
    target_user = resolve_target_user(current_user, client_id, db)
    pdf_bytes = generate_report_pdf(db, target_user)
    
    clean_name = target_user.name.replace(" ", "_").lower()
    filename = f"auraskin_report_{clean_name}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "application/pdf"
        }
    )


@router.get("/export/excel")
def export_report_excel(
    client_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export assessment, routine, adherence, and progress telemetry as a multi-sheet Excel spreadsheet."""
    target_user = resolve_target_user(current_user, client_id, db)
    excel_bytes = generate_report_excel(db, target_user)

    clean_name = target_user.name.replace(" ", "_").lower()
    filename = f"auraskin_data_{clean_name}.xlsx"

    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    )
