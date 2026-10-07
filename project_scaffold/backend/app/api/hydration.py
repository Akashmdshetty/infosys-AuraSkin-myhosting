from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.schemas.hydration import HydrationRecordCreate, HydrationRecordResponse
from app.services.hydration_service import list_hydration_records, create_hydration_record
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=list[HydrationRecordResponse])
def read_hydration_records(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_hydration_records(db, current_user.id)

@router.post("/", response_model=HydrationRecordResponse, status_code=status.HTTP_201_CREATED)
def add_hydration_record(payload: HydrationRecordCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_hydration_record(db, current_user.id, payload)
