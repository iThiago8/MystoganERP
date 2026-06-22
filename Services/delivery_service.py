from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from DTOs.delivery_dto import DeliveryCreate
from Models.delivery import Delivery, DeliveryStatus
from Models.stock_movement import MovementType, StockMovement
from Repositories.delivery_repository import DeliveryRepository
from Repositories.product_repository import ProductRepository


class DeliveryService:

    def __init__(
        self,
        delivery_repository: DeliveryRepository,
        product_repository: ProductRepository,
        db: Session,
    ):
        self.delivery_repo = delivery_repository
        self.product_repo = product_repository
        self.db = db

    def get_all(self) -> list[Delivery]:
        return self.delivery_repo.find_all()

    def get_by_id(self, delivery_id: int) -> Delivery:
        delivery = self.delivery_repo.find_by_id(delivery_id)
        if not delivery:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Entrega {delivery_id} não encontrada."
            )
        return delivery

    def get_by_product(self, product_id: int) -> list[Delivery]:
        product = self.product_repo.find_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Produto {product_id} não encontrado."
            )
        return self.delivery_repo.find_by_product(product_id)

    def create(self, data: DeliveryCreate, user_id: int) -> Delivery:
        product = self.product_repo.find_by_id(data.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Produto {data.product_id} não encontrado."
            )

        if product.quantity < data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Estoque insuficiente. Saldo atual: {product.quantity}."
            )

        try:
            product.quantity -= data.quantity

            delivery = Delivery(
                product_id=data.product_id,
                quantity=data.quantity,
                destination=data.destination,
                recipient_name=data.recipient_name,
                status=DeliveryStatus.PENDENTE,
                notes=data.notes,
                user_id=user_id,
            )

            movement = StockMovement(
                product_id=data.product_id,
                movement_type=MovementType.SAIDA,
                quantity=data.quantity,
                notes="Saída para entrega",
                user_id=user_id,
            )

            self.db.add(delivery)
            self.db.add(movement)
            self.db.commit()
            self.db.refresh(delivery)
            return delivery

        except Exception:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar entrega. Tente novamente."
            )

    def update_status(self, delivery_id: int, new_status: DeliveryStatus, user_id: int) -> Delivery:
        delivery = self.get_by_id(delivery_id)

        if delivery.status == new_status:
            return delivery

        if delivery.status == DeliveryStatus.CANCELADA:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Entrega cancelada não pode ser alterada."
            )

        if delivery.status == DeliveryStatus.ENTREGUE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Entrega entregue não pode ser alterada."
            )

        if new_status == DeliveryStatus.CANCELADA:
            return self.cancel(delivery, user_id)

        if new_status == DeliveryStatus.ENTREGUE:
            delivery.delivered_at = datetime.now()

        delivery.status = new_status
        return self.delivery_repo.save(delivery)

    def cancel(self, delivery: Delivery, user_id: int) -> Delivery:
        product = self.product_repo.find_by_id(delivery.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Produto {delivery.product_id} não encontrado."
            )

        try:
            product.quantity += delivery.quantity
            delivery.status = DeliveryStatus.CANCELADA

            movement = StockMovement(
                product_id=delivery.product_id,
                movement_type=MovementType.ENTRADA,
                quantity=delivery.quantity,
                notes=f"Estorno por cancelamento de entrega #{delivery.id}",
                user_id=user_id,
            )

            self.db.add(movement)
            self.db.commit()
            self.db.refresh(delivery)
            return delivery

        except Exception:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao cancelar entrega. Tente novamente."
            )
