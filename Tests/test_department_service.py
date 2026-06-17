import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException
from Services.department_service import DepartmentService
from DTOs.department_dto import DepartmentCreate, DepartmentUpdate
from Models.department import Department


@pytest.fixture
def mock_repository():
    # Cria um repositório falso para não batermos no banco de dados real
    return MagicMock()


@pytest.fixture
def service(mock_repository):
    # Injeta o repositório falso no nosso Service
    return DepartmentService(mock_repository)


def test_get_by_id_success(service, mock_repository):
    # Prepara o Mock
    mock_repository.find_by_id.return_value = Department(id=1, name="TI", description="Tecnologia")
    
    # Executa a ação
    result = service.get_by_id(1)
    
    # Verifica o resultado
    assert result.name == "TI"
    assert result.id == 1
    mock_repository.find_by_id.assert_called_once_with(1)


def test_get_by_id_not_found_raises_404(service, mock_repository):
    mock_repository.find_by_id.return_value = None
    
    with pytest.raises(HTTPException) as excinfo:
        service.get_by_id(999)
        
    assert excinfo.value.status_code == 404


def test_create_department_success(service, mock_repository):
    mock_repository.find_by_name.return_value = None # Simula que o nome não existe
    mock_repository.save.return_value = Department(id=2, name="RH")
    
    result = service.create(DepartmentCreate(name="RH"))
    
    assert result.id == 2
    assert result.name == "RH"

def test_create_department_conflict_raises_409(service, mock_repository):
    mock_repository.find_by_name.return_value = Department(id=1, name="TI") # Simula que já existe
    
    with pytest.raises(HTTPException) as excinfo:
        service.create(DepartmentCreate(name="TI"))
        
    assert excinfo.value.status_code == 409
