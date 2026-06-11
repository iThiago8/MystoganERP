from pydantic import BaseModel
from typing import Optional


# Quantidade não entra no Create/Update de propósito:
# estoque só muda via movimentação, mantendo o histórico fiel.
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    quantity: int

    model_config = {"from_attributes": True}
