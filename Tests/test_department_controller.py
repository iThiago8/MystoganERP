import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from Controllers.department_controller import router, get_department_service, require_admin, get_current_user
from Models.department import Department
from DTOs.auth_dto import TokenPayload
from Models.user import UserRole

# Criamos um app isolado apenas para testar esse router específico
app = FastAPI()
app.include_router(router)
client = TestClient(app)

# Fixtures e Overrides de Dependências
mock_service = MagicMock()

def override_get_department_service():
    return mock_service

def override_get_current_user():
    return TokenPayload(sub=1, email="user@teste.com", role=UserRole.STOCK)

def override_require_admin():
    return TokenPayload(sub=2, email="admin@teste.com", role=UserRole.ADMIN)

# Aplica as substituições no FastAPI
app.dependency_overrides[get_department_service] = override_get_department_service
app.dependency_overrides[get_current_user] = override_get_current_user
app.dependency_overrides[require_admin] = override_require_admin


def test_list_departments_route():
    # Configura o mock do Service para retornar uma lista com um departamento
    mock_service.get_all.return_value = [
        Department(id=1, name="Vendas", description="Departamento de Vendas")
    ]
    
    response = client.get("/departments/")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Vendas"
    assert data[0]["id"] == 1


def test_create_department_route_success():
    # Configura o mock do Service para a criação
    mock_service.create.return_value = Department(id=2, name="Logística")
    
    payload = {"name": "Logística", "description": "Setor de entregas"}
    response = client.post("/departments/", json=payload)
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Logística"
    assert data["id"] == 2
