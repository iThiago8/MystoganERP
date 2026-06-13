from fastapi import APIRouter, Depends
from Services.auth_service import AuthService
from Services.employee_service import EmployeeService
from DTOs.auth_dto import LoginRequest, TokenResponse
from DTOs.employee_dto import EmployeeCreate, EmployeeResponse
from DTOs.auth_dto import TokenPayload
from Config.dependencies import get_auth_service, get_employee_service, require_hr
from fastapi import status

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    service: AuthService = Depends(get_auth_service)
):
    """Autentica um usuário e retorna um JWT."""
    return service.login(data)


@router.post("/register", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def register(
    data: EmployeeCreate,
    service: EmployeeService = Depends(get_employee_service),
    # apenas HR ou ADMIN podem registrar
    _: TokenPayload = Depends(require_hr)
):
    """Cria um novo funcionário com User vinculado. Requer papel HR ou ADMIN."""
    return service.create(data)
