from fastapi import APIRouter, Depends, status
from Services.product_service import ProductService
from DTOs.product_dto import ProductCreate, ProductUpdate, ProductResponse
from DTOs.auth_dto import TokenPayload
from Controllers.dependencies import get_product_service, require_stock

router = APIRouter(prefix="/products", tags=["Estoque - Produtos"])


@router.get("/", response_model=list[ProductResponse])
def list_products(
    service: ProductService = Depends(get_product_service),
    _: TokenPayload = Depends(require_stock)
):
    return service.get_all()


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    service: ProductService = Depends(get_product_service),
    _: TokenPayload = Depends(require_stock)
):
    return service.get_by_id(product_id)


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate,
    service: ProductService = Depends(get_product_service),
    _: TokenPayload = Depends(require_stock)
):
    return service.create(data)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    service: ProductService = Depends(get_product_service),
    _: TokenPayload = Depends(require_stock)
):
    return service.update(product_id, data)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    service: ProductService = Depends(get_product_service),
    _: TokenPayload = Depends(require_stock)
):
    service.delete(product_id)
