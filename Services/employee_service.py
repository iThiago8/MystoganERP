from fastapi import HTTPException, status
from Repositories.employee_repository import EmployeeRepository
from DTOs.employee_dto import EmployeeCreate, EmployeeUpdate
from Models.employee import Employee
from Utils.security import hash_password


class EmployeeService:

    def __init__(self, repository: EmployeeRepository):
        self.repository = repository

    def get_all(self) -> list[Employee]:
        return self.repository.find_all()

    def get_by_id(self, employee_id: int) -> Employee:
        employee = self.repository.find_by_id(employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Funcionário {employee_id} não encontrado."
            )
        return employee

    def create(self, data: EmployeeCreate) -> Employee:
        existing = self.repository.find_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Já existe um funcionário com o e-mail '{data.email}'."
            )
        employee_data = data.model_dump(exclude={"password"})
        employee = Employee(
            **employee_data,
            hashed_password=hash_password(data.password)
        )
        return self.repository.save(employee)

    def update(self, employee_id: int, data: EmployeeUpdate) -> Employee:
        employee = self.get_by_id(employee_id)

        # Se está mudando o e-mail, garante que o novo não está em uso
        if data.email and data.email != employee.email:
            existing = self.repository.find_by_email(data.email)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"E-mail '{data.email}' já está em uso."
                )

        update_data = data.model_dump(exclude_none=True)
        for field, value in update_data.items():
            setattr(employee, field, value)

        return self.repository.save(employee)

    def delete(self, employee_id: int) -> None:
        employee = self.get_by_id(employee_id)
        self.repository.delete(employee)
