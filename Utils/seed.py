import Models.stock_movement
import Models.product
import Models.transaction

from Data.connection import SessionLocal, engine, Base
from Models.user import User, UserRole

from Utils.security import hash_password

# Os imports são necessários para criar as tabelas automaticamente
import Models.department
import Models.role
import Models.employee
import Models.user

from Models.department import Department
from Models.role import Role
from Models.employee import Employee
# Cria as tabelas no banco se ainda não existirem
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# --- Seed de Departamentos ---
ti_dept = db.query(Department).filter(Department.name == "TI").first()
if not ti_dept:
    ti_dept = Department(name="TI", description="Departamento de Tecnologia da Informação")
    db.add(ti_dept)
    db.commit()
    db.refresh(ti_dept)
    print("Departamento 'TI' criado!")

rh_dept = db.query(Department).filter(Department.name == "RH").first()
if not rh_dept:
    rh_dept = Department(name="RH", description="Departamento de Recursos Humanos")
    db.add(rh_dept)
    db.commit()
    db.refresh(rh_dept)
    print("Departamento 'RH' criado!")

# --- Seed de Cargos ---
cargos_ti = ["Desenvolvedor Backend", "Desenvolvedor Frontend", "Suporte Técnico N2"]
for nome_cargo in cargos_ti:
    if not db.query(Role).filter(Role.title == nome_cargo, Role.department_id == ti_dept.id).first():
        db.add(Role(title=nome_cargo, description=f"Atividades de {nome_cargo}", department_id=ti_dept.id))
        print(f"Cargo '{nome_cargo}' criado no TI!")

cargos_rh = ["Analista de Recrutamento", "Business Partner", "Assistente de Departamento Pessoal"]
for nome_cargo in cargos_rh:
    if not db.query(Role).filter(Role.title == nome_cargo, Role.department_id == rh_dept.id).first():
        db.add(Role(title=nome_cargo, description=f"Atividades de {nome_cargo}", department_id=rh_dept.id))
        print(f"Cargo '{nome_cargo}' criado no RH!")


# Admin
existing = db.query(User).filter(
    User.email == "admin@empresa.com"
).first()

if existing:
    print("Admin já existe, pulando seed.")
else:
    admin = User(
        email="admin@empresa.com",
        hashed_password=hash_password("admin123"),
        role=UserRole.ADMIN
    )
    db.add(admin)
    db.commit()
    print("Admin criado!")

# Usuário de estoque
existing_stock = db.query(User).filter(
    User.email == "estoque@empresa.com"
).first()

if existing_stock:
    print("Usuário de estoque já existe, pulando seed.")
else:
    stock_user = User(
        email="estoque@empresa.com",
        hashed_password=hash_password("estoque123"),
        role=UserRole.STOCK
    )

    stock_employee = Employee(
        name = "João da Silva",
        phone = "99999999999",
        hire_date = "2026-05-15",
        is_active = 1,
        role_id = 1,
        user = stock_user
    )

    db.add(stock_user)
    db.add(stock_employee)
    db.commit()
    print("Usuário de estoque criado!")

db.commit()

db.close()
