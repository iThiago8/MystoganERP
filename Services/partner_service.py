from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from DTOs.partner_dto import PartnerCreate, PartnerUpdate
from Models.partner import Partner
from Repositories.partner_repository import PartnerRepository


class PartnerService:
    def __init__(self, db: Session):
        self.repo = PartnerRepository(db)

    def create(self, data: PartnerCreate) -> Partner:
        if self.repo.get_by_cpf_cnpj(data.cpf_cnpj):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"CPF/CNPJ '{data.cpf_cnpj}' já está cadastrado.",
            )

        if self.repo.get_by_email(str(data.email)):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"E-mail '{data.email}' já está cadastrado.",
            )

        return self.repo.create(data)

    def get_all(self, active_only: bool = True) -> List[Partner]:
        return self.repo.get_all(active_only=active_only)

    def get_by_id(self, partner_id: int) -> Partner:
        partner = self.repo.get_by_id(partner_id)
        if not partner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parceiro com ID {partner_id} não encontrado.",
            )
        return partner

    def update(self, partner_id: int, data: PartnerUpdate) -> Partner:
        existing = self.get_by_id(partner_id)

        if data.cpf_cnpj and data.cpf_cnpj != existing.cpf_cnpj:
            if self.repo.get_by_cpf_cnpj(data.cpf_cnpj):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"CPF/CNPJ '{data.cpf_cnpj}' já está em uso.",
                )

        if data.email and str(data.email) != existing.email:
            if self.repo.get_by_email(str(data.email)):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"E-mail '{data.email}' já está em uso.",
                )

        return self.repo.update(partner_id, data)

    def delete(self, partner_id: int) -> dict:
        partner = self.get_by_id(partner_id)

        if not partner.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parceiro já está inativo.",
            )

        self.repo.delete(partner_id)
        return {"message": f"Parceiro '{partner.name}' desativado com sucesso."}

    def reactivate(self, partner_id: int) -> Partner:
        partner = self.repo.get_by_id(partner_id)
        if not partner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parceiro com ID {partner_id} não encontrado.",
            )

        if partner.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parceiro já está ativo.",
            )

        data = PartnerUpdate(is_active=True)
        return self.repo.update(partner_id, data)