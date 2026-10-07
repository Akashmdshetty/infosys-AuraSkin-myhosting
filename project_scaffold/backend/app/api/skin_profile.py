from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, require_role
from app.schemas.skin_profile import SkinProfileCreate, SkinProfileUpdate, SkinProfileResponse
from app.services.skin_profile_service import get_skin_profile, create_skin_profile, update_skin_profile
from app.db.session import get_db
from app.models import RoleEnum

router = APIRouter()

@router.get("/", response_model=SkinProfileResponse)
def read_skin_profile(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_skin_profile(db, current_user.id)

@router.post("/", response_model=SkinProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(payload: SkinProfileCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_skin_profile(db, current_user.id, payload)

@router.put("/", response_model=SkinProfileResponse)
def update_profile(payload: SkinProfileUpdate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return update_skin_profile(db, current_user.id, payload)
