from Data.connection import SessionLocal, engine, Base
from Models.user import User, UserRole

from Utils.security import hash_password

# Os imports são necessários para criar as tabelas automaticamente
import Models.department
import Models.role
import Models.employee
import Models.user
import Models.product
import Models.stock_movement

# Cria as tabelas no banco se ainda não existirem
Base.metadata.create_all(bind=engine)

db = SessionLocal()

existing = db.query(User).filter(User.email == "admin@empresa.com").first()
if existing:
    print("Admin já existe, pulando seed.")
else:
    admin = User(email="admin@empresa.com", hashed_password=hash_password("admin123"), role=UserRole.ADMIN)
    db.add(admin)
    db.commit()
    print("Admin criado!")

existing_stock = db.query(User).filter(User.email == "estoque@empresa.com").first()
if existing_stock:
    print("Usuário de estoque já existe, pulando seed.")
else:
    stock_user = User(email="estoque@empresa.com", hashed_password=hash_password("estoque123"), role=UserRole.STOCK)
    db.add(stock_user)
    db.commit()
    print("Usuário de estoque criado!")

db.close()