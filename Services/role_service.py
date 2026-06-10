from fastapi import HTTPException, status
from Repositories.role_repository import RoleRepository
from Repositories.department_repository import DepartmentRepository
from DTOs.role_dto import RoleCreate, RoleUpdate
from Models.role import Role


class RoleService:

    def __init__(self, repository: RoleRepository, department_repository: DepartmentRepository):
        self.repository = repository
        self.department_repository = department_repository

    def get_all(self) -> list[Role]:
        return self.repository.find_all()

    def get_by_id(self, role_id: int) -> Role:
        role = self.repository.find_by_id(role_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cargo {role_id} não encontrado."
            )
        return role

    def create(self, data: RoleCreate) -> Role:
        # Valida se o departamento existe antes de criar o cargo
        department = self.department_repository.find_by_id(data.department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Departamento {data.department_id} não encontrado."
            )
        role = Role(**data.model_dump())
        return self.repository.save(role)

    def update(self, role_id: int, data: RoleUpdate) -> Role:
        role = self.get_by_id(role_id)

        # Se está mudando o departamento, valida se o novo existe
        if data.department_id:
            department = self.department_repository.find_by_id(data.department_id)
            if not department:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Departamento {data.department_id} não encontrado."
                )

        update_data = data.model_dump(exclude_none=True)
        for field, value in update_data.items():
            setattr(role, field, value)

        return self.repository.save(role)

    def delete(self, role_id: int) -> None:
        role = self.get_by_id(role_id)
        self.repository.delete(role)
