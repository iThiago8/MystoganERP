from typing import Optional
from sqlalchemy.orm import Session
from Models.delivery import Delivery
from Models.product import Product
from Models.stock_movement import StockMovement
from Interfaces.i_product_repository import IProductRepository


class ProductRepository(IProductRepository):

    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, product_id: int) -> Optional[Product]:
        return self.db.query(Product).filter(Product.id == product_id).first()

    def find_by_name(self, name: str) -> Optional[Product]:
        return self.db.query(Product).filter(Product.name == name).first()

    def find_all(self) -> list[Product]:
        return self.db.query(Product).all()

    def find_low_stock(self) -> list[Product]:
        return (
            self.db.query(Product)
            .filter(Product.is_active == True)
            .filter(Product.quantity <= Product.minimum_quantity)
            .all()
        )

    def has_dependencies(self, product_id: int) -> bool:
        has_movements = (
            self.db.query(StockMovement.id)
            .filter(StockMovement.product_id == product_id)
            .first()
            is not None
        )

        has_deliveries = (
            self.db.query(Delivery.id)
            .filter(Delivery.product_id == product_id)
            .first()
            is not None
        )

        return has_movements or has_deliveries

    def save(self, product: Product) -> Product:
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def delete(self, product: Product) -> None:
        self.db.delete(product)
        self.db.commit()

