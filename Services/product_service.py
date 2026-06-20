from fastapi import HTTPException, status
from Interfaces.i_product_repository import IProductRepository
from DTOs.product_dto import ProductCreate, ProductUpdate
from Models.product import Product


class ProductService:

    def __init__(self, repository: IProductRepository):
        self.repository = repository

    def get_all(self) -> list[Product]:
        return self.repository.find_all()

    def get_low_stock(self) -> list[Product]:
        return self.repository.find_low_stock()

    def get_by_id(self, product_id: int) -> Product:
        product = self.repository.find_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Produto {product_id} não encontrado."
            )
        return product

    def create(self, data: ProductCreate) -> Product:
        existing = self.repository.find_by_name(data.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Já existe um produto com o nome '{data.name}'."
            )
        product = Product(**data.model_dump())
        return self.repository.save(product)

    def update(self, product_id: int, data: ProductUpdate) -> Product:
        product = self.get_by_id(product_id)

        # Atualiza apenas os campos enviados (ignora None)
        update_data = data.model_dump(exclude_none=True)
        for field, value in update_data.items():
            setattr(product, field, value)

        return self.repository.save(product)

    def delete(self, product_id: int) -> None:
        product = self.get_by_id(product_id)

        product.is_active = False
        self.repository.save(product)
