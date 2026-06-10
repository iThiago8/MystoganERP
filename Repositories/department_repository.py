from typing import Optional
from sqlalchemy.orm import Session
from Models.department import Department
from Interfaces.i_department_repository import IDepartmentRepository


class DepartmentRepository(IDepartmentRepository):

    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, department_id: int) -> Optional[Department]:
        return self.db.query(Department).filter(Department.id == department_id).first()

    def find_by_name(self, name: str) -> Optional[Department]:
        return self.db.query(Department).filter(Department.name == name).first()

    def find_all(self) -> list[Department]:
        return self.db.query(Department).all()

    def save(self, department: Department) -> Department:
        self.db.add(department)
        self.db.commit()
        self.db.refresh(department)
        return department

    def delete(self, department: Department) -> None:
        self.db.delete(department)
        self.db.commit()
