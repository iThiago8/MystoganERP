from pydantic import BaseModel
from typing import Optional


# DTO de entrada para criação
class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None


# DTO de entrada para atualização (todos opcionais)
class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


# DTO de saída (o que a API retorna)
class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}
