from typing import List, Optional
from sqlalchemy.orm import Session
from Models.partner import Partner
from DTOs.partner_dto import PartnerCreate, PartnerUpdate
from Interfaces.i_partner_repository import IPartnerRepository

class PartnerRepository(IPartnerRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, active_only: bool = True) -> List[Partner]:
        query = self.db.query(Partner)
        if active_only:
            query = query.filter(Partner.is_active == True)
        return query.all()

    def get_by_id(self, partner_id: int) -> Optional[Partner]:
        return self.db.query(Partner).filter(Partner.id == partner_id).first()
    
    def get_by_cpf_cnpj(self, cpf_cnpj: str) -> Optional[Partner]:
        return self.db.query(Partner).filter(Partner.cpf_cnpj == cpf_cnpj).first()
 
    def get_by_email(self, email: str) -> Optional[Partner]:
        return self.db.query(Partner).filter(Partner.email == email).first()

    def create(self, data: PartnerCreate) -> Partner:

        db_partner = Partner(**data.model_dump())
        
        self.db.add(db_partner)
        self.db.commit()
        self.db.refresh(db_partner) 
        
        return db_partner

    def update(self, partner_id: int, data: PartnerUpdate) -> Optional[Partner]:
        db_partner = self.get_by_id(partner_id)
        if not db_partner:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(db_partner, key, value)

        self.db.commit()
        self.db.refresh(db_partner)
        return db_partner

    def delete(self, partner_id: int) -> bool:
        db_partner = self.get_by_id(partner_id)
        if not db_partner:
            return False

        db_partner.is_active = False
        self.db.commit()
        
        return True