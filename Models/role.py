from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from Data.connection import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)

    # Um Role pertence a um Department
    department = relationship("Department", back_populates="roles")

    # Um Role tem muitos Employees
    employees = relationship("Employee", back_populates="role")
