from pydantic import BaseModel
from pydantic import Field
from typing import Optional


# Quantidade não entra no Create/Update de propósito:
# estoque só muda via movimentação, mantendo o histórico fiel.
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    minimum_quantity: int = Field(default=0, ge=0)
    price: float = Field (ge=0.0)

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    minimum_quantity: Optional[int] = Field(default=None, ge=0)
    is_active: Optional[bool] = None
    price: Optional[float] = Field(default=None, ge=0.0)

class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    quantity: int
    minimum_quantity: int
    is_active: bool
    is_low_stock: bool
    price: float

    model_config = {"from_attributes": True}
