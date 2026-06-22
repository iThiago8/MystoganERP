from pydantic import BaseModel
from pydantic import EmailStr
from typing import Optional

class PartnerCreate(BaseModel):
    name: str
    email: EmailStr
    cpf_cnpj: str
    phone: Optional[str] = None

class PartnerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    cpf_cnpj: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None 

class PartnerResponse(BaseModel):
    id: int
    name: str
    email: str
    cpf_cnpj: str
    phone: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}