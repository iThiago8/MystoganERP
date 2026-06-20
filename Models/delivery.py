import enum
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship
from Data.connection import Base


class DeliveryStatus(str, enum.Enum):
    PENDENTE = "PENDENTE"
    EM_TRANSPORTE = "EM_TRANSPORTE"
    ENTREGUE = "ENTREGUE"
    CANCELADA = "CANCELADA"


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    destination = Column(String(255), nullable=False)
    recipient_name = Column(String(150), nullable=False)
    status = Column(Enum(DeliveryStatus), nullable=False, default=DeliveryStatus.PENDENTE)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    delivered_at = Column(DateTime, nullable=True)

    # Quem registrou a entrega (auditoria)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    product = relationship("Product")
