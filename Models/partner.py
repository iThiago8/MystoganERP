from sqlalchemy import Column, Integer, Boolean, String
from sqlalchemy.orm import relationship
from Data.connection import Base

class Partner(Base):
    __tablename__ = "bussines_partners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False, unique=True, index=True)
    cpf_cnpj = Column(String(150), nullable=False, unique=True, index=True)
    phone =  Column(String(20), nullable=True)
    #Clientes não são "Excluídos", somente desativados.
    is_active = Column(Boolean, default=True)

    orders = relationship("Order", back_populates="partner")