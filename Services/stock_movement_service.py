from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from Repositories.stock_movement_repository import StockMovementRepository
from Repositories.product_repository import ProductRepository
from DTOs.stock_movement_dto import StockMovementCreate
from Models.stock_movement import StockMovement, MovementType


class StockMovementService:

    def __init__(
        self,
        movement_repository: StockMovementRepository,
        product_repository: ProductRepository,
        db: Session,
    ):
        self.movement_repo = movement_repository
        self.product_repo = product_repository
        self.db = db  # necessário para transação atômica (produto + movimentação)

    def get_all(self) -> list[StockMovement]:
        return self.movement_repo.find_all()

    def get_by_product(self, product_id: int) -> list[StockMovement]:
        # Valida se o produto existe antes de buscar o histórico
        product = self.product_repo.find_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Produto {product_id} não encontrado."
            )
        return self.movement_repo.find_by_product(product_id)

    def register(self, data: StockMovementCreate, user_id: int) -> StockMovement:
        product = self.product_repo.find_by_id(data.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Produto {data.product_id} não encontrado."
            )

        # Valida saldo antes de qualquer alteração
        if data.movement_type == MovementType.SAIDA and product.quantity < data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Estoque insuficiente. Saldo atual: {product.quantity}."
            )

        try:
            # 1. Atualiza a quantidade do produto
            if data.movement_type == MovementType.ENTRADA:
                product.quantity += data.quantity
            else:
                product.quantity -= data.quantity

            # 2. Registra a movimentação no histórico
            movement = StockMovement(
                product_id=data.product_id,
                movement_type=data.movement_type,
                quantity=data.quantity,
                notes=data.notes,
                user_id=user_id,
            )
            self.db.add(movement)

            # 3. Produto e movimentação salvam na mesma transação
            self.db.commit()
            self.db.refresh(movement)
            return movement

        except Exception:
            self.db.rollback()  # se qualquer coisa falhar, desfaz tudo
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao registrar movimentação. Tente novamente."
            )
