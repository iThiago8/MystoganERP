from fastapi import APIRouter, Depends, status
from Services.department_service import DepartmentService
from DTOs.department_dto import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from DTOs.auth_dto import TokenPayload
from Config.dependencies import get_department_service, get_current_user
from DTOs.auth_dto import TokenPayload

router = APIRouter(prefix="/departments", tags=["RH - Departamentos"])


@router.get("/", response_model=list[DepartmentResponse])
def list_departments(
    service: DepartmentService = Depends(get_department_service),
    _: TokenPayload = Depends(get_current_user)     # rota protegida
):
    return service.get_all()


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    service: DepartmentService = Depends(get_department_service),
    _: TokenPayload = Depends(get_current_user)
):
    return service.get_by_id(department_id)


@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    data: DepartmentCreate,
    service: DepartmentService = Depends(get_department_service),
    _: TokenPayload = Depends(get_current_user)
):
    return service.create(data)


@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    data: DepartmentUpdate,
    service: DepartmentService = Depends(get_department_service),
    _: TokenPayload = Depends(get_current_user)
):
    return service.update(department_id, data)


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    department_id: int,
    service: DepartmentService = Depends(get_department_service),
    _: TokenPayload = Depends(get_current_user)
):
    service.delete(department_id)
