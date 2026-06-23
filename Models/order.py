from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from Data.connection import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(20), nullable=False) 
    status = Column(String(20), default="PENDING", nullable=False) 
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    total_value = Column(Float, default=0.0, nullable=False)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False)

    partner = relationship("Partner", back_populates="orders") 
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")