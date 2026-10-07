import logging
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import LifestyleProfile, User
from app.schemas.lifestyle import LifestyleCreate, LifestyleUpdate, LifestyleResponse

logger = logging.getLogger(__name__)

def get_lifestyle(db: Session, user_id: int) -> LifestyleResponse:
    profile = db.query(LifestyleProfile).filter(LifestyleProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lifestyle profile not found")
    return LifestyleResponse.model_validate(profile)

def create_lifestyle(db: Session, user_id: int, payload: LifestyleCreate) -> LifestyleResponse:
    existing = db.query(LifestyleProfile).filter(LifestyleProfile.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Lifestyle profile already exists")
    profile = LifestyleProfile(user_id=user_id, **payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return LifestyleResponse.model_validate(profile)

def update_lifestyle(db: Session, user_id: int, payload: LifestyleUpdate) -> LifestyleResponse:
    profile = db.query(LifestyleProfile).filter(LifestyleProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lifestyle profile not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return LifestyleResponse.model_validate(profile)
