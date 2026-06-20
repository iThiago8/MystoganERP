from fastapi import APIRouter, Depends, status

from Config.dependencies import get_delivery_service, require_stock
from DTOs.auth_dto import TokenPayload
from DTOs.delivery_dto import DeliveryCreate, DeliveryResponse, DeliveryStatusUpdate
from Services.delivery_service import DeliveryService

router = APIRouter(prefix="/deliveries", tags=["Logística - Entregas"])


@router.get("/", response_model=list[DeliveryResponse])
def list_deliveries(
    service: DeliveryService = Depends(get_delivery_service),
    _: TokenPayload = Depends(require_stock)
):
    return service.get_all()


@router.get("/product/{product_id}", response_model=list[DeliveryResponse])
def list_deliveries_by_product(
    product_id: int,
    service: DeliveryService = Depends(get_delivery_service),
    _: TokenPayload = Depends(require_stock)
):
    return service.get_by_product(product_id)


@router.get("/{delivery_id}", response_model=DeliveryResponse)
def get_delivery(
    delivery_id: int,
    service: DeliveryService = Depends(get_delivery_service),
    _: TokenPayload = Depends(require_stock)
):
    return service.get_by_id(delivery_id)


@router.post("/", response_model=DeliveryResponse, status_code=status.HTTP_201_CREATED)
def create_delivery(
    data: DeliveryCreate,
    service: DeliveryService = Depends(get_delivery_service),
    current_user: TokenPayload = Depends(require_stock)
):
    return service.create(data, user_id=current_user.sub)


@router.put("/{delivery_id}/status", response_model=DeliveryResponse)
def update_delivery_status(
    delivery_id: int,
    data: DeliveryStatusUpdate,
    service: DeliveryService = Depends(get_delivery_service),
    current_user: TokenPayload = Depends(require_stock)
):
    return service.update_status(delivery_id, data.status, user_id=current_user.sub)
