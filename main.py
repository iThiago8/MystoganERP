from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Data.connection import engine, Base

# Importar TODOS os models para que o SQLAlchemy registre os mappers/relationships
from Models.user import User
from Models.employee import Employee
from Models.department import Department
from Models.role import Role
from Models.partner import Partner
from Models.product import Product
from Models.stock_movement import StockMovement
from Models.transaction import Transaction
from Models.delivery import Delivery
from Models.order import Order, OrderItem


# Importa os controllers
from Controllers import (
    auth_controller,
    department_controller,
    role_controller,
    employee_controller,
    product_controller,
    stock_movement_controller,
    transaction_controller,
    delivery_controller,
    partner_controller,
    order_controller,
)


app = FastAPI(
    title="Mystogan ERP",
    description="Sistema ERP empresarial",
    version="1.0.0",
)

# Registra as rotas
app.include_router(auth_controller.router)
app.include_router(department_controller.router)
app.include_router(role_controller.router)
app.include_router(employee_controller.router)
app.include_router(product_controller.router)
app.include_router(stock_movement_controller.router)
app.include_router(transaction_controller.router)
app.include_router(delivery_controller.router)
app.include_router(partner_controller.router)
app.include_router(order_controller.router)

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "ERP online"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
