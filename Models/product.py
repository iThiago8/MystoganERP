from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from Data.connection import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True)
    description = Column(String(255), nullable=True)
    quantity = Column(Integer, nullable=False, default=0)
    minimum_quantity = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)

    # Um Product tem muitas StockMovements (histórico)
    movements = relationship("StockMovement", back_populates="product")

    @property
    def is_low_stock(self) -> bool:
        return self.quantity <= self.minimum_quantity
