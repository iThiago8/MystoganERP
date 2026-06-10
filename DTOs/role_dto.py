from pydantic import BaseModel
from typing import Optional


class RoleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    department_id: int


class RoleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    department_id: Optional[int] = None


class RoleResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    department_id: int

    model_config = {"from_attributes": True}
