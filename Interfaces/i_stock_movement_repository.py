from abc import ABC, abstractmethod
from typing import Optional
from Models.stock_movement import StockMovement


# Sem update/delete: movimentações são histórico imutável.
class IStockMovementRepository(ABC):

    @abstractmethod
    def find_by_id(self, movement_id: int) -> Optional[StockMovement]:
        pass

    @abstractmethod
    def find_all(self) -> list[StockMovement]:
        pass

    @abstractmethod
    def find_by_product(self, product_id: int) -> list[StockMovement]:
        pass

    @abstractmethod
    def save(self, movement: StockMovement) -> StockMovement:
        pass
