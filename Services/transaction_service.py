from Repositories.transaction_repository import TransactionRepository
from Models.transaction import Transaction
from decimal import Decimal
from DTOs.transaction_dto import CreateTransactionDTO, TransactionResponseDTO, UpdateTransactionDTO
from Interfaces import i_transaction_repository


class TransactionService:

    def __init__(
        self,
        transaction_repository: i_transaction_repository
    ):
        self.transaction_repository = transaction_repository

    def create_transaction(self, transaction_dto: CreateTransactionDTO) -> Transaction:

        transaction = Transaction(
            description=transaction_dto.description,
            transaction_type=transaction_dto.transaction_type,
            amount=transaction_dto.amount,
            transaction_date=transaction_dto.transaction_date,
            category=transaction_dto.category
        )

        if transaction.amount <= 0:
            raise ValueError("O valor da transação deve ser maior que zero")

        if transaction.transaction_type not in ["INCOME", "EXPENSE"]:
            raise ValueError("O tipo da transação deve ser RECEITA ou DESPESA")

        return self.transaction_repository.create(transaction)

    def update_transaction(self, transaction_id: int, transaction_dto: UpdateTransactionDTO) -> Transaction:
        transaction = self.transaction_repository.get_by_id(transaction_id)

        if transaction is None:
            raise ValueError(
                f"Transação com ID {transaction_id} não encontrada")

        transaction.description = transaction_dto.description
        transaction.transaction_type = transaction_dto.transaction_type
        transaction.amount = transaction_dto.amount
        transaction.transaction_date = transaction_dto.transaction_date
        transaction.category = transaction_dto.category

        return self.transaction_repository.update(transaction)

    def get_all(self) -> list[Transaction]:
        return self.transaction_repository.get_all()

    def get_by_id(self, transaction_id: int) -> Transaction:

        result = self.transaction_repository.get_by_id(transaction_id)

        if result is None:
            raise ValueError(
                f"A transação de ID {transaction_id} não foi encontrada")

        return result

    def calculate_total_expenses(self) -> Decimal:
        transactions = self.transaction_repository.get_all()
        total_expenses = Decimal("0")

        for transaction in transactions:
            if transaction.transaction_type == "EXPENSE":
                total_expenses += transaction.amount

        return total_expenses

    def calculate_total_incomes(self) -> Decimal:
        transactions = self.transaction_repository.get_all()
        total_incomes = Decimal("0")

        for transaction in transactions:
            if transaction.transaction_type == "INCOME":
                total_incomes += transaction.amount

        return total_incomes

    def calculate_balance(self) -> Decimal:

        return self.calculate_total_incomes() - self.calculate_total_expenses()

    def delete(self, transaction_id: int) -> bool:
        return self.transaction_repository.delete(transaction_id)
