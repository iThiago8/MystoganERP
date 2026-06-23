import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiPower,
  FiRefreshCw,
  FiRotateCcw,
  FiUsers,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";

import api from "../services/api";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import styles from "./Partners.module.css";

const emptyForm = {
  name: "",
  email: "",
  cpf_cnpj: "",
  phone: "",
};

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------- Contadores ---------- */
  const activeCount = useMemo(
    () => partners.filter((p) => p.is_active).length,
    [partners]
  );
  const inactiveCount = useMemo(
    () => partners.filter((p) => !p.is_active).length,
    [partners]
  );

  /* ---------- Helpers ---------- */
  const showSuccess = useCallback((msg) => {
    setSuccess(msg);
    setError("");
  }, []);

  const showError = useCallback((msg) => {
    setError(msg);
    setSuccess("");
  }, []);

  const getErrorMessage = useCallback((err) => {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      return "Faça login com um usuário autorizado.";
    }
    if (err?.response?.status === 409) {
      return err?.response?.data?.detail || "Registro duplicado.";
    }
    return err?.response?.data?.detail || "Não foi possível concluir a operação.";
  }, []);

  /* ---------- Carregar dados ---------- */
  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/partners/?active_only=false");
      setPartners(response.data);
      setError("");
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [getErrorMessage, showError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPartners();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPartners]);

  /* ---------- Formulário ---------- */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      email: form.email,
      cpf_cnpj: form.cpf_cnpj,
      phone: form.phone || null,
    };

    try {
      if (editingId) {
        await api.put(`/partners/${editingId}`, payload);
        showSuccess("Parceiro atualizado.");
      } else {
        await api.post("/partners/", payload);
        showSuccess("Parceiro cadastrado.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadPartners();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (partner) => {
    setEditingId(partner.id);
    setForm({
      name: partner.name,
      email: partner.email,
      cpf_cnpj: partner.cpf_cnpj,
      phone: partner.phone || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  /* ---------- Ações ---------- */
  const deactivatePartner = async (partnerId) => {
    try {
      await api.delete(`/partners/${partnerId}`);
      showSuccess("Parceiro desativado.");
      await loadPartners();
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const reactivatePartner = async (partnerId) => {
    try {
      await api.patch(`/partners/${partnerId}/reactivate`);
      showSuccess("Parceiro reativado.");
      await loadPartners();
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  return (
    <div className={styles.partners}>
      <div className={styles.toolbar}>
        <p className={styles.helper}>
          Gestão de clientes e fornecedores — cadastro, edição e situação.
        </p>

        <div className={styles.actions}>
          <Button variant="ghost" icon={FiRefreshCw} onClick={loadPartners} disabled={loading}>
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
        <StatCard icon={FiUsers} label="Total" value={partners.length} />
        <StatCard icon={FiUserCheck} label="Ativos" value={activeCount} tone="gold" />
        <StatCard icon={FiUserX} label="Inativos" value={inactiveCount} />
      </div>

      <div className={styles.mainGrid}>
        <Card title="Parceiros cadastrados" subtitle="Clientes e fornecedores do sistema.">
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>CPF / CNPJ</th>
                  <th>Telefone</th>
                  <th>Situação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id}>
                    <td className={styles.nameCell}>{partner.name}</td>
                    <td>{partner.email}</td>
                    <td>{partner.cpf_cnpj}</td>
                    <td>{partner.phone || "—"}</td>
                    <td>
                      <Badge tone={partner.is_active ? "success" : "danger"}>
                        {partner.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          title="Editar"
                          aria-label={`Editar ${partner.name}`}
                          onClick={() => startEdit(partner)}
                        >
                          <FiEdit2 size={15} />
                        </button>

                        {partner.is_active ? (
                          <button
                            title="Desativar"
                            aria-label={`Desativar ${partner.name}`}
                            onClick={() => deactivatePartner(partner.id)}
                          >
                            <FiPower size={15} />
                          </button>
                        ) : (
                          <button
                            title="Reativar"
                            aria-label={`Reativar ${partner.name}`}
                            onClick={() => reactivatePartner(partner.id)}
                          >
                            <FiRotateCcw size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {!partners.length && (
                  <tr>
                    <td colSpan="6" className={styles.emptyCell}>
                      {loading ? "Carregando parceiros..." : "Nenhum parceiro cadastrado."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title={editingId ? "Editar parceiro" : "Novo parceiro"}
          subtitle="Preencha os dados do cliente ou fornecedor."
        >
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Nome</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>

            <label className={styles.field}>
              <span>E-mail</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>

            <label className={styles.field}>
              <span>CPF / CNPJ</span>
              <input
                type="text"
                value={form.cpf_cnpj}
                onChange={(e) => setForm({ ...form, cpf_cnpj: e.target.value })}
                required
              />
            </label>

            <label className={styles.field}>
              <span>Telefone</span>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>

            <div className={styles.formActions}>
              <Button icon={FiPlus} type="submit" disabled={saving}>
                {saving ? "Salvando..." : editingId ? "Salvar" : "Cadastrar"}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={cancelEdit}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
