from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, require_role
from app.schemas.environmental_exposure import EnvironmentalExposureCreate, EnvironmentalExposureResponse
from app.services.environmental_exposure_service import list_environmental_records, create_environmental_record
from app.db.session import get_db
from app.models import RoleEnum

router = APIRouter()

@router.get("/", response_model=list[EnvironmentalExposureResponse])
def read_environmental_exposures(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_environmental_records(db, current_user.id)

@router.post("/", response_model=EnvironmentalExposureResponse, status_code=status.HTTP_201_CREATED)
def add_environmental_exposure(payload: EnvironmentalExposureCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_environmental_record(db, current_user.id, payload)
