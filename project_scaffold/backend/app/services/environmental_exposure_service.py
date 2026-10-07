import logging
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import EnvironmentalExposure, User
from app.schemas.environmental_exposure import EnvironmentalExposureCreate, EnvironmentalExposureResponse

logger = logging.getLogger(__name__)

def list_environmental_records(db: Session, user_id: int) -> list[EnvironmentalExposureResponse]:
    records = db.query(EnvironmentalExposure).filter(EnvironmentalExposure.user_id == user_id).all()
    return [EnvironmentalExposureResponse.model_validate(r) for r in records]

def create_environmental_record(db: Session, user_id: int, payload: EnvironmentalExposureCreate) -> EnvironmentalExposureResponse:
    record = EnvironmentalExposure(user_id=user_id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return EnvironmentalExposureResponse.model_validate(record)
