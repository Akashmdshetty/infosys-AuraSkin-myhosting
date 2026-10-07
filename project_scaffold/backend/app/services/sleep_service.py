import logging
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import SleepRecord, User
from app.schemas.sleep import SleepRecordCreate, SleepRecordResponse

logger = logging.getLogger(__name__)

def list_sleep_records(db: Session, user_id: int) -> list[SleepRecordResponse]:
    records = db.query(SleepRecord).filter(SleepRecord.user_id == user_id).all()
    return [SleepRecordResponse.model_validate(r) for r in records]

def create_sleep_record(db: Session, user_id: int, payload: SleepRecordCreate) -> SleepRecordResponse:
    record = SleepRecord(user_id=user_id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return SleepRecordResponse.model_validate(record)
