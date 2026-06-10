from abc import ABC, abstractmethod
from typing import Optional
from Models.employee import Employee


class IEmployeeRepository(ABC):

    @abstractmethod
    def find_by_id(self, employee_id: int) -> Optional[Employee]:
        pass

    @abstractmethod
    def find_all(self) -> list[Employee]:
        pass

    @abstractmethod
    def save(self, employee: Employee) -> Employee:
        pass

    @abstractmethod
    def delete(self, employee: Employee) -> None:
        pass