from typing import Optional
from sqlalchemy.orm import Session
from Models.user import User
from Interfaces.i_user_repository import IUserRepository


class UserRepository(IUserRepository):

    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def find_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def find_all(self) -> list[User]:
        return self.db.query(User).all()

    def save(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()