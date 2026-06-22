from sqlalchemy import select
from Models.Transaction import Transaction
from Interfaces.i_transaction_repository import ITransactionRepository


class TransactionRepository(ITransactionRepository):

    def __init__(self, session):
        self.session = session

    def create(
        self,
        transaction: Transaction
    ) -> Transaction:""

        self.session.add(transaction)
        self.session.commit()
        self.session.refresh(transaction)

        return transaction

    def get_all(
        self
    ) -> list[Transaction]:

        return self.session.scalars(
            select(Transaction)
        ).all()

    def get_by_id(
        self,
        transaction_id: int
    ) -> Transaction | None:

        return self.session.scalar(
            select(Transaction).where(
                Transaction.id == transaction_id
            )
        )

    def delete(
        self,
        transaction_id: int
    ) -> bool:

        transaction = self.get_by_id(transaction_id)

        if transaction is None:
            return False

        self.session.delete(transaction)
        self.session.commit()

        return True

    def update(
        self,
        transaction: Transaction
    ) -> Transaction:

        self.session.commit()
        self.session.refresh(transaction)

        return transaction
