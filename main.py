from fastapi import FastAPI
from Data.connection import engine, Base

# Importa todos os models para o Base os reconhecer antes de criar as tabelas
import Models.department
import Models.role
import Models.employee

# Importa os controllers
from Controllers import (
    auth_controller,
    department_controller,
    role_controller,
    employee_controller,
)

# Cria as tabelas no banco se ainda não existirem
Base.metadata.create_all(bind=engine)

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


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "ERP online"}
