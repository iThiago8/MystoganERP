from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from Data.connection import get_db
from Repositories.employee_repository import EmployeeRepository
from Repositories.role_repository import RoleRepository
from Repositories.department_repository import DepartmentRepository
from Services.employee_service import EmployeeService
from Services.role_service import RoleService
from Services.department_service import DepartmentService
from Services.auth_service import AuthService
from DTOs.auth_dto import TokenPayload
from Utils.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# --- Factories de Service (Injeção de Dependências) ---

def get_department_service(db: Session = Depends(get_db)) -> DepartmentService:
    return DepartmentService(DepartmentRepository(db))


def get_role_service(db: Session = Depends(get_db)) -> RoleService:
    return RoleService(RoleRepository(db), DepartmentRepository(db))


def get_employee_service(db: Session = Depends(get_db)) -> EmployeeService:
    return EmployeeService(EmployeeRepository(db))


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(EmployeeRepository(db))


# --- Dependência de autenticação para rotas protegidas ---

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> TokenPayload:
    """
    Use como dependência em qualquer rota que exija autenticação:
        current_user: TokenPayload = Depends(get_current_user)
    """
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenPayload(sub=payload["sub"], email=payload["email"])
