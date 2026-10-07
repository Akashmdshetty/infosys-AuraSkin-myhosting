from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.schemas.sleep import SleepRecordResponse, SleepRecordCreate
from app.services.sleep_service import list_sleep_records, create_sleep_record
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=list[SleepRecordResponse])
def read_sleep_records(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_sleep_records(db, current_user.id)

@router.post("/", response_model=SleepRecordResponse, status_code=status.HTTP_201_CREATED)
def add_sleep_record(payload: SleepRecordCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_sleep_record(db, current_user.id, payload)
