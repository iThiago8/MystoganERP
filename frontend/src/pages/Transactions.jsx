import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiDollarSign,
  FiList,
  FiPlus,
  FiRefreshCw,
  FiTrendingDown,
  FiTrendingUp,
} from "react-icons/fi";

import api from "../services/api";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import StatCard from "../components/ui/StatCard";
import styles from "./Transactions.module.css";

const CATEGORIES = [
  { label: "Vendas", value: "SALES" },
  { label: "Compras", value: "PURCHASES" },
  { label: "Salários", value: "PAYROLL" },
  { label: "Impostos", value: "TAXES" },
  { label: "Marketing", value: "MARKETING" },
  { label: "Tecnologia", value: "TECHNOLOGY" },
  { label: "Transporte", value: "TRANSPORT" },
  { label: "Alimentação", value: "FOOD" },
  { label: "Escritório", value: "OFFICE" },
  { label: "Outros", value: "OTHER" },
];

const emptyForm = {
  description: "",
  transaction_type: "",
  amount: "",
  category: "",
  transaction_date: "",
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getCategoryLabel = useCallback((value) => {
    const found = CATEGORIES.find((cat) => cat.value === value);
    return found ? found.label : value;
  }, []);

  const getErrorMessage = useCallback((err) => {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      return "Faça login com um usuário autorizado para o financeiro.";
    }
    return err?.response?.data?.detail || "Não foi possível concluir a operação.";
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/transactions/");
      setTransactions(response.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [getErrorMessage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTransactions();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadTransactions]);

  const { receitas, despesas, saldo } = useMemo(() => {
    const receitas = transactions
      .filter((t) => t.transaction_type === "INCOME")
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const despesas = transactions
      .filter((t) => t.transaction_type === "EXPENSE")
      .reduce((acc, t) => acc + Number(t.amount), 0);
    return { receitas, despesas, saldo: receitas - despesas };
  }, [transactions]);

  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const openModal = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await api.post("/transactions/", {
        description: form.description,
        transaction_type: form.transaction_type,
        amount: parseFloat(form.amount),
        category: form.category,
        transaction_date: form.transaction_date,
      });

      setTransactions((current) => [...current, response.data]);
      setForm(emptyForm);
      setModalOpen(false);
      setSuccess("Transação registrada.");
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
      setSuccess("");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const [year, month, day] = String(value).slice(0, 10).split("-");
    if (!day) return value;
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={styles.transactions}>
      <div className={styles.toolbar}>
        <p className={styles.helper}>
          Receitas, despesas e o saldo consolidado da operação.
        </p>

        <div className={styles.actions}>
          <Button variant="ghost" icon={FiRefreshCw} onClick={loadTransactions} disabled={loading}>
            Atualizar
          </Button>
          <Button icon={FiPlus} onClick={openModal}>
            Nova transação
          </Button>
        </div>
      </div>

      {(error || success) && (
        <div className={`${styles.notice} ${error ? styles.noticeError : styles.noticeSuccess}`}>
          {error || success}
        </div>
      )}

      <div className={styles.statsGrid}>
        <StatCard icon={FiTrendingUp} label="Receitas" value={currency.format(receitas)} tone="gold" />
        <StatCard icon={FiTrendingDown} label="Despesas" value={currency.format(despesas)} />
        <StatCard icon={FiDollarSign} label="Saldo" value={currency.format(saldo)} />
        <StatCard icon={FiList} label="Transações" value={transactions.length} />
      </div>

      <Card title="Transações" subtitle="Histórico de lançamentos financeiros.">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const isIncome = transaction.transaction_type === "INCOME";
                return (
                  <tr key={transaction.id}>
                    <td className={styles.descriptionCell}>{transaction.description}</td>
                    <td>{getCategoryLabel(transaction.category)}</td>
                    <td>
                      <Badge tone={isIncome ? "success" : "danger"}>
                        {isIncome ? "Receita" : "Despesa"}
                      </Badge>
                    </td>
                    <td>
                      <span className={`${styles.amount} ${isIncome ? styles.amountIncome : styles.amountExpense}`}>
                        {isIncome ? <FiArrowUpRight size={13} /> : <FiArrowDownRight size={13} />}
                        {currency.format(Number(transaction.amount))}
                      </span>
                    </td>
                    <td>{formatDate(transaction.transaction_date)}</td>
                  </tr>
                );
              })}

              {!transactions.length && (
                <tr>
                  <td colSpan="5" className={styles.emptyCell}>
                    {loading ? "Carregando transações..." : "Nenhuma transação registrada."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title="Nova transação"
        subtitle="Registre uma receita ou despesa."
        onClose={() => setModalOpen(false)}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Descrição</span>
            <input type="text" value={form.description} onChange={updateField("description")} required />
          </label>

          <label className={styles.field}>
            <span>Categoria</span>
            <select value={form.category} onChange={updateField("category")} required>
              <option value="">Selecione</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.twoColumns}>
            <label className={styles.field}>
              <span>Tipo</span>
              <select value={form.transaction_type} onChange={updateField("transaction_type")} required>
                <option value="">Selecione</option>
                <option value="INCOME">Receita</option>
                <option value="EXPENSE">Despesa</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Valor</span>
              <input type="number" step="0.01" min="0" value={form.amount} onChange={updateField("amount")} required />
            </label>
          </div>

          <label className={styles.field}>
            <span>Data</span>
            <input type="date" value={form.transaction_date} onChange={updateField("transaction_date")} required />
          </label>

          <Button icon={FiPlus} type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Registrar"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
