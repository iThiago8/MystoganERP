from typing import Optional
from sqlalchemy.orm import Session
from Models.product import Product
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

    def save(self, product: Product) -> Product:
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def delete(self, product: Product) -> None:
        self.db.delete(product)
        self.db.commit()
