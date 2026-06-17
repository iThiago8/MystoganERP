from abc import ABC, abstractmethod
from typing import Optional
from Models.transaction import Transaction


class ITransactionRepository(ABC):

    @abstractmethod
    def create(self, transaction: Transaction) -> Transaction:
        pass

    @abstractmethod
    def get_by_id(self, transaction_id: int) -> Optional[Transaction]:
        pass

    @abstractmethod
    def get_all(self) -> list[Transaction]:
        pass

    @abstractmethod
    def delete(self, transaction: Transaction) -> bool:
        pass

    @abstractmethod
    def update(self, transaction: Transaction) -> Transaction:
        pass
