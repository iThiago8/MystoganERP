import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, func
from sqlalchemy.orm import relationship
from Data.connection import Base


class MovementType(str, enum.Enum):
    ENTRADA = "entrada"
    SAIDA = "saida"


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    movement_type = Column(Enum(MovementType), nullable=False)
    quantity = Column(Integer, nullable=False)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Uma StockMovement pertence a um Product
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product = relationship("Product", back_populates="movements")

    # Quem registrou a movimentação (auditoria)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
