import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiBox,
  FiCheckCircle,
  FiEdit2,
  FiPackage,
  FiPower,
  FiPlus,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";

import api from "../services/api";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import { formatDateTime } from "../utils/date";
import styles from "./Stock.module.css";

const emptyProductForm = {
  name: "",
  description: "",
  minimum_quantity: 0,
  is_active: true,
};

const emptyMovementForm = {
  product_id: "",
  movement_type: "entrada",
  quantity: "",
  notes: "",
};

const MOVEMENT_LABELS = {
  entrada: "Entrada",
  saida: "Saída",
};

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [productMovements, setProductMovements] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [productForm, setProductForm] = useState(emptyProductForm);
  const [movementForm, setMovementForm] = useState(emptyMovementForm);
  const [editingProductId, setEditingProductId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingMovement, setSavingMovement] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalQuantity = useMemo(
    () => products.reduce((total, product) => total + Number(product.quantity || 0), 0),
    [products]
  );

  const productById = useMemo(() => {
    return products.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});
  }, [products]);

  const latestMovements = movements.slice(0, 6);
  const activeProducts = products.filter((product) => product.is_active);

  const showSuccess = useCallback((message) => {
    setSuccess(message);
    setError("");
  }, []);

  const showError = useCallback((message) => {
    setError(message);
    setSuccess("");
  }, []);

  const getErrorMessage = useCallback((err) => {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      return "Faça login com um usuário de estoque ou administrador.";
    }

    if (err?.response?.status === 409) {
      return err?.response?.data?.detail || "Operação bloqueada por vínculo com histórico.";
    }

    return err?.response?.data?.detail || "Não foi possível concluir a operação.";
  }, []);

  const loadStockData = useCallback(async () => {
    setLoading(true);

    try {
      const [productsResponse, lowStockResponse, movementsResponse] = await Promise.all([
        api.get("/products/"),
        api.get("/products/low-stock"),
        api.get("/stock-movements/"),
      ]);

      setProducts(productsResponse.data);
      setLowStockProducts(lowStockResponse.data);
      setMovements(movementsResponse.data);
      setError("");
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [getErrorMessage, showError]);

  const loadProductMovements = useCallback(async (productId) => {
    try {
      const response = await api.get(`/stock-movements/product/${productId}`);
      setProductMovements(response.data);
    } catch (err) {
      showError(getErrorMessage(err));
    }
  }, [getErrorMessage, showError]);

  const loadProductById = useCallback(async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      setSelectedProduct(response.data);
      await loadProductMovements(productId);
    } catch (err) {
      showError(getErrorMessage(err));
    }
  }, [getErrorMessage, loadProductMovements, showError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStockData();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadStockData]);

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setSavingProduct(true);

    const payload = {
      name: productForm.name,
      description: productForm.description || null,
      minimum_quantity: Number(productForm.minimum_quantity || 0),
      is_active: productForm.is_active,
    };

    try {
      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, payload);
        showSuccess("Produto atualizado.");
      } else {
        await api.post("/products/", payload);
        showSuccess("Produto cadastrado.");
      }

      setProductForm(emptyProductForm);
      setEditingProductId(null);
      await loadStockData();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSavingProduct(false);
    }
  };

  const startProductEdit = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      description: product.description || "",
      minimum_quantity: product.minimum_quantity,
      is_active: product.is_active,
    });
  };

  const cancelProductEdit = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
  };

  const inactivateProduct = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      if (selectedProduct?.id === productId) {
        await loadProductById(productId);
      }
      showSuccess("Produto inativado.");
      await loadStockData();
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const handleMovementSubmit = async (event) => {
    event.preventDefault();
    setSavingMovement(true);

    try {
      await api.post("/stock-movements/", {
        product_id: Number(movementForm.product_id),
        movement_type: movementForm.movement_type,
        quantity: Number(movementForm.quantity),
        notes: movementForm.notes || null,
      });

      showSuccess("Movimentação registrada.");
      setMovementForm(emptyMovementForm);
      await loadStockData();

      if (selectedProduct) {
        await loadProductById(selectedProduct.id);
        await loadProductMovements(selectedProduct.id);
      }
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSavingMovement(false);
    }
  };

  const selectProduct = (product) => {
    setSelectedProduct(product);
    loadProductMovements(product.id);
    setMovementForm((current) => ({
      ...current,
      product_id: product.id,
    }));
  };

  return (
    <div className={styles.stock}>
      <div className={styles.toolbar}>
        <p className={styles.helper}>
          Controle de produtos, saldo disponível, estoque mínimo e movimentações auditáveis.
        </p>

        <div className={styles.actions}>
          <Button variant="ghost" icon={FiRefreshCw} onClick={loadStockData} disabled={loading}>
            Atualizar
          </Button>
        </div>
      </div>

      {(error || success) && (
        <div className={`${styles.notice} ${error ? styles.noticeError : styles.noticeSuccess}`}>
          {error || success}
        </div>
      )}

      <div className={styles.statsGrid}>
        <StatCard icon={FiBox} label="Produtos" value={products.length} />
        <StatCard icon={FiPackage} label="Saldo total" value={totalQuantity} />
        <StatCard icon={FiAlertTriangle} label="Abaixo do mínimo" value={lowStockProducts.length} tone="gold" />
        <StatCard icon={FiCheckCircle} label="Movimentações" value={movements.length} />
      </div>

      <div className={styles.mainGrid}>
        <Card title="Produtos cadastrados" subtitle="Saldo atual, mínimo definido e situação operacional.">
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Saldo</th>
                  <th>Mínimo</th>
                  <th>Status</th>
                  <th>Situação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className={selectedProduct?.id === product.id ? styles.selectedRow : ""}
                  >
                    <td>
                      <button className={styles.linkButton} onClick={() => selectProduct(product)}>
                        {product.name}
                      </button>
                      {product.description && (
                        <span className={styles.description}>{product.description}</span>
                      )}
                    </td>
                    <td>
                      <strong className={styles.quantity}>{product.quantity}</strong>
                    </td>
                    <td>{product.minimum_quantity}</td>
                    <td>
                      <Badge tone={product.is_low_stock ? "gold" : "success"}>
                        {product.is_low_stock ? "Baixo" : "OK"}
                      </Badge>
                    </td>
                    <td>
                      <Badge tone={product.is_active ? "success" : "danger"}>
                        {product.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button title="Consultar" aria-label={`Consultar ${product.name}`} onClick={() => loadProductById(product.id)}>
                          <FiSearch size={15} />
                        </button>
                        <button title="Editar" aria-label={`Editar ${product.name}`} onClick={() => startProductEdit(product)}>
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          title={product.is_active ? "Inativar produto" : "Produto já inativo"}
                          aria-label={`Inativar ${product.name}`}
                          disabled={!product.is_active}
                          onClick={() => inactivateProduct(product.id)}
                        >
                          <FiPower size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!products.length && (
                  <tr>
                    <td colSpan="6" className={styles.emptyCell}>
                      Nenhum produto cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title={editingProductId ? "Editar produto" : "Novo produto"} subtitle="O saldo inicial fica zerado; ajuste por entrada de estoque.">
          <form className={styles.form} onSubmit={handleProductSubmit}>
            <label className={styles.field}>
              <span>Nome</span>
              <input
                type="text"
                value={productForm.name}
                onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                required
              />
            </label>

            <label className={styles.field}>
              <span>Descrição</span>
              <textarea
                value={productForm.description}
                onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                rows={3}
              />
            </label>

            <label className={styles.field}>
              <span>Estoque mínimo</span>
              <input
                type="number"
                min="0"
                value={productForm.minimum_quantity}
                onChange={(event) =>
                  setProductForm({ ...productForm, minimum_quantity: event.target.value })
                }
              />
            </label>

            {editingProductId && (
              <label className={styles.field}>
                <span>Situação</span>
                <select
                  value={productForm.is_active ? "active" : "inactive"}
                  onChange={(event) =>
                    setProductForm({ ...productForm, is_active: event.target.value === "active" })
                  }
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </label>
            )}

            <div className={styles.formActions}>
              <Button icon={FiPlus} type="submit" disabled={savingProduct}>
                {editingProductId ? "Salvar" : "Cadastrar"}
              </Button>
              {editingProductId && (
                <Button type="button" variant="ghost" onClick={cancelProductEdit}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>

      <div className={styles.mainGrid}>
        <Card
          title="Movimentação"
          subtitle="Registre entrada ou saída de estoque."
          className={!selectedProduct ? styles.fullWidth : ""}
        >
          <form className={styles.form} onSubmit={handleMovementSubmit}>
            <label className={styles.field}>
              <span>Produto</span>
              <select
                value={movementForm.product_id}
                onChange={(event) =>
                  setMovementForm({ ...movementForm, product_id: event.target.value })
                }
                required
              >
                <option value="">Selecione</option>
                {activeProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - saldo {product.quantity}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.twoColumns}>
              <label className={styles.field}>
                <span>Tipo</span>
                <select
                  value={movementForm.movement_type}
                  onChange={(event) =>
                    setMovementForm({ ...movementForm, movement_type: event.target.value })
                  }
                  required
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>Quantidade</span>
                <input
                  type="number"
                  min="1"
                  value={movementForm.quantity}
                  onChange={(event) =>
                    setMovementForm({ ...movementForm, quantity: event.target.value })
                  }
                  required
                />
              </label>
            </div>

            <label className={styles.field}>
              <span>Observação</span>
              <textarea
                value={movementForm.notes}
                onChange={(event) => setMovementForm({ ...movementForm, notes: event.target.value })}
                rows={3}
              />
            </label>

            <Button icon={FiPlus} type="submit" disabled={savingMovement}>
              Registrar
            </Button>
          </form>
        </Card>

        {selectedProduct && (
          <Card
            title={`Histórico de ${selectedProduct.name}`}
            subtitle="Entradas e saídas registradas para este produto."
          >
            <div className={styles.historyList}>
              {productMovements.map((movement) => (
                <div key={movement.id} className={styles.historyItem}>
                  <Badge tone={movement.movement_type === "entrada" ? "success" : "danger"}>
                    {MOVEMENT_LABELS[movement.movement_type]}
                  </Badge>
                  <div className={styles.historyText}>
                    <span>{movement.quantity} un.</span>
                    {movement.notes && <small>{movement.notes}</small>}
                  </div>
                  <small>{formatDateTime(movement.created_at)}</small>
                </div>
              ))}

              {!productMovements.length && (
                <p className={styles.emptyText}>Sem movimentações para este produto.</p>
              )}
            </div>
          </Card>
        )}
      </div>

      <div className={styles.bottomGrid}>
        <Card title="Baixo estoque" subtitle="Produtos com saldo igual ou abaixo do mínimo.">
          <div className={styles.compactList}>
            {lowStockProducts.map((product) => (
              <button key={product.id} className={styles.compactItem} onClick={() => selectProduct(product)}>
                <span>{product.name}</span>
                <Badge tone="gold">
                  {product.quantity}/{product.minimum_quantity}
                </Badge>
              </button>
            ))}

            {!lowStockProducts.length && (
              <p className={styles.emptyText}>Nenhum produto em baixo estoque.</p>
            )}
          </div>
        </Card>

        <Card title="Histórico geral" subtitle="Últimas movimentações registradas.">
          <div className={styles.compactList}>
            {latestMovements.map((movement) => (
              <div key={movement.id} className={styles.compactItem}>
                <Badge tone={movement.movement_type === "entrada" ? "success" : "danger"}>
                  {MOVEMENT_LABELS[movement.movement_type]}
                </Badge>
                <span>{productById[movement.product_id]?.name || `Produto #${movement.product_id}`}</span>
                <small>
                  {movement.quantity} un. · {formatDateTime(movement.created_at)}
                </small>
              </div>
            ))}

            {!latestMovements.length && (
              <p className={styles.emptyText}>Nenhuma movimentação registrada.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

