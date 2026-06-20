from typing import Optional
from sqlalchemy.orm import Session
from Models.delivery import Delivery
from Interfaces.i_delivery_repository import IDeliveryRepository


class DeliveryRepository(IDeliveryRepository):

    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, delivery_id: int) -> Optional[Delivery]:
        return self.db.query(Delivery).filter(Delivery.id == delivery_id).first()

    def find_all(self) -> list[Delivery]:
        return (
            self.db.query(Delivery)
            .order_by(Delivery.created_at.desc())
            .all()
        )

    def find_by_product(self, product_id: int) -> list[Delivery]:
        return (
            self.db.query(Delivery)
            .filter(Delivery.product_id == product_id)
            .order_by(Delivery.created_at.desc())
            .all()
        )

    def save(self, delivery: Delivery) -> Delivery:
        self.db.add(delivery)
        self.db.commit()
        self.db.refresh(delivery)
        return delivery
