from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.models import StressLevelEnum

class LifestyleBase(BaseModel):
    lifestyle_habits: Optional[str] = Field(None, description="Lifestyle habits description")
    stress_level: StressLevelEnum = Field(..., description="Stress level")

    @field_validator("stress_level", mode="before")
    @classmethod
    def normalize_stress(cls, v):
        if isinstance(v, str):
            return v.upper()
        return v

class LifestyleCreate(LifestyleBase):
    pass

class LifestyleUpdate(BaseModel):
    lifestyle_habits: Optional[str] = None
    stress_level: Optional[StressLevelEnum] = None

    @field_validator("stress_level", mode="before")
    @classmethod
    def normalize_stress(cls, v):
        if isinstance(v, str):
            return v.upper()
        return v

class LifestyleResponse(LifestyleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
