from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Substitua pela sua string de conexão real do PostgreSQL
# Formato: postgresql://<usuario>:<senha>@<host>:<porta>/<nome_do_banco_de_dados>
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:admin@localhost:5432/mystogan_erp"

# O engine gerencia a conexão real com o banco de dados PostgreSQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal atua como uma fábrica para criar novas sessões de banco de dados (como uma instância do DbContext)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# A classe base declarativa central da qual todos os modelos herdarão
Base = declarative_base()

# Dependência para obter a sessão do banco de dados por requisição do FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()