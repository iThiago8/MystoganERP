from abc import ABC, abstractmethod
from typing import Optional
from Models.product import Product


class IProductRepository(ABC):

    @abstractmethod
    def find_by_id(self, product_id: int) -> Optional[Product]:
        pass

    @abstractmethod
    def find_by_name(self, name: str) -> Optional[Product]:
        pass

    @abstractmethod
    def find_all(self) -> list[Product]:
        pass

    @abstractmethod
    def save(self, product: Product) -> Product:
        pass

    @abstractmethod
    def delete(self, product: Product) -> None:
        pass
