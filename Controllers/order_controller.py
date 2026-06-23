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
    return service.create_order(order_data)


@router.get("/", response_model=List[OrderResponse])
def get_all_orders(service: OrderService = Depends(get_order_service)):
    return service.get_all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(
    order_id: int,
    service: OrderService = Depends(get_order_service),
):
    return service.get_by_id(order_id)