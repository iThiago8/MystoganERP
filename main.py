from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# Importa os controllers
from Controllers import (
    auth_controller,
    department_controller,
    role_controller,
    employee_controller,
    product_controller,
    stock_movement_controller,
    transaction_controller
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


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "ERP online"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
