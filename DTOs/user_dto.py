from pydantic import BaseModel, EmailStr
from typing import Optional
from Models.user import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.EMPLOYEE


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: int
    email: str
    role: UserRole
    is_active: bool

    model_config = {"from_attributes": True}