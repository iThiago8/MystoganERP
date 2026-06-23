from fastapi import HTTPException, status
from Interfaces.i_department_repository import IDepartmentRepository
from DTOs.department_dto import DepartmentCreate, DepartmentUpdate
from Models.department import Department


class DepartmentService:

    def __init__(self, repository: IDepartmentRepository):
        self.repository = repository

    def get_all(self) -> list[Department]:
        return self.repository.find_all()

    def get_by_id(self, department_id: int) -> Department:
        department = self.repository.find_by_id(department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Departamento {department_id} não encontrado."
            )
        return department

    def create(self, data: DepartmentCreate) -> Department:
        existing = self.repository.find_by_name(data.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Já existe um departamento com o nome '{data.name}'."
            )
        
        department = Department(**data.model_dump())

        return self.repository.save(department)

    def update(self, department_id: int, data: DepartmentUpdate) -> Department:
        department = self.get_by_id(department_id)

        # Atualiza apenas os campos enviados (ignora None)
        update_data = data.model_dump(exclude_none=True)
        for field, value in update_data.items():
            setattr(department, field, value)

        return self.repository.save(department)

    def delete(self, department_id: int) -> None:
        from sqlalchemy.exc import IntegrityError
        department = self.get_by_id(department_id)
        try:
            self.repository.delete(department)
        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir o departamento pois existem cargos associados a ele."
            )
