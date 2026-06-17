from sqlalchemy import String, Numeric, Date, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from datetime import date
from datetime import datetime
from decimal import Decimal
from Data.connection import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    description: Mapped[str] = mapped_column(
        String(250),
        nullable=False
    )

    transaction_type: Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(16, 2),
        nullable=False
    )

    transaction_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    category: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
