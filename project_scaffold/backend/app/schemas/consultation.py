from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse

class ConsultationCreate(BaseModel):
    professional_id: int
    subject: str = Field(..., min_length=3, max_length=150)
    message: str = Field(..., min_length=10, max_length=2000)
    primary_concern: Optional[str] = None

class ConsultationUpdate(BaseModel):
    status: Optional[str] = None  # PENDING, REVIEWED, COMPLETED, DECLINED
    response_notes: Optional[str] = None

class ConsultationResponse(BaseModel):
    id: int
    client_id: int
    professional_id: int
    subject: str
    message: str
    primary_concern: Optional[str] = None
    status: str
    response_notes: Optional[str] = None
    created_at: datetime
    client: Optional[UserResponse] = None
    professional: Optional[UserResponse] = None

    class Config:
        from_attributes = True
