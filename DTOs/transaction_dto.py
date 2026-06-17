from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class CreateTransactionDTO(BaseModel):
    description: str
    transaction_type: str
    amount: Decimal
    transaction_date: date
    category: str


class UpdateTransactionDTO(BaseModel):
    description: str
    transaction_type: str
    amount: Decimal
    transaction_date: date
    category: str


class TransactionResponseDTO(BaseModel):
    id: int
    description: str
    transaction_type: str
    amount: Decimal
    transaction_date: date
    category: str
    created_at: datetime
