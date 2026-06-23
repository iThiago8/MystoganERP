from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from Data.connection import get_db
from DTOs.partner_dto import PartnerCreate, PartnerResponse, PartnerUpdate
from Services.partner_service import PartnerService

router = APIRouter(prefix="/partners", tags=["Parceiros"])


def get_service(db: Session = Depends(get_db)) -> PartnerService:
    return PartnerService(db)

@router.post(
    "/",
    response_model=PartnerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar novo parceiro",
)
def create_partner(
    data: PartnerCreate,
    service: PartnerService = Depends(get_service),
):
    return service.create(data)


@router.get(
    "/",
    response_model=List[PartnerResponse],
    summary="Listar parceiros",
)
def list_partners(
    active_only: bool = True,
    service: PartnerService = Depends(get_service),
):
    return service.get_all(active_only=active_only)


@router.get(
    "/{partner_id}",
    response_model=PartnerResponse,
    summary="Buscar parceiro por ID",
)
def get_partner(
    partner_id: int,
    service: PartnerService = Depends(get_service),
):
    return service.get_by_id(partner_id)


@router.put(
    "/{partner_id}",
    response_model=PartnerResponse,
    summary="Atualizar dados do parceiro",
)
def update_partner(
    partner_id: int,
    data: PartnerUpdate,
    service: PartnerService = Depends(get_service),
):
    return service.update(partner_id, data)

@router.delete(
    "/{partner_id}",
    status_code=status.HTTP_200_OK,
    summary="Desativar parceiro (soft delete — histórico preservado)",
)
def delete_partner(
    partner_id: int,
    service: PartnerService = Depends(get_service),
):
    return service.delete(partner_id)


@router.patch(
    "/{partner_id}/reactivate",
    response_model=PartnerResponse,
    summary="Reativar parceiro desativado",
)
def reactivate_partner(
    partner_id: int,
    service: PartnerService = Depends(get_service),
):
    return service.reactivate(partner_id)