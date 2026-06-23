import Models.stock_movement
import Models.product
import Models.transaction
import Models.delivery
import Models.department
import Models.role
import Models.employee
import Models.user

import datetime
from decimal import Decimal
from Data.connection import SessionLocal
from Models.product import Product
from Models.stock_movement import StockMovement, MovementType
from Models.delivery import Delivery, DeliveryStatus
from Models.transaction import Transaction
from Models.user import User

db = SessionLocal()

# Encontra um usuário para associar às movimentações/entregas
user = db.query(User).first()
user_id = user.id if user else None

print("Iniciando carga de dados de teste...")

try:
    # 1. Limpar dados anteriores para evitar duplicados
    db.query(Delivery).delete()
    db.query(StockMovement).delete()
    db.query(Product).delete()
    db.query(Transaction).delete()
    db.commit()
    print("Tabelas limpas com sucesso!")
except Exception as e:
    db.rollback()
    print(f"Erro ao limpar tabelas: {e}")

# 2. Criar Produtos
products_data = [
    {"name": "Laptop Dell Inspiron 15", "description": "Intel Core i5, 8GB RAM, 256GB SSD", "quantity": 25, "minimum_quantity": 5},
    {"name": "Teclado Mecânico HyperX Alloy", "description": "Switch Cherry MX Red, ABNT2", "quantity": 4, "minimum_quantity": 10}, # Alerta
    {"name": "Monitor LG UltraWide 29", "description": "IPS, Full HD, 75Hz", "quantity": 15, "minimum_quantity": 3},
    {"name": "Mouse Gamer Razer DeathAdder", "description": "6400 DPI, Sensor Óptico", "quantity": 0, "minimum_quantity": 8}, # Alerta
    {"name": "Cadeira Office Flexform Uni", "description": "Ergonômica, NR17", "quantity": 8, "minimum_quantity": 2}
]

created_products = {}
for p_info in products_data:
    product = Product(
        name=p_info["name"],
        description=p_info["description"],
        quantity=p_info["quantity"],
        minimum_quantity=p_info["minimum_quantity"],
        is_active=True
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    created_products[product.name] = product
    print(f"Produto criado: {product.name} (ID: {product.id})")

# 3. Criar Movimentações de Estoque (Entradas e Saídas)
movements_to_create = [
    # Laptop Dell: Entrada de 30 e Saída de 5 = 25
    {"product": "Laptop Dell Inspiron 15", "type": MovementType.ENTRADA, "qty": 30, "notes": "Carga inicial de estoque"},
    {"product": "Laptop Dell Inspiron 15", "type": MovementType.SAIDA, "qty": 5, "notes": "Retirada para departamento de Vendas"},
    # Teclado Mecânico: Entrada de 10 e Saída de 6 = 4
    {"product": "Teclado Mecânico HyperX Alloy", "type": MovementType.ENTRADA, "qty": 10, "notes": "Compra com fornecedor"},
    {"product": "Teclado Mecânico HyperX Alloy", "type": MovementType.SAIDA, "qty": 6, "notes": "Distribuição para desenvolvedores"},
    # Monitor LG: Entrada de 15 = 15
    {"product": "Monitor LG UltraWide 29", "type": MovementType.ENTRADA, "qty": 15, "notes": "Entrada de lote novo"},
    # Mouse Razer: Entrada de 10 e Saída de 10 = 0
    {"product": "Mouse Gamer Razer DeathAdder", "type": MovementType.ENTRADA, "qty": 10, "notes": "Lote promocional"},
    {"product": "Mouse Gamer Razer DeathAdder", "type": MovementType.SAIDA, "qty": 10, "notes": "Venda em lote fechado"},
    # Cadeira Office: Entrada de 8 = 8
    {"product": "Cadeira Office Flexform Uni", "type": MovementType.ENTRADA, "qty": 8, "notes": "Aquisição para escritórios"},
]

for mov in movements_to_create:
    prod = created_products.get(mov["product"])
    if prod:
        movement = StockMovement(
            product_id=prod.id,
            movement_type=mov["type"],
            quantity=mov["qty"],
            notes=mov["notes"],
            user_id=user_id
        )
        db.add(movement)
        print(f"Movimentação de {mov['type'].value} para {prod.name}: {mov['qty']} unidades")
db.commit()

# 4. Criar Entregas (Logística)
deliveries_data = [
    {"product": "Laptop Dell Inspiron 15", "qty": 2, "destination": "Av. Paulista, 1000, Ap 52 - São Paulo/SP", "recipient": "Carlos Eduardo", "status": DeliveryStatus.ENTREGUE, "notes": "Entregue dentro do prazo"},
    {"product": "Teclado Mecânico HyperX Alloy", "qty": 1, "destination": "Rua das Flores, 123 - Rio de Janeiro/RJ", "recipient": "Mariana Souza", "status": DeliveryStatus.EM_TRANSPORTE, "notes": "Código de rastreio BR123456789"},
    {"product": "Monitor LG UltraWide 29", "qty": 1, "destination": "Rua XV de Novembro, 456 - Curitiba/PR", "recipient": "Roberto Alencar", "status": DeliveryStatus.PENDENTE, "notes": "Aguardando transportadora coletar"},
    {"product": "Cadeira Office Flexform Uni", "qty": 2, "destination": "Av. Beira Mar, 789 - Florianópolis/SC", "recipient": "Fernanda Lima", "status": DeliveryStatus.CANCELADA, "notes": "Cancelado pelo cliente antes do despacho"}
]

for deliv in deliveries_data:
    prod = created_products.get(deliv["product"])
    if prod:
        delivery = Delivery(
            product_id=prod.id,
            quantity=deliv["qty"],
            destination=deliv["destination"],
            recipient_name=deliv["recipient"],
            status=deliv["status"],
            notes=deliv["notes"],
            user_id=user_id,
            delivered_at=datetime.datetime.now() if deliv["status"] == DeliveryStatus.ENTREGUE else None
        )
        db.add(delivery)
        print(f"Entrega criada: {prod.name} para {deliv['recipient']} ({deliv['status'].value})")
db.commit()

# 5. Criar Transações Financeiras (últimos 7 dias)
today = datetime.date.today()
transactions_data = [
    # 6 dias atrás
    {"desc": "Venda de Laptops Dell", "type": "INCOME", "amount": 6200.00, "days_ago": 6, "cat": "SALES"},
    {"desc": "Compra de insumos de escritório", "type": "EXPENSE", "amount": 450.00, "days_ago": 6, "cat": "OFFICE"},
    # 5 dias atrás
    {"desc": "Venda de Monitores LG", "type": "INCOME", "amount": 3400.00, "days_ago": 5, "cat": "SALES"},
    {"desc": "Assinaturas de software em nuvem", "type": "EXPENSE", "amount": 890.00, "days_ago": 5, "cat": "TECHNOLOGY"},
    # 4 dias atrás
    {"desc": "Venda de Teclados Mecânicos", "type": "INCOME", "amount": 1800.00, "days_ago": 4, "cat": "SALES"},
    {"desc": "Serviço de frete e entregas", "type": "EXPENSE", "amount": 350.00, "days_ago": 4, "cat": "PURCHASES"},
    # 3 dias atrás
    {"desc": "Venda de Cadeiras Office", "type": "INCOME", "amount": 4200.00, "days_ago": 3, "cat": "SALES"},
    {"desc": "Anúncios em redes sociais", "type": "EXPENSE", "amount": 1200.00, "days_ago": 3, "cat": "MARKETING"},
    # 2 dias atrás
    {"desc": "Recebimento de consultoria externa", "type": "INCOME", "amount": 2500.00, "days_ago": 2, "cat": "SALES"},
    {"desc": "Imposto Simples Nacional", "type": "EXPENSE", "amount": 1150.00, "days_ago": 2, "cat": "TAXES"},
    # 1 dia atrás
    {"desc": "Venda de Mouses Razer", "type": "INCOME", "amount": 2900.00, "days_ago": 1, "cat": "SALES"},
    {"desc": "Manutenção preventiva ar condicionado", "type": "EXPENSE", "amount": 600.00, "days_ago": 1, "cat": "OFFICE"},
    # Hoje
    {"desc": "Venda de Lote de Laptops", "type": "INCOME", "amount": 12500.00, "days_ago": 0, "cat": "SALES"},
    {"desc": "Folha de pagamento de estagiários", "type": "EXPENSE", "amount": 4500.00, "days_ago": 0, "cat": "PAYROLL"}
]

for trans in transactions_data:
    t_date = today - datetime.timedelta(days=trans["days_ago"])
    transaction = Transaction(
        description=trans["desc"],
        transaction_type=trans["type"],
        amount=Decimal(str(trans["amount"])),
        transaction_date=t_date,
        category=trans["cat"]
    )
    db.add(transaction)
    print(f"Transação criada: {trans['desc']} (Data: {t_date}, Tipo: {trans['type']}, Valor: R$ {trans['amount']})")
db.commit()

db.close()
print("Carga de dados de teste finalizada com sucesso!")
