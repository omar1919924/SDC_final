from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from app.schemas.base import PyObjectId

class TeacherBase(BaseModel):
    user_id: str
    matiere: Optional[str] = Field(None, description="Subject taught")
    classe: Optional[str] = Field(None, description="Class handled")
    ecole: Optional[str] = Field(None, description="School name")
    numero: Optional[str] = Field(None, description="Phone number")

class TeacherCreate(TeacherBase):
    pass

class TeacherDB(TeacherBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={PyObjectId: str}
    )

class TeacherResponse(TeacherBase):
    id: PyObjectId = Field(alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={PyObjectId: str}
    )

class TeacherUpdate(BaseModel):
    matiere: Optional[str] = None
    classe: Optional[str] = None
    ecole: Optional[str] = None
    numero: Optional[str] = None
