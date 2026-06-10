from fastapi import APIRouter, Depends
from Services.auth_service import AuthService
from DTOs.auth_dto import LoginRequest, TokenResponse
from Controllers.dependencies import get_auth_service

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    service: AuthService = Depends(get_auth_service)
):
    """Autentica um funcionário e retorna um JWT."""
    return service.login(data)
