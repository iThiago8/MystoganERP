from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from Models.delivery import DeliveryStatus


class DeliveryCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0, description="Quantidade entregue (sempre positiva)")
    destination: str
    recipient_name: str
    notes: Optional[str] = None


class DeliveryStatusUpdate(BaseModel):
    status: DeliveryStatus


class DeliveryResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    destination: str
    recipient_name: str
    status: DeliveryStatus
    notes: Optional[str] = None
    user_id: Optional[int] = None
    created_at: datetime
    delivered_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
