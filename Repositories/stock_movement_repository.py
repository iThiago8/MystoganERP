from typing import Optional
from sqlalchemy.orm import Session
from Models.stock_movement import StockMovement
from Interfaces.i_stock_movement_repository import IStockMovementRepository


class StockMovementRepository(IStockMovementRepository):

    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, movement_id: int) -> Optional[StockMovement]:
        return self.db.query(StockMovement).filter(StockMovement.id == movement_id).first()

    def find_all(self) -> list[StockMovement]:
        return (
            self.db.query(StockMovement)
            .order_by(StockMovement.created_at.desc())
            .all()
        )

    def find_by_product(self, product_id: int) -> list[StockMovement]:
        return (
            self.db.query(StockMovement)
            .filter(StockMovement.product_id == product_id)
            .order_by(StockMovement.created_at.desc())
            .all()
        )

    def save(self, movement: StockMovement) -> StockMovement:
        self.db.add(movement)
        self.db.commit()
        self.db.refresh(movement)
        return movement
