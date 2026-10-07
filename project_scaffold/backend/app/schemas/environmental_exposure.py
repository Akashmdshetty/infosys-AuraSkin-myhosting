from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class EnvironmentalExposureBase(BaseModel):
    sun_exposure_hours: int = Field(..., ge=0, description="Hours of sun exposure")
    recorded_at: datetime = Field(default_factory=datetime.utcnow)

class EnvironmentalExposureCreate(EnvironmentalExposureBase):
    pass

class EnvironmentalExposureResponse(EnvironmentalExposureBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
