from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.models import SkinTypeEnum

class SkinProfileBase(BaseModel):
    skin_type: SkinTypeEnum = Field(..., description="Skin type")
    skin_concerns: Optional[List[str]] = Field(default_factory=list, description="List of skin concerns")
    allergies: Optional[str] = Field(None, description="Allergies, comma separated")
    sensitivities: Optional[str] = Field(None, description="Sensitivities, comma separated")

    @field_validator("skin_concerns", mode="before")
    @classmethod
    def split_concerns(cls, v):
        if isinstance(v, str):
            return [c.strip().upper() for c in v.split(",") if c.strip()]
        return v or []

class SkinProfileCreate(SkinProfileBase):
    pass

class SkinProfileUpdate(BaseModel):
    skin_type: Optional[SkinTypeEnum] = None
    skin_concerns: Optional[List[str]] = None
    allergies: Optional[str] = None
    sensitivities: Optional[str] = None

    @field_validator("skin_concerns", mode="before")
    @classmethod
    def split_concerns(cls, v):
        if isinstance(v, str):
            return [c.strip().upper() for c in v.split(",") if c.strip()]
        return v

class SkinProfileResponse(SkinProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
