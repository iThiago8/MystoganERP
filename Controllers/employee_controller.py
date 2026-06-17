from fastapi import APIRouter, Depends, status
from Services.employee_service import EmployeeService
from DTOs.employee_dto import EmployeeUpdate, EmployeeResponse
from DTOs.auth_dto import TokenPayload
from Config.dependencies import get_employee_service, get_current_user, require_hr

router = APIRouter(prefix="/employees", tags=["RH - Funcionários"])


@router.get("/", response_model=list[EmployeeResponse])
def list_employees(
    service: EmployeeService = Depends(get_employee_service),
    _: TokenPayload = Depends(require_hr)
):
    return service.get_all()


@router.get("/me", response_model=EmployeeResponse)
def get_me(
    current_user: TokenPayload = Depends(get_current_user),
    service: EmployeeService = Depends(get_employee_service)
):
    """Qualquer usuário autenticado pode ver seus próprios dados."""

    return service.get_by_user_id(current_user.sub)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    service: EmployeeService = Depends(get_employee_service),
    _: TokenPayload = Depends(require_hr)
):
    return service.get_by_id(employee_id)


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    data: EmployeeUpdate,
    service: EmployeeService = Depends(get_employee_service),
    _: TokenPayload = Depends(require_hr)
):
    return service.update(employee_id, data)


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: int,
    service: EmployeeService = Depends(get_employee_service),
    _: TokenPayload = Depends(require_hr)
):
    service.delete(employee_id)
