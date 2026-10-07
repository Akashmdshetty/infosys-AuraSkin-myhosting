from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models import RoleEnum, VerificationStatus

class UserRegistration(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: Optional[RoleEnum] = Field(default=RoleEnum.USER)
    age: Optional[int] = Field(default=None, ge=1, le=120)
    country: Optional[str] = Field(default=None, max_length=100)

    # Professional Registration Fields
    professional_title: Optional[str] = None
    qualifications: Optional[str] = None
    certifications: Optional[str] = None
    years_experience: Optional[int] = None
    area_of_expertise: Optional[str] = None
    organization: Optional[str] = None
    registration_number: Optional[str] = None
    verification_docs_notes: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)

class VerifyEmailRequest(BaseModel):
    token: str

class VerifyProfessionalRequest(BaseModel):
    status: VerificationStatus  # VERIFIED or REJECTED
    rejection_reason: Optional[str] = None

