from Data.connection import SessionLocal, engine, Base
from Models.user import User, UserRole

from Utils.security import hash_password

# Os imports são necessários para criar as tabelas automaticamente
import Models.department
import Models.role
import Models.employee
import Models.user
<<<<<<< HEAD
<<<<<<< HEAD
=======
import Models.transaction
>>>>>>> GadeiaBranch
=======
import Models.product
import Models.stock_movement
>>>>>>> 97bd37a00b0e05180bb7a790bfc213c7b891ac5b

# Cria as tabelas no banco se ainda não existirem
Base.metadata.create_all(bind=engine)

db = SessionLocal()

existing = db.query(User).filter(User.email == "admin@empresa.com").first()
if existing:
    print("Admin já existe, pulando seed.")
else:
<<<<<<< HEAD
    admin = User(email="admin@empresa.com", hashed_password=hash_password("admin123"), role=UserRole.ADMIN)
=======
    admin = User(email="admin@empresa.com",
                 hashed_password=hash_password("admin123"), role=UserRole.ADMIN)
>>>>>>> GadeiaBranch
    db.add(admin)
    db.commit()
    print("Admin criado!")

<<<<<<< HEAD
<<<<<<< HEAD
db.close()
=======
db.close()
>>>>>>> GadeiaBranch
=======
existing_stock = db.query(User).filter(User.email == "estoque@empresa.com").first()
if existing_stock:
    print("Usuário de estoque já existe, pulando seed.")
else:
    stock_user = User(email="estoque@empresa.com", hashed_password=hash_password("estoque123"), role=UserRole.STOCK)
    db.add(stock_user)
    db.commit()
    print("Usuário de estoque criado!")

db.close()
>>>>>>> 97bd37a00b0e05180bb7a790bfc213c7b891ac5b
