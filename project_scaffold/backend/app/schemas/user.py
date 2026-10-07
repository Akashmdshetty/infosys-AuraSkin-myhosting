from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from app.models import RoleEnum, VerificationStatus

class ProfessionalProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    professional_title: Optional[str] = None
    qualifications: Optional[str] = None
    certifications: Optional[str] = None
    years_experience: Optional[int] = None
    area_of_expertise: Optional[str] = None
    organization: Optional[str] = None
    registration_number: Optional[str] = None
    country: Optional[str] = None
    verification_docs_notes: Optional[str] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: RoleEnum
    requested_role: Optional[RoleEnum] = RoleEnum.USER
    verification_status: VerificationStatus = VerificationStatus.VERIFIED
    email_verified: bool = False
    age: Optional[int] = None
    country: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    professional_profile: Optional[ProfessionalProfileResponse] = None

class UserUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    country: Optional[str] = None

