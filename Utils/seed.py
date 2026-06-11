from Data.connection import SessionLocal, engine, Base
from Models.user import User, UserRole

from Utils.security import hash_password

# Os imports são necessários para criar as tabelas automaticamente
import Models.department
import Models.role
import Models.employee
import Models.user
<<<<<<< HEAD
=======
import Models.transaction
>>>>>>> GadeiaBranch

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
db.close()
=======
db.close()
>>>>>>> GadeiaBranch
