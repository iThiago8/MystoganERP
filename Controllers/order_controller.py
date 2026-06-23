from fastapi import APIRouter, Depends, HTTPException
from typing import List
from DTOs.order_dto import OrderCreate, OrderResponse
from Services.order_service import OrderService
from Config.dependencies import get_order_service

router = APIRouter(prefix="/orders", tags=["Orders (Comercial)"])

@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(
    order_data: OrderCreate, 
    service: OrderService = Depends(get_order_service)
):
    try:
        return service.create_order(order_data)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[OrderResponse])
def get_all_orders(service: OrderService = Depends(get_order_service)):
    return service.order_repo.get_all()