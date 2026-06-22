from typing import List, Optional
from sqlalchemy.orm import Session
from Models.partner import Partner
from DTOs.partner_dto import PartnerCreate, PartnerUpdate
from Repositories.ipartner_repository import IPartnerRepository

class PartnerRepository(IPartnerRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Partner]:
        return self.db.query(Partner).all()

    def get_by_id(self, partner_id: int) -> Optional[Partner]:
        return self.db.query(Partner).filter(Partner.id == partner_id).first()

    def create(self, data: PartnerCreate) -> Partner:
        # data.model_dump() converte o DTO em um dicionário. 
        # Os ** desempacotam esse dicionário para instanciar o Model.
        db_partner = Partner(**data.model_dump())
        
        self.db.add(db_partner)
        self.db.commit()
        self.db.refresh(db_partner) # Atualiza o objeto com o ID gerado pelo banco
        
        return db_partner

    def update(self, partner_id: int, data: PartnerUpdate) -> Optional[Partner]:
        db_partner = self.get_by_id(partner_id)
        if not db_partner:
            return None

        # exclude_unset=True garante que apenas os campos enviados no JSON sejam atualizados,
        # ignorando os que o usuário não preencheu (que vieram como None no DTO)
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

        # Soft Delete: Em vez de rodar um self.db.delete(db_partner), 
        # para sistemas financeiros/ERP é mais seguro apenas inativar o registro.
        db_partner.is_active = False
        self.db.commit()
        
        return True