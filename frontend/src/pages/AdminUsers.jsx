import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiRefreshCw,
  FiShield,
  FiTrash2,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";

import api from "../services/api";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import StatCard from "../components/ui/StatCard";
import styles from "./AdminUsers.module.css";

const USER_ROLES = [
  { value: "employee", label: "Funcionário" },
  { value: "manager", label: "Gerente" },
  { value: "hr", label: "RH" },
  { value: "stock", label: "Estoque" },
  { value: "admin", label: "Administrador" },
];

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  hire_date: "",
  role_id: "",
  user_role: "employee",
  is_active: true,
};

export default function AdminUsers() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isEdit = modalMode === "edit";

  const activeUsers = useMemo(
    () => employees.filter((employee) => employee.is_active).length,
    [employees]
  );

  const adminUsers = useMemo(
    () => employees.filter((employee) => employee.user?.role === "admin").length,
    [employees]
  );

  const getRoleLabel = useCallback((role) => {
    return USER_ROLES.find((item) => item.value === role)?.label || role || "-";
  }, []);

  const getJobTitle = useCallback(
    (roleId) => {
      return roles.find((role) => role.id === roleId)?.title || "-";
    },
    [roles]
  );

  const getErrorMessage = useCallback((err) => {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      return "Acesso restrito a administradores.";
    }

    return err?.response?.data?.detail || "Não foi possível concluir a operação.";
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [employeesResponse, rolesResponse] = await Promise.all([
        api.get("/employees/"),
        api.get("/roles/"),
      ]);

      setEmployees(employeesResponse.data);
      setRoles(rolesResponse.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
      setSuccess("");
    } finally {
      setLoading(false);
    }
  }, [getErrorMessage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadData]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const startEdit = (employee) => {
    setModalMode("edit");
    setEditingId(employee.id);
    setForm({
      name: employee.name || "",
      email: employee.user?.email || "",
      password: "",
      phone: employee.phone || "",
      hire_date: employee.hire_date ? String(employee.hire_date).slice(0, 10) : "",
      role_id: employee.role_id ? String(employee.role_id) : "",
      user_role: employee.user?.role || "employee",
      is_active: employee.is_active,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (isEdit) {
        await api.put(`/employees/${editingId}`, {
          name: form.name,
          phone: form.phone || null,
          hire_date: form.hire_date || null,
          role_id: form.role_id ? Number(form.role_id) : null,
          is_active: form.is_active,
        });
        setSuccess("Usuário atualizado.");
      } else {
        await api.post("/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || null,
          hire_date: form.hire_date || null,
          role_id: form.role_id ? Number(form.role_id) : null,
          user_role: form.user_role,
        });
        setSuccess("Usuário cadastrado.");
      }

      setError("");
      closeModal();
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
      setSuccess("");
    } finally {
      setSaving(false);
    }
  };

  const deleteEmployee = async (employee) => {
    const confirmed = window.confirm(`Remover o usuário "${employee.name}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    try {
      await api.delete(`/employees/${employee.id}`);
      setSuccess("Usuário removido.");
      setError("");
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
      setSuccess("");
    }
  };

  return (
    <div className={styles.admin}>
      <div className={styles.toolbar}>
        <p className={styles.helper}>
          Cadastro de usuários, permissões e vínculo com funcionários.
        </p>

        <div className={styles.actions}>
          <Button variant="ghost" icon={FiRefreshCw} onClick={loadData} disabled={loading}>
            Atualizar
          </Button>
          <Button icon={FiUserPlus} onClick={openCreate}>
            Novo usuário
          </Button>
        </div>
      </div>

      {(error || success) && (
        <div className={`${styles.notice} ${error ? styles.noticeError : styles.noticeSuccess}`}>
          {error || success}
        </div>
      )}

      <div className={styles.statsGrid}>
        <StatCard icon={FiUsers} label="Usuários" value={employees.length} />
        <StatCard icon={FiUserCheck} label="Ativos" value={activeUsers} />
        <StatCard icon={FiShield} label="Admins" value={adminUsers} tone="gold" />
        <StatCard icon={FiUserPlus} label="Cargos" value={roles.length} />
      </div>

      <Card title="Usuários cadastrados" subtitle="Funcionários com conta vinculada ao sistema.">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Cargo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <span className={styles.name}>{employee.name}</span>
                    {employee.phone && <small>{employee.phone}</small>}
                  </td>
                  <td>{employee.user?.email || "-"}</td>
                  <td>
                    <Badge tone={employee.user?.role === "admin" ? "gold" : "default"}>
                      {getRoleLabel(employee.user?.role)}
                    </Badge>
                  </td>
                  <td>{getJobTitle(employee.role_id)}</td>
                  <td>
                    <Badge tone={employee.is_active ? "success" : "danger"}>
                      {employee.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        title="Editar"
                        aria-label={`Editar ${employee.name}`}
                        onClick={() => startEdit(employee)}
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        title="Remover"
                        aria-label={`Remover ${employee.name}`}
                        onClick={() => deleteEmployee(employee)}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!employees.length && (
                <tr>
                  <td colSpan="6" className={styles.emptyCell}>
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={isEdit ? "Editar usuário" : "Registrar usuário"}
        subtitle={
          isEdit
            ? "E-mail e senha não são editáveis por aqui."
            : "Cria funcionário e acesso ao sistema."
        }
        onClose={closeModal}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Nome</span>
            <input type="text" value={form.name} onChange={updateField("name")} required />
          </label>

          {!isEdit && (
            <>
              <label className={styles.field}>
                <span>E-mail</span>
                <input type="email" value={form.email} onChange={updateField("email")} required />
              </label>

              <label className={styles.field}>
                <span>Senha</span>
                <input type="password" value={form.password} onChange={updateField("password")} required />
              </label>
            </>
          )}

          <div className={styles.twoColumns}>
            {!isEdit && (
              <label className={styles.field}>
                <span>Perfil</span>
                <select value={form.user_role} onChange={updateField("user_role")}>
                  {USER_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className={styles.field}>
              <span>Cargo</span>
              <select value={form.role_id} onChange={updateField("role_id")}>
                <option value="">Sem cargo</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </label>

            {isEdit && (
              <label className={styles.field}>
                <span>Status</span>
                <select
                  value={form.is_active ? "ativo" : "inativo"}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, is_active: event.target.value === "ativo" }))
                  }
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </label>
            )}
          </div>

          <div className={styles.twoColumns}>
            <label className={styles.field}>
              <span>Telefone</span>
              <input type="text" value={form.phone} onChange={updateField("phone")} />
            </label>

            <label className={styles.field}>
              <span>Admissão</span>
              <input type="date" value={form.hire_date} onChange={updateField("hire_date")} />
            </label>
          </div>

          <div className={styles.formActions}>
            <Button icon={isEdit ? FiEdit2 : FiUserPlus} type="submit" disabled={saving}>
              {saving ? "Salvando..." : isEdit ? "Salvar" : "Cadastrar"}
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
