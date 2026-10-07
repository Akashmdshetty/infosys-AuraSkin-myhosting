from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models import SleepQualityEnum

class SleepRecordBase(BaseModel):
    sleep_hours: int = Field(..., gt=0, description="Hours of sleep")
    sleep_quality: SleepQualityEnum = Field(..., description="Quality of sleep")
    recorded_at: datetime = Field(default_factory=datetime.utcnow)

class SleepRecordCreate(SleepRecordBase):
    pass

class SleepRecordResponse(SleepRecordBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
