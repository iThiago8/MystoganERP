from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from Models.stock_movement import MovementType


class StockMovementCreate(BaseModel):
    product_id: int
    movement_type: MovementType
    quantity: int = Field(gt=0, description="Quantidade movimentada (sempre positiva)")
    notes: Optional[str] = None


class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    movement_type: MovementType
    quantity: int
    notes: Optional[str] = None
    user_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}
