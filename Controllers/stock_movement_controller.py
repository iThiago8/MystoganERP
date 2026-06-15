from fastapi import APIRouter, Depends, status
from Services.stock_movement_service import StockMovementService
from DTOs.stock_movement_dto import StockMovementCreate, StockMovementResponse
from DTOs.auth_dto import TokenPayload
from Config.dependencies import get_stock_movement_service, require_stock

router = APIRouter(prefix="/stock-movements", tags=["Estoque - Movimentações"])


# Sem PUT/DELETE: movimentações são histórico imutável.

@router.get("/", response_model=list[StockMovementResponse])
def list_movements(
    service: StockMovementService = Depends(get_stock_movement_service),
    _: TokenPayload = Depends(require_stock)
):
    """Histórico completo de movimentações (mais recentes primeiro)."""
    return service.get_all()


@router.get("/product/{product_id}", response_model=list[StockMovementResponse])
def list_movements_by_product(
    product_id: int,
    service: StockMovementService = Depends(get_stock_movement_service),
    _: TokenPayload = Depends(require_stock)
):
    """Histórico de movimentações de um produto específico."""
    return service.get_by_product(product_id)


@router.post("/", response_model=StockMovementResponse, status_code=status.HTTP_201_CREATED)
def register_movement(
    data: StockMovementCreate,
    service: StockMovementService = Depends(get_stock_movement_service),
    current_user: TokenPayload = Depends(require_stock)
):
    """Registra entrada ou saída de estoque e atualiza a quantidade do produto."""
    return service.register(data, user_id=current_user.sub)
