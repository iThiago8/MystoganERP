from sqlalchemy import Column, Integer, String, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship
from Data.connection import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False, unique=True)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    hire_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)

    # Um Employee pertence a um Role
    role = relationship("Role", back_populates="employees")
