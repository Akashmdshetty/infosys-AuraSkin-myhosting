import logging
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import SkinProfile, User
from app.schemas.skin_profile import SkinProfileCreate, SkinProfileUpdate, SkinProfileResponse

logger = logging.getLogger(__name__)

def get_skin_profile(db: Session, user_id: int) -> SkinProfileResponse:
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skin profile not found")
    return SkinProfileResponse.model_validate(profile)

def create_skin_profile(db: Session, user_id: int, payload: SkinProfileCreate) -> SkinProfileResponse:
    existing = db.query(SkinProfile).filter(SkinProfile.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Skin profile already exists")
    data = payload.model_dump()
    if isinstance(data.get("skin_concerns"), list):
        data["skin_concerns"] = ",".join(data["skin_concerns"])
    profile = SkinProfile(user_id=user_id, **data)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return SkinProfileResponse.model_validate(profile)

def update_skin_profile(db: Session, user_id: int, payload: SkinProfileUpdate) -> SkinProfileResponse:
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skin profile not found")
    data = payload.model_dump(exclude_unset=True)
    if "skin_concerns" in data and isinstance(data["skin_concerns"], list):
        data["skin_concerns"] = ",".join(data["skin_concerns"])
    for field, value in data.items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return SkinProfileResponse.model_validate(profile)
