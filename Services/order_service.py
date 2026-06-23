from fastapi import HTTPException
from DTOs.order_dto import OrderCreate
from Interfaces.i_order_repository import IOrderRepository
from Interfaces.i_product_repository import IProductRepository
from Interfaces.i_stock_movement_repository import IStockMovementRepository
from Models.stock_movement import StockMovement

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

    def create_order(self, data: OrderCreate):
        calculated_total = 0.0
        for item in data.items:
            product = self.product_repo.find_by_id(item.product_id)
            
            if not product:
                raise HTTPException(status_code=404, detail=f"Produto ID {item.product_id} não encontrado.")
            if data.type == "SALE" and product.quantity < item.quantity:
                raise HTTPException(status_code=400, detail=f"Estoque insuficiente para o produto: {product.name}.")
            item.unit_price = product.price 
            calculated_total += (item.quantity * item.unit_price)
        created_order = self.order_repo.create(data, calculated_total)

        for item in data.items:
            product = self.product_repo.find_by_id(item.product_id)
            
            if data.type == "SALE":
                product.quantity -= item.quantity
                movement_type = "OUT"
            else: 
                product.quantity += item.quantity
                movement_type = "IN"
        
            self.product_repo.save(product)

            movement = StockMovement(
                product_id=item.product_id,
                quantity=item.quantity,
                type=movement_type 
            )
            self.stock_repo.save(movement)
        return created_order