from pydantic import BaseModel, EmailStr
from Models.user import UserRole

# O que o cliente envia no login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# O que a API retorna após login bem-sucedido
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Dados do usuário extraídos do token JWT (usado internamente)
class TokenPayload(BaseModel):
    sub: int        # employee_id
    email: str
    role: UserRole
