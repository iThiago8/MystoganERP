from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
from Models.user import UserRole
from DTOs.user_dto import UserResponse


# Criação de Employee já cria um User junto
class EmployeeCreate(BaseModel):
    # Dados do Employee
    name: str
    phone: Optional[str] = None
    hire_date: Optional[date] = None
    role_id: Optional[int] = None

    # Dados do User vinculado (criado automaticamente)
    email: EmailStr
    password: str
    user_role: UserRole = UserRole.EMPLOYEE


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    hire_date: Optional[date] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None


class EmployeeResponse(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None
    hire_date: Optional[date] = None
    is_active: bool
    role_id: Optional[int] = None
    user: Optional[UserResponse] = None     # inclui dados do User na resposta

    model_config = {"from_attributes": True}