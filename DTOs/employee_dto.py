from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date


class EmployeeCreate(BaseModel):
    name: str
    email: EmailStr
    password: str           # senha em texto puro — o Service faz o hash
    phone: Optional[str] = None
    hire_date: Optional[date] = None
    role_id: Optional[int] = None


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    hire_date: Optional[date] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None


class EmployeeResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    hire_date: Optional[date] = None
    is_active: bool
    role_id: Optional[int] = None

    model_config = {"from_attributes": True}
