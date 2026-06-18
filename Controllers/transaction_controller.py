from fastapi import APIRouter, Depends, status
from DTOs.transaction_dto import TransactionResponseDTO, UpdateTransactionDTO, CreateTransactionDTO
from DTOs.auth_dto import TokenPayload
from Services.transaction_service import TransactionService
from Models.transaction import Transaction
from Config.dependencies import get_transaction_service, get_current_user

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


@router.get("/", response_model=list[TransactionResponseDTO])
def get_all_transactions(
    service: TransactionService = Depends(get_transaction_service),
    # _: TokenPayload = Depends(get_current_user)
):
    return service.get_all()


@router.get("/{transaction_id}", response_model=TransactionResponseDTO)
def get_transaction_by_id(
    transaction_id: int,
    service: TransactionService = Depends(get_transaction_service),
    # _: TokenPayload = Depends(get_current_user)
):
    return service.get_by_id(transaction_id)


@router.post(
    "/",
    response_model=TransactionResponseDTO,
    status_code=status.HTTP_201_CREATED
)
def create_transaction(
    transaction: CreateTransactionDTO,
    service: TransactionService = Depends(get_transaction_service),
    # _: TokenPayload = Depends(get_current_user)
):
    return service.create_transaction(transaction)


@router.delete(
    "/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_transaction(
    transaction_id: int,
    service: TransactionService = Depends(get_transaction_service),
    # _: TokenPayload = Depends(get_current_user)
):
    service.delete(transaction_id)


@router.put(
    "/{transaction_id}",
    response_model=TransactionResponseDTO
)
def update_transaction(
    transaction_id: int,
    transaction: UpdateTransactionDTO,
    service: TransactionService = Depends(get_transaction_service),
    # _: TokenPayload = Depends(get_current_user)
):
    return service.update_transaction(transaction_id, transaction)
