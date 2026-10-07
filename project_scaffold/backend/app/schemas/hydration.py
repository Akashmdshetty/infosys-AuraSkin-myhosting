from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class HydrationRecordBase(BaseModel):
    water_consumed: int = Field(..., gt=0, description="Water consumed in milliliters per day")
    humidity: int | None = Field(None, ge=0, le=100, description="Ambient humidity percentage")
    recorded_at: datetime = Field(default_factory=datetime.utcnow)

class HydrationRecordCreate(HydrationRecordBase):
    pass

class HydrationRecordResponse(HydrationRecordBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
