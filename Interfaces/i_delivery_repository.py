from abc import ABC, abstractmethod
from typing import Optional
from Models.delivery import Delivery


class IDeliveryRepository(ABC):

    @abstractmethod
    def find_by_id(self, delivery_id: int) -> Optional[Delivery]:
        pass

    @abstractmethod
    def find_all(self) -> list[Delivery]:
        pass

    @abstractmethod
    def find_by_product(self, product_id: int) -> list[Delivery]:
        pass

    @abstractmethod
    def save(self, delivery: Delivery) -> Delivery:
        pass
