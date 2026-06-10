from fastapi import APIRouter, Depends, status
from Services.employee_service import EmployeeService
from DTOs.employee_dto import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from DTOs.auth_dto import TokenPayload
from Controllers.dependencies import get_employee_service, get_current_user

router = APIRouter(prefix="/employees", tags=["RH - Funcionários"])


@router.get("/", response_model=list[EmployeeResponse])
def list_employees(
    service: EmployeeService = Depends(get_employee_service),
    _: TokenPayload = Depends(get_current_user)
):
    return service.get_all()


@router.get("/me", response_model=EmployeeResponse)
def get_me(
    current_user: TokenPayload = Depends(get_current_user),
    service: EmployeeService = Depends(get_employee_service)
):
    """Retorna os dados do funcionário autenticado."""
    return service.get_by_id(current_user.sub)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    service: EmployeeService = Depends(get_employee_service),
    _: TokenPayload = Depends(get_current_user)
):
    return service.get_by_id(employee_id)


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    data: EmployeeCreate,
    service: EmployeeService = Depends(get_employee_service),
    _: TokenPayload = Depends(get_current_user)
):
    return service.create(data)


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    data: EmployeeUpdate,
    service: EmployeeService = Depends(get_employee_service),
    _: TokenPayload = Depends(get_current_user)
):
    return service.update(employee_id, data)


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: int,
    service: EmployeeService = Depends(get_employee_service),
    _: TokenPayload = Depends(get_current_user)
):
    service.delete(employee_id)
