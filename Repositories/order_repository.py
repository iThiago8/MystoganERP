from typing import List, Optional
from sqlalchemy.orm import Session
from Models.order import Order, OrderItem
from DTOs.order_dto import OrderCreate
from Interfaces.i_order_repository import IOrderRepository

class OrderRepository(IOrderRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Order]:
        return self.db.query(Order).order_by(Order.date.desc()).all()

    def get_by_id(self, order_id: int) -> Optional[Order]:
        return self.db.query(Order).filter(Order.id == order_id).first()

    def create(self, data: OrderCreate, calculated_total: float) -> Order:
        db_order = Order(
            partner_id=data.partner_id,
            type=data.type,
            total_value=calculated_total,
            status="COMPLETED" 
        )

        for item in data.items:
            db_item = OrderItem(
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price 
            )
            db_order.items.append(db_item)
        
        self.db.add(db_order)
        self.db.commit()
        self.db.refresh(db_order)
        
        return db_order

    def update_status(self, order_id: int, new_status: str) -> Optional[Order]:
        db_order = self.get_by_id(order_id)
        if db_order:
            db_order.status = new_status
            self.db.commit()
            self.db.refresh(db_order)
        return db_order