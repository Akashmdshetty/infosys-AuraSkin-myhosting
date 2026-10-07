from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.schemas.lifestyle import LifestyleCreate, LifestyleUpdate, LifestyleResponse
from app.services.lifestyle_service import get_lifestyle, create_lifestyle, update_lifestyle
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=LifestyleResponse)
def read_lifestyle(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_lifestyle(db, current_user.id)

@router.post("/", response_model=LifestyleResponse, status_code=status.HTTP_201_CREATED)
def add_lifestyle(payload: LifestyleCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_lifestyle(db, current_user.id, payload)

@router.put("/", response_model=LifestyleResponse)
def modify_lifestyle(payload: LifestyleUpdate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return update_lifestyle(db, current_user.id, payload)
