from fastapi import APIRouter, Depends, status
from Services.role_service import RoleService
from DTOs.role_dto import RoleCreate, RoleUpdate, RoleResponse
from DTOs.auth_dto import TokenPayload
from Controllers.dependencies import get_role_service, get_current_user

router = APIRouter(prefix="/roles", tags=["RH - Cargos"])


@router.get("/", response_model=list[RoleResponse])
def list_roles(
    service: RoleService = Depends(get_role_service),
    _: TokenPayload = Depends(get_current_user)
):
    return service.get_all()


@router.get("/{role_id}", response_model=RoleResponse)
def get_role(
    role_id: int,
    service: RoleService = Depends(get_role_service),
    _: TokenPayload = Depends(get_current_user)
):
    return service.get_by_id(role_id)


@router.post("/", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(
    data: RoleCreate,
    service: RoleService = Depends(get_role_service),
    _: TokenPayload = Depends(get_current_user)
):
    return service.create(data)


@router.put("/{role_id}", response_model=RoleResponse)
def update_role(
    role_id: int,
    data: RoleUpdate,
    service: RoleService = Depends(get_role_service),
    _: TokenPayload = Depends(get_current_user)
):
    return service.update(role_id, data)


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    role_id: int,
    service: RoleService = Depends(get_role_service),
    _: TokenPayload = Depends(get_current_user)
):
    service.delete(role_id)
