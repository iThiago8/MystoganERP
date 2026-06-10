from fastapi import HTTPException, status
from Repositories.employee_repository import EmployeeRepository
from DTOs.auth_dto import LoginRequest, TokenResponse
from Utils.security import verify_password, create_access_token


class AuthService:

    def __init__(self, repository: EmployeeRepository):
        self.repository = repository

    def login(self, data: LoginRequest) -> TokenResponse:
        employee = self.repository.find_by_email(data.email)

        # Mensagem genérica para não revelar se o e-mail existe ou não
        if not employee or not verify_password(data.password, employee.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail ou senha inválidos.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not employee.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Conta desativada. Entre em contato com o administrador."
            )

        token = create_access_token(data={"sub": employee.id, "email": employee.email})
        return TokenResponse(access_token=token)
