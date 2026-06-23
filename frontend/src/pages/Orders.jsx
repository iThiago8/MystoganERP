import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiDollarSign,
  FiList,
  FiPlus,
  FiRefreshCw,
  FiShoppingCart,
  FiTrash2,
} from "react-icons/fi";

import api from "../services/api";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import StatCard from "../components/ui/StatCard";
import { formatDateTime } from "../utils/date";
import styles from "./Orders.module.css";

const emptyForm = {
  type: "SALE",
  partner_id: "",
  items: [],
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------- Carregar dados ---------- */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, partnersRes, productsRes] = await Promise.all([
        api.get("/orders/"),
        api.get("/partners/?active_only=true"),
        api.get("/products/"),
      ]);

      setOrders(ordersRes.data);
      setPartners(partnersRes.data);
      setProducts(productsRes.data.filter((p) => p.is_active));
      setError("");
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setError("Faça login com um usuário autorizado.");
      } else {
        setError(err?.response?.data?.detail || "Não foi possível carregar os dados.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  /* ---------- Contadores ---------- */
  const { sales, purchases, totalValue } = useMemo(() => {
    let salesCount = 0;
    let purchasesCount = 0;
    let total = 0;

    orders.forEach((o) => {
      if (o.type === "SALE") salesCount++;
      if (o.type === "PURCHASE") purchasesCount++;
      total += Number(o.total_value);
    });

    return { sales: salesCount, purchases: purchasesCount, totalValue: total };
  }, [orders]);

  const productById = useMemo(() => {
    return products.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});
  }, [products]);

  const partnerById = useMemo(() => {
    return partners.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});
  }, [partners]);

  /* ---------- Formulário & Itens ---------- */
  const openModal = () => {
    setForm(emptyForm);
    setSelectedProduct("");
    setSelectedQuantity("");
    setModalOpen(true);
    setError("");
    setSuccess("");
  };

  const addItem = () => {
    if (!selectedProduct || !selectedQuantity || selectedQuantity <= 0) return;

    const prod = productById[selectedProduct];
    if (!prod) return;

    // Previne adicionar o mesmo produto duas vezes (poderia apenas somar a qtde, mas simplificaremos substituindo ou alertando)
    if (form.items.some((i) => i.product_id === prod.id)) {
      alert("Produto já adicionado. Remova-o antes de alterar a quantidade.");
      return;
    }

    setForm((curr) => ({
      ...curr,
      items: [
        ...curr.items,
        {
          product_id: prod.id,
          product_name: prod.name,
          quantity: Number(selectedQuantity),
          unit_price: Number(prod.price),
        },
      ],
    }));

    setSelectedProduct("");
    setSelectedQuantity("");
  };

  const removeItem = (productId) => {
    setForm((curr) => ({
      ...curr,
      items: curr.items.filter((i) => i.product_id !== productId),
    }));
  };

  const previewTotal = useMemo(() => {
    return form.items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
  }, [form.items]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.partner_id) {
      alert("Selecione um parceiro.");
      return;
    }
    if (form.items.length === 0) {
      alert("Adicione pelo menos um item ao pedido.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        type: form.type,
        partner_id: Number(form.partner_id),
        items: form.items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      };

      const response = await api.post("/orders/", payload);
      setOrders((curr) => [response.data, ...curr]);
      setModalOpen(false);
      setSuccess("Pedido registrado com sucesso.");
      setError("");
    } catch (err) {
      setError(err?.response?.data?.detail || "Erro ao registrar o pedido.");
      setSuccess("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.orders}>
      <div className={styles.toolbar}>
        <p className={styles.helper}>
          Central de compras e vendas. Gerencie pedidos e movimente o estoque.
        </p>

        <div className={styles.actions}>
          <Button variant="ghost" icon={FiRefreshCw} onClick={loadData} disabled={loading}>
            Atualizar
          </Button>
          <Button icon={FiPlus} onClick={openModal}>
            Novo Pedido
          </Button>
        </div>
      </div>

      {(error || success) && (
        <div className={`${styles.notice} ${error ? styles.noticeError : styles.noticeSuccess}`}>
          {error || success}
        </div>
      )}

      <div className={styles.statsGrid}>
        <StatCard icon={FiList} label="Total de Pedidos" value={orders.length} />
        <StatCard icon={FiArrowUpRight} label="Vendas" value={sales} tone="success" />
        <StatCard icon={FiArrowDownRight} label="Compras" value={purchases} tone="gold" />
        <StatCard icon={FiDollarSign} label="Valor Movimentado" value={currency.format(totalValue)} />
      </div>

      <Card title="Histórico de Pedidos" subtitle="Listagem de todas as compras e vendas registradas.">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Parceiro</th>
                <th>Data</th>
                <th>Status</th>
                <th>Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isSale = order.type === "SALE";
                return (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>
                      <Badge tone={isSale ? "success" : "gold"}>
                        {isSale ? "Venda" : "Compra"}
                      </Badge>
                    </td>
                    <td>{order.partner_name || partnerById[order.partner_id]?.name || `Parceiro #${order.partner_id}`}</td>
                    <td>{formatDateTime(order.date)}</td>
                    <td>
                      <Badge tone={order.status === "COMPLETED" ? "success" : "default"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td>
                      <span className={`${styles.amount} ${isSale ? styles.amountIncome : styles.amountExpense}`}>
                        {currency.format(Number(order.total_value))}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {!orders.length && (
                <tr>
                  <td colSpan="6" className={styles.emptyCell}>
                    {loading ? "Carregando pedidos..." : "Nenhum pedido registrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title="Novo Pedido"
        subtitle="Registre uma nova compra ou venda."
        onClose={() => setModalOpen(false)}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.twoColumns}>
            <label className={styles.field}>
              <span>Tipo de Pedido</span>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
              >
                <option value="SALE">Venda (Saída de Estoque)</option>
                <option value="PURCHASE">Compra (Entrada de Estoque)</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Parceiro (Cliente/Fornecedor)</span>
              <select
                value={form.partner_id}
                onChange={(e) => setForm({ ...form, partner_id: e.target.value })}
                required
              >
                <option value="">Selecione</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.cpf_cnpj})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.itemsSection}>
            <h4>Itens do Pedido</h4>
            
            <div className={styles.itemAdder}>
              <label className={styles.field} style={{ flex: 2 }}>
                <span>Produto</span>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                  <option value="">Selecione o produto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {currency.format(p.price)} {form.type === "SALE" ? `(Estoque: ${p.quantity})` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field} style={{ flex: 1 }}>
                <span>Qtde.</span>
                <input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(e.target.value)}
                />
              </label>

              <Button
                type="button"
                variant="secondary"
                icon={FiShoppingCart}
                onClick={addItem}
                disabled={!selectedProduct || !selectedQuantity || selectedQuantity <= 0}
                style={{ marginTop: "18px" }}
              >
                Add
              </Button>
            </div>

            <div className={styles.itemsList}>
              {form.items.length > 0 ? (
                <table className={styles.itemsTable}>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Preço Un.</th>
                      <th>Qtde.</th>
                      <th>Subtotal</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item) => (
                      <tr key={item.product_id}>
                        <td>{item.product_name}</td>
                        <td>{currency.format(item.unit_price)}</td>
                        <td>{item.quantity}</td>
                        <td>{currency.format(item.unit_price * item.quantity)}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => removeItem(item.product_id)}
                            title="Remover item"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.emptyItemsText}>Nenhum item adicionado ao pedido ainda.</p>
              )}
            </div>

            <div className={styles.previewTotal}>
              <span>Total Estimado:</span>
              <strong>{currency.format(previewTotal)}</strong>
            </div>
          </div>

          <div className={styles.formActions}>
            <Button icon={FiPlus} type="submit" disabled={saving || form.items.length === 0}>
              {saving ? "Salvando..." : "Confirmar Pedido"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
