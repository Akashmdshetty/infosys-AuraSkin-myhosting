import logging
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import HydrationRecord, User
from app.schemas.hydration import HydrationRecordCreate, HydrationRecordResponse

logger = logging.getLogger(__name__)

def list_hydration_records(db: Session, user_id: int) -> list[HydrationRecordResponse]:
    records = db.query(HydrationRecord).filter(HydrationRecord.user_id == user_id).all()
    return [HydrationRecordResponse.model_validate(r) for r in records]

def create_hydration_record(db: Session, user_id: int, payload: HydrationRecordCreate) -> HydrationRecordResponse:
    record = HydrationRecord(user_id=user_id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return HydrationRecordResponse.model_validate(record)
