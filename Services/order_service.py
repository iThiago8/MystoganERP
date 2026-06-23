from typing import List, Optional
from fastapi import HTTPException, status
from DTOs.order_dto import OrderCreate, OrderResponse, OrderItemResponse
from Interfaces.i_order_repository import IOrderRepository
from Interfaces.i_product_repository import IProductRepository
from Interfaces.i_stock_movement_repository import IStockMovementRepository
from Models.order import Order
from Models.stock_movement import StockMovement, MovementType


class OrderService:
    def __init__(
        self, 
        order_repo: IOrderRepository, 
        product_repo: IProductRepository, 
        stock_repo: IStockMovementRepository
    ):
        self.order_repo = order_repo
        self.product_repo = product_repo
        self.stock_repo = stock_repo

    def get_all(self) -> List[OrderResponse]:
        orders = self.order_repo.get_all()
        return [self._to_response(order) for order in orders]

    def get_by_id(self, order_id: int) -> OrderResponse:
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pedido com ID {order_id} não encontrado.",
            )
        return self._to_response(order)

    def create_order(self, data: OrderCreate) -> OrderResponse:
        if data.type not in ("SALE", "PURCHASE"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo de pedido inválido. Use 'SALE' ou 'PURCHASE'.",
            )

        if not data.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O pedido deve conter ao menos um item.",
            )

        # --- Validação e cálculo do total (blindagem de segurança) ---
        calculated_total = 0.0
        for item in data.items:
            product = self.product_repo.find_by_id(item.product_id)
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Produto ID {item.product_id} não encontrado.",
                )

            if not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Produto '{product.name}' está inativo.",
                )

            if data.type == "SALE" and product.quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Estoque insuficiente para o produto: {product.name}. "
                           f"Disponível: {product.quantity}, solicitado: {item.quantity}.",
                )

            # Blindagem: preço vem do banco, não do front-end
            item.unit_price = float(product.price)
            calculated_total += item.quantity * item.unit_price

        # --- Persiste o pedido ---
        created_order = self.order_repo.create(data, calculated_total)

        # --- Atualiza estoque e registra movimentações ---
        for item in data.items:
            product = self.product_repo.find_by_id(item.product_id)

            if data.type == "SALE":
                product.quantity -= item.quantity
                mov_type = MovementType.SAIDA
            else:
                product.quantity += item.quantity
                mov_type = MovementType.ENTRADA

            self.product_repo.save(product)

            movement = StockMovement(
                product_id=item.product_id,
                quantity=item.quantity,
                movement_type=mov_type,
                notes=f"Pedido #{created_order.id} — {'Venda' if data.type == 'SALE' else 'Compra'}",
            )
            self.stock_repo.save(movement)

        return self._to_response(created_order)

    def _to_response(self, order: Order) -> OrderResponse:
        """Converte o model Order em OrderResponse com nomes resolvidos."""
        items = []
        for item in order.items:
            product = self.product_repo.find_by_id(item.product_id)
            items.append(OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=product.name if product else None,
                quantity=item.quantity,
                unit_price=item.unit_price,
            ))

        return OrderResponse(
            id=order.id,
            partner_id=order.partner_id,
            partner_name=order.partner.name if order.partner else None,
            type=order.type,
            status=order.status,
            date=order.date,
            total_value=order.total_value,
            items=items,
        )