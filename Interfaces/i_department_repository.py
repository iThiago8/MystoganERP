from abc import ABC, abstractmethod
from typing import Optional
from Models.department import Department


class IDepartmentRepository(ABC):

    @abstractmethod
    def find_by_id(self, department_id: int) -> Optional[Department]:
        pass

    @abstractmethod
    def find_all(self) -> list[Department]:
        pass

    @abstractmethod
    def save(self, department: Department) -> Department:
        pass

    @abstractmethod
    def delete(self, department: Department) -> None:
        pass
