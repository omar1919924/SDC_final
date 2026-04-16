from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.base import PyObjectId

class UserBase(BaseModel):
    nom: str = Field(..., description="Full name of the user")
    email: EmailStr
    role: str = Field(..., description="Role: enseignant, parent, enfant")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserDB(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={PyObjectId: str}
    )

class UserResponse(UserBase):
    id: PyObjectId = Field(alias="_id")
    nom: str
    created_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={PyObjectId: str}
    )

class UserUpdate(BaseModel):
    nom: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)
