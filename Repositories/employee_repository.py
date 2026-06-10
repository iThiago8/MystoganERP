from typing import Optional
from sqlalchemy.orm import Session
from Models.employee import Employee
from Interfaces.i_employee_repository import IEmployeeRepository


class EmployeeRepository(IEmployeeRepository):

    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, employee_id: int) -> Optional[Employee]:
        return self.db.query(Employee).filter(Employee.id == employee_id).first()

    def find_all(self) -> list[Employee]:
        return self.db.query(Employee).all()

    def save(self, employee: Employee) -> Employee:
        self.db.add(employee)
        self.db.commit()
        self.db.refresh(employee)
        return employee

    def delete(self, employee: Employee) -> None:
        self.db.delete(employee)
        self.db.commit()