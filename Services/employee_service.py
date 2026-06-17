from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from Interfaces.i_employee_repository import IEmployeeRepository
from Interfaces.i_user_repository import IUserRepository
from DTOs.employee_dto import EmployeeCreate, EmployeeUpdate
from Models.employee import Employee
from Models.user import User
from Utils.security import hash_password


class EmployeeService:

    def __init__(self, employee_repository: IEmployeeRepository, user_repository: IUserRepository, db: Session):
        self.employee_repo = employee_repository
        self.user_repo = user_repository
        self.db = db  # necessário para transação atômica

    def get_all(self) -> list[Employee]:
        return self.employee_repo.find_all()

    def get_by_id(self, employee_id: int) -> Employee:
        employee = self.employee_repo.find_by_id(employee_id)
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Funcionário id '{employee_id}' não encontrado."
            )
        
        return employee
    
    def get_by_user_id(self, user_id: int) -> Employee:
        employee = self.employee_repo.find_by_user_id(user_id)
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Funcionário com user_id '{user_id}' não encontrado."
            )
        
        return employee

    def create(self, data: EmployeeCreate) -> Employee:
        # Valida e-mail antes de qualquer inserção
        if self.user_repo.find_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Já existe um usuário com o e-mail '{data.email}'."
            )

        try:
            # 1. Cria o User
            user = User(
                email=data.email,
                hashed_password=hash_password(data.password),
                role=data.user_role,
            )
            
            self.db.add(user)
            self.db.flush()  # persiste na transação sem commitar — gera o user.id

            # 2. Cria o Employee vinculado ao User
            employee = Employee(
                name=data.name,
                phone=data.phone,
                hire_date=data.hire_date,
                role_id=data.role_id,
                user_id=user.id,
            )
            
            self.db.add(employee)
            self.db.commit()
            self.db.refresh(employee)
            
            return employee

        except Exception:
            self.db.rollback()  # se qualquer coisa falhar, desfaz tudo
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar funcionário. Tente novamente."
            )

    def update(self, employee_id: int, data: EmployeeUpdate) -> Employee:
        employee = self.get_by_id(employee_id)
        
        update_data = data.model_dump(exclude_none=True)
        
        for field, value in update_data.items():
            setattr(employee, field, value)
        
        return self.employee_repo.save(employee)

    def delete(self, employee_id: int) -> None:
        employee = self.get_by_id(employee_id)
        
        self.employee_repo.delete(employee)