from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.base import PyObjectId

class ClinicalUpdateBase(BaseModel):
    child_id: str = Field(..., description="FK to Child Profile ID")
    provider: str = Field(..., description="Name of the Provider (e.g. Dr. Vance)")
    message: str = Field(..., description="The update message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Time of the update")
    is_today: bool = Field(default=True, description="Flag for UI highlighting")

class ClinicalUpdateCreate(ClinicalUpdateBase):
    pass

class ClinicalUpdateDB(ClinicalUpdateBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={PyObjectId: str}
    )

class ClinicalUpdateResponse(ClinicalUpdateBase):
    id: PyObjectId = Field(alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={PyObjectId: str}
    )
