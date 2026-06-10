from typing import Optional
from sqlalchemy.orm import Session
from Models.role import Role
from Interfaces.i_role_repository import IRoleRepository


class RoleRepository(IRoleRepository):

    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, role_id: int) -> Optional[Role]:
        return self.db.query(Role).filter(Role.id == role_id).first()

    def find_all(self) -> list[Role]:
        return self.db.query(Role).all()

    def find_by_department(self, department_id: int) -> list[Role]:
        return self.db.query(Role).filter(Role.department_id == department_id).all()

    def save(self, role: Role) -> Role:
        self.db.add(role)
        self.db.commit()
        self.db.refresh(role)
        return role

    def delete(self, role: Role) -> None:
        self.db.delete(role)
        self.db.commit()
