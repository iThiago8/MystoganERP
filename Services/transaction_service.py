from Repositories.transaction_repository import TransactionRepository
from Models.transaction import Transaction
from sqlalchemy import Decimal


class TransactionService:

    def __init__(
        self,
        transaction_repository: TransactionRepository
    ):
        self.transaction_repository = transaction_repository

    def create_transaction(self, transaction):

        if transaction.amount <= 0:
            raise ValueError("O valor da transação deve ser maior que zero")

        if transaction.transaction_type not in ["INCOME", "EXPENSE"]:
            raise ValueError("O tipo da transação deve ser RECEITA ou DESPESA")

        return self.transaction_repository.create(transaction)

    def get_all(self):
        return self.transaction_repository.get_all()

    def get_by_id(self, transaction_id):

        result = self.transaction_repository.get_by_id(transaction_id)

        if result is None:
            raise ValueError(
                f"A transação de ID{transaction_id} não foi encontrada")

        return result

    def calculate_total_expenses(self):
        transactions = self.transaction_repository.get_all()
        total_expenses = Decimal("0")

        for transaction in transactions:
            if transaction.transaction_type == "EXPENSE":
                total_expenses += transaction.amount

        return total_expenses

    def calculate_total_incomes(self):
        transactions = self.transaction_repository.get_all()
        total_incomes = Decimal("0")

        for transaction in transactions:
            if transaction.transaction_type == "INCOME":
                total_incomes += transaction.amount

        return total_incomes

    def calculatel_balance(self):

        return self.calculate_total_incomes() - self.calculate_total_expenses()
