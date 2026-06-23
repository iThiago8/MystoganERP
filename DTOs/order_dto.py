from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    model_config = {"from_attributes": True}

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    partner_id: int
    type: str  
    items: List[OrderItemCreate]  

class OrderUpdate(BaseModel):
    status: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    partner_id: int
    type: str
    status: str
    date: datetime
    total_value: float
    items: List[OrderItemResponse] 

    model_config = {"from_attributes": True}

class OrderCreate(BaseModel):
    partner_id: int
    type: str  
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    partner_id: int
    type: str
    status: str
    date: datetime
    total_value: float
    items: List[OrderItemResponse]

    model_config = {"from_attributes": True}