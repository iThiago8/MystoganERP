from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from Data.connection import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String(255), nullable=True)

    # Um Department tem muitos Roles
    roles = relationship("Role", back_populates="department")
