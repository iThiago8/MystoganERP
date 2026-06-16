from fastapi import APIRouter, Depends, status
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


@router.get("/{transaction_id}", response_model=TransactionResponseDTO)
def get_transaction_by_id(
    transaction_id: int,
    service: TransactionService = Depends(get_transaction_service)
):
    return service.get_by_id(transaction_id)


@router.post("/")
def create_transaction(
    transaction: CreateTransactionDTO,
    service: TransactionService = Depends(get_transaction_service),
):

    return service.create_transaction(transaction)


@router.delete("/{transaction_id}",
               status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    service: TransactionService = Depends(get_transaction_service)
):

    service.delete(transaction_id)
