import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiTruck,
  FiXCircle,
} from "react-icons/fi";

import api from "../services/api";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import StatCard from "../components/ui/StatCard";
import { formatDateTime } from "../utils/date";
import styles from "./Logistics.module.css";

const emptyForm = {
  product_id: "",
  quantity: "",
  destination: "",
  recipient_name: "",
  notes: "",
};

const STATUS_LABELS = {
  PENDENTE: "Pendente",
  EM_TRANSPORTE: "Em transporte",
  ENTREGUE: "Entregue",
  CANCELADA: "Cancelada",
};

const STATUS_TONES = {
  PENDENTE: "gold",
  EM_TRANSPORTE: "default",
  ENTREGUE: "success",
  CANCELADA: "danger",
};

export default function Logistics() {
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [productFilter, setProductFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const stats = useMemo(() => {
    return {
      total: deliveries.length,
      pending: deliveries.filter((delivery) => delivery.status === "PENDENTE").length,
      transit: deliveries.filter((delivery) => delivery.status === "EM_TRANSPORTE").length,
      delivered: deliveries.filter((delivery) => delivery.status === "ENTREGUE").length,
      canceled: deliveries.filter((delivery) => delivery.status === "CANCELADA").length,
    };
  }, [deliveries]);

  const productById = useMemo(() => {
    return products.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});
  }, [products]);

  const selectedProduct = form.product_id ? productById[Number(form.product_id)] : null;
  const activeProducts = products.filter((product) => product.is_active);

  const getErrorMessage = useCallback((err) => {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      return "Acesso restrito a usuários de estoque ou administradores.";
    }

    return err?.response?.data?.detail || "Não foi possível concluir a operação.";
  }, []);

  const loadDeliveries = useCallback(async (selectedProductId = productFilter) => {
    setLoading(true);

    try {
      const deliveriesRequest = selectedProductId
        ? api.get(`/deliveries/product/${selectedProductId}`)
        : api.get("/deliveries/");

      const [deliveriesResponse, productsResponse] = await Promise.all([
        deliveriesRequest,
        api.get("/products/"),
      ]);

      setDeliveries(deliveriesResponse.data);
      setProducts(productsResponse.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
      setSuccess("");
    } finally {
      setLoading(false);
    }
  }, [getErrorMessage, productFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDeliveries();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadDeliveries]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm);
  };

  const handleProductFilter = async (event) => {
    const productId = event.target.value;
    setProductFilter(productId);
    await loadDeliveries(productId);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await api.post("/deliveries/", {
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        destination: form.destination,
        recipient_name: form.recipient_name,
        notes: form.notes || null,
      });

      setSuccess("Entrega criada e estoque baixado.");
      setError("");
      closeModal();
      await loadDeliveries(productFilter);
    } catch (err) {
      setError(getErrorMessage(err));
      setSuccess("");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (deliveryId, status) => {
    try {
      await api.put(`/deliveries/${deliveryId}/status`, { status });
      setSuccess(status === "CANCELADA" ? "Entrega cancelada e estoque estornado." : "Status atualizado.");
      setError("");
      await loadDeliveries(productFilter);
    } catch (err) {
      setError(getErrorMessage(err));
      setSuccess("");
    }
  };

  return (
    <div className={styles.logistics}>
      <div className={styles.toolbar}>
        <p className={styles.helper}>
          Entregas vinculadas a produtos, com baixa automática ao criar e estorno ao cancelar.
        </p>

        <div className={styles.actions}>
          <Button variant="ghost" icon={FiRefreshCw} onClick={() => loadDeliveries(productFilter)} disabled={loading}>
            Atualizar
          </Button>
          <Button icon={FiPlus} onClick={openCreate}>
            Nova entrega
          </Button>
        </div>
      </div>

      {(error || success) && (
        <div className={`${styles.notice} ${error ? styles.noticeError : styles.noticeSuccess}`}>
          {error || success}
        </div>
      )}

      <div className={styles.statsGrid}>
        <StatCard icon={FiTruck} label="Total" value={stats.total} />
        <StatCard icon={FiClock} label="Pendentes" value={stats.pending} tone="gold" />
        <StatCard icon={FiPackage} label="Em transporte" value={stats.transit} />
        <StatCard icon={FiCheckCircle} label="Entregues" value={stats.delivered} />
        <StatCard icon={FiXCircle} label="Canceladas" value={stats.canceled} />
      </div>

      <Card
        title="Entregas registradas"
        subtitle="Acompanhe produto, quantidade, destino, prazo operacional e status."
        action={
          <label className={styles.inlineFilter}>
            <span>Produto</span>
            <select value={productFilter} onChange={handleProductFilter}>
              <option value="">Todos</option>
                {activeProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
              ))}
            </select>
          </label>
        }
      >
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Produto</th>
                <th>Qtd.</th>
                <th>Destino</th>
                <th>Status</th>
                <th>Criada em</th>
                <th>Finalizada em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td>#{delivery.id}</td>
                  <td>
                    <span className={styles.name}>
                      {productById[delivery.product_id]?.name || `Produto #${delivery.product_id}`}
                    </span>
                    <small>Recebedor: {delivery.recipient_name}</small>
                  </td>
                  <td>
                    <strong className={styles.quantity}>{delivery.quantity}</strong>
                  </td>
                  <td>
                    <span className={styles.destination}>{delivery.destination}</span>
                    {delivery.notes && <small>{delivery.notes}</small>}
                  </td>
                  <td>
                    <Badge tone={STATUS_TONES[delivery.status]}>
                      {STATUS_LABELS[delivery.status]}
                    </Badge>
                  </td>
                  <td>{formatDateTime(delivery.created_at)}</td>
                  <td>{formatDateTime(delivery.delivered_at)}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        title="Marcar em transporte"
                        aria-label="Marcar em transporte"
                        disabled={delivery.status !== "PENDENTE"}
                        onClick={() => updateStatus(delivery.id, "EM_TRANSPORTE")}
                      >
                        <FiTruck size={15} />
                      </button>
                      <button
                        type="button"
                        title="Marcar entregue"
                        aria-label="Marcar entregue"
                        disabled={delivery.status === "ENTREGUE" || delivery.status === "CANCELADA"}
                        onClick={() => updateStatus(delivery.id, "ENTREGUE")}
                      >
                        <FiCheckCircle size={15} />
                      </button>
                      <button
                        type="button"
                        title="Cancelar entrega"
                        aria-label="Cancelar entrega"
                        disabled={delivery.status === "ENTREGUE" || delivery.status === "CANCELADA"}
                        onClick={() => updateStatus(delivery.id, "CANCELADA")}
                      >
                        <FiXCircle size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!deliveries.length && (
                <tr>
                  <td colSpan="8" className={styles.emptyCell}>
                    Nenhuma entrega registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title="Nova entrega"
        subtitle="Ao criar, o estoque do produto é baixado automaticamente."
        onClose={closeModal}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Produto</span>
            <select value={form.product_id} onChange={updateField("product_id")} required>
              <option value="">Selecione</option>
              {activeProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - disponível {product.quantity}
                </option>
              ))}
            </select>
          </label>

          {selectedProduct && (
            <div className={styles.productSummary}>
              <div>
                <span>Saldo disponível</span>
                <strong>{selectedProduct.quantity}</strong>
              </div>
              <div>
                <span>Estoque mínimo</span>
                <strong>{selectedProduct.minimum_quantity}</strong>
              </div>
              <div>
                <span>Situação</span>
                <Badge tone={selectedProduct.is_low_stock ? "gold" : "success"}>
                  {selectedProduct.is_low_stock ? "Baixo estoque" : "Normal"}
                </Badge>
              </div>
            </div>
          )}

          <div className={styles.twoColumns}>
            <label className={styles.field}>
              <span>Quantidade</span>
              <input type="number" min="1" value={form.quantity} onChange={updateField("quantity")} required />
            </label>

            <label className={styles.field}>
              <span>Destinatário</span>
              <input type="text" value={form.recipient_name} onChange={updateField("recipient_name")} required />
            </label>
          </div>

          <p className={styles.ruleNote}>
            Ao criar a entrega, o estoque é baixado. Se cancelar antes de entregar, o sistema estorna automaticamente.
          </p>

          <label className={styles.field}>
            <span>Destino</span>
            <input type="text" value={form.destination} onChange={updateField("destination")} required />
          </label>

          <label className={styles.field}>
            <span>Observação</span>
            <textarea value={form.notes} onChange={updateField("notes")} rows={3} />
          </label>

          <div className={styles.formActions}>
            <Button icon={FiPlus} type="submit" disabled={saving}>
              {saving ? "Criando..." : "Criar entrega"}
            </Button>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
