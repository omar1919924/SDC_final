from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from app.schemas.base import PyObjectId

class ParentBase(BaseModel):
    user_id: str
    tel: Optional[str] = Field(None, description="Phone number")
    enfant_id: Optional[str] = Field(None, description="FK to Child Profile ID")
    enseignant_id: Optional[str] = Field(None, description="FK to Teacher Profile ID")

class ParentCreate(ParentBase):
    pass

class ParentDB(ParentBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={PyObjectId: str}
    )

class ParentResponse(ParentBase):
    id: PyObjectId = Field(alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={PyObjectId: str}
    )

class ParentUpdate(BaseModel):
    tel: Optional[str] = None
    enfant_id: Optional[str] = None
    enseignant_id: Optional[str] = None
