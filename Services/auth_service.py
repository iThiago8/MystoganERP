from fastapi import HTTPException, status
from Repositories.user_repository import UserRepository
from DTOs.auth_dto import LoginRequest, TokenResponse
from Utils.security import verify_password, create_access_token


class AuthService:

    def __init__(self, repository: UserRepository):
        self.repository = repository

    def login(self, data: LoginRequest) -> TokenResponse:
        user = self.repository.find_by_email(data.email)

        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail ou senha inválidos.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Conta desativada. Entre em contato com o administrador."
            )

        # Role agora vai dentro do token — não precisa de query extra nas rotas
        token = create_access_token(data={
            "sub": user.id,
            "email": user.email,
            "role": user.role.value
        })
        return TokenResponse(access_token=token)