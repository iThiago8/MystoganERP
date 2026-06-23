from typing import List
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from Data.connection import get_db
from Data.connection import SessionLocal
from Repositories.user_repository import UserRepository
from Repositories.employee_repository import EmployeeRepository
from Repositories.role_repository import RoleRepository
from Repositories.department_repository import DepartmentRepository
from Repositories.product_repository import ProductRepository
from Repositories.stock_movement_repository import StockMovementRepository
from Repositories.transaction_repository import TransactionRepository
from Repositories.delivery_repository import DeliveryRepository
from Repositories.order_repository import OrderRepository
from Repositories.partner_repository import PartnerRepository
from Services.auth_service import AuthService
from Services.employee_service import EmployeeService
from Services.role_service import RoleService
from Services.department_service import DepartmentService
from Services.product_service import ProductService
from Services.stock_movement_service import StockMovementService
from Services.transaction_service import TransactionService
from Services.delivery_service import DeliveryService
from Services.order_service import OrderService
from DTOs.auth_dto import TokenPayload
from Models.user import UserRole
from Utils.security import decode_access_token

http_bearer = HTTPBearer()


# --- Factories de Service ---

def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db))


def get_employee_service(db: Session = Depends(get_db)) -> EmployeeService:
    return EmployeeService(EmployeeRepository(db), UserRepository(db), db)


def get_role_service(db: Session = Depends(get_db)) -> RoleService:
    return RoleService(RoleRepository(db), DepartmentRepository(db))


def get_department_service(db: Session = Depends(get_db)) -> DepartmentService:
    return DepartmentService(DepartmentRepository(db))


def get_product_service(db: Session = Depends(get_db)) -> ProductService:
    return ProductService(ProductRepository(db))


def get_stock_movement_service(db: Session = Depends(get_db)) -> StockMovementService:
    return StockMovementService(StockMovementRepository(db), ProductRepository(db), db)


def get_delivery_service(db: Session = Depends(get_db)) -> DeliveryService:
    return DeliveryService(DeliveryRepository(db), ProductRepository(db), db)


def get_order_service(db: Session = Depends(get_db)) -> OrderService:
    order_repo = OrderRepository(db)
    product_repo = ProductRepository(db)
    stock_repo = StockMovementRepository(db)
    return OrderService(order_repo, product_repo, stock_repo)


def get_transaction_repository(db: Session = Depends(get_db)) -> TransactionRepository:
    return TransactionRepository(db)


def get_transaction_service(repository: TransactionRepository = Depends(get_transaction_repository)) -> TransactionService:
    return TransactionService(repository)


# --- Autenticação ---

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(http_bearer),
) -> TokenPayload:
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenPayload(sub=payload["sub"], email=payload["email"], role=payload["role"])


# --- Guards de permissão ---
# Use como dependência nas rotas que precisam de um papel específico.
# Exemplo: current_user: TokenPayload = Depends(require_hr)

def require_hr(current_user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
    if current_user.role not in (UserRole.HR, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito ao setor de RH."
        )
    return current_user


def require_stock(current_user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
    if current_user.role not in (UserRole.STOCK, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito ao setor de Estoque."
        )
    return current_user


def require_admin(current_user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores."
        )
    return current_user


class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user_payload: TokenPayload = Depends(get_current_user)):
        if user_payload.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operação não permitida. Privilégios insuficientes."
            )
        return user_payload