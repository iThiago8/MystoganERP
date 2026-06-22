from abc import ABC, abstractmethod
from typing import List, Optional
from Models.partner import Partner
from DTOs.partner_dto import PartnerCreate, PartnerUpdate

class IPartnerRepository(ABC):
    
    @abstractmethod
    def get_all(self) -> List[Partner]:
        pass

    @abstractmethod
    def get_by_id(self, partner_id: int) -> Optional[Partner]:
        pass

    @abstractmethod
    def create(self, data: PartnerCreate) -> Partner:
        pass

    @abstractmethod
    def update(self, partner_id: int, data: PartnerUpdate) -> Optional[Partner]:
        pass

    @abstractmethod
    def delete(self, partner_id: int) -> bool:
        pass