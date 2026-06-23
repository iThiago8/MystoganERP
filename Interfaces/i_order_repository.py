from abc import ABC, abstractmethod
from typing import List, Optional
from Models.order import Order
from DTOs.order_dto import OrderCreate, OrderUpdate

class IOrderRepository(ABC):
    
    @abstractmethod
    def get_all(self) -> List[Order]:
        pass

    @abstractmethod
    def get_by_id(self, order_id: int) -> Optional[Order]:
        pass

    @abstractmethod
    def create(self, data: OrderCreate, calculated_total: float) -> Order:
        pass

    @abstractmethod
    def update_status(self, order_id: int, new_status: str) -> Optional[Order]:
        pass