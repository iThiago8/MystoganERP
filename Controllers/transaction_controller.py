from fastapi import APIRouter, Depends
from DTOs.transaction_dto import TransactionResponseDTO, UpdateTransactionDTO, CreateTransactionDTO
from Services.transaction_service import TransactionService
from Models.transaction import Transaction
from Config.dependencies import get_transaction_service

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


@router.get("/")
def get_all_transactions(
    service: TransactionService = Depends(get_transaction_service)
):
    return service.get_all()


@router.post("/")
def create_transaction(
    transaction: CreateTransactionDTO,
    service: TransactionService = Depends(get_transaction_service),
):

    return service.create_transaction(transaction)
