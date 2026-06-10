from abc import ABC, abstractmethod
from typing import Optional
from Models.role import Role


class IRoleRepository(ABC):

    @abstractmethod
    def find_by_id(self, role_id: int) -> Optional[Role]:
        pass

    @abstractmethod
    def find_all(self) -> list[Role]:
        pass

    @abstractmethod
    def save(self, role: Role) -> Role:
        pass

    @abstractmethod
    def delete(self, role: Role) -> None:
        pass
