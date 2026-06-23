import { useState } from "react";
import { FiEdit2, FiTrash2, FiUserPlus } from "react-icons/fi";
import api from "../../services/api";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import styles from "../Employees.module.css";

const USER_ROLES = [
  { value: "employee", label: "Funcionário" },
  { value: "manager", label: "Gerente" },
  { value: "hr", label: "RH" },
  { value: "stock", label: "Estoque" },
  { value: "admin", label: "Administrador" },
];

const emptyEmployeeForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  hire_date: "",
  role_id: "",
  user_role: "employee",
  is_active: true,
};

export default function EmployeesTab({ employees, roles, onUpdate, setError, setSuccess, getErrorMessage }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyEmployeeForm);
  const [saving, setSaving] = useState(false);

  const getRoleLabel = (role) => {
    return USER_ROLES.find((item) => item.value === role)?.label || role || "-";
  };

  const getJobTitle = (roleId) => {
    return roles.find((role) => role.id === roleId)?.title || "-";
  };

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setForm(emptyEmployeeForm);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (modalMode === "edit") {
        await api.put(`/employees/${editingId}`, {
          name: form.name,
          phone: form.phone || null,
          hire_date: form.hire_date || null,
          role_id: form.role_id ? Number(form.role_id) : null,
          is_active: form.is_active,
        });
        setSuccess("Funcionário atualizado com sucesso.");
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
        setSuccess("Funcionário cadastrado com sucesso.");
      }

      setModalOpen(false);
      setForm(emptyEmployeeForm);
      await onUpdate();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (employee) => {
    const confirmed = window.confirm(`Remover funcionário "${employee.name}" e seu usuário associado? Esta ação é irreversível.`);
    if (!confirmed) return;

    setError("");
    setSuccess("");
    try {
      await api.delete(`/employees/${employee.id}`);
      setSuccess("Funcionário e usuário removidos com sucesso.");
      await onUpdate();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className={styles.fullGrid}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
        <Button icon={FiUserPlus} onClick={openCreate}>
          Novo Funcionário
        </Button>
      </div>

      <Card title="Funcionários Registrados" subtitle="Lista completa com dados de contato, admissão e perfis.">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil de Usuário</th>
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
                    {employee.phone && <small>Tel: {employee.phone}</small>}
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
                        onClick={() => handleDelete(employee)}
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
                    Nenhum funcionário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={modalMode === "edit" ? "Editar Funcionário" : "Cadastrar Funcionário"}
        subtitle={
          modalMode === "edit"
            ? "O e-mail e a senha do usuário não podem ser editados por aqui."
            : "Cadastra dados do funcionário e suas credenciais de login."
        }
        onClose={() => setModalOpen(false)}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Nome completo</span>
            <input
              type="text"
              value={form.name}
              onChange={updateField("name")}
              required
            />
          </label>

          {modalMode === "create" && (
            <>
              <label className={styles.field}>
                <span>E-mail Corporativo</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={updateField("email")}
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Senha de Acesso</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={updateField("password")}
                  required
                />
              </label>
            </>
          )}

          <div className={styles.twoColumns}>
            {modalMode === "create" && (
              <label className={styles.field}>
                <span>Perfil de Acesso</span>
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
              <span>Cargo (Função)</span>
              <select value={form.role_id} onChange={updateField("role_id")}>
                <option value="">Sem cargo organizacional</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </label>

            {modalMode === "edit" && (
              <label className={styles.field}>
                <span>Status Operacional</span>
                <select
                  value={form.is_active ? "ativo" : "inativo"}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      is_active: event.target.value === "ativo",
                    }))
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
              <input
                type="text"
                placeholder="(xx) xxxxx-xxxx"
                value={form.phone}
                onChange={updateField("phone")}
              />
            </label>

            <label className={styles.field}>
              <span>Data de Admissão</span>
              <input
                type="date"
                value={form.hire_date}
                onChange={updateField("hire_date")}
              />
            </label>
          </div>

          <div className={styles.formActions}>
            <Button icon={modalMode === "edit" ? FiEdit2 : FiUserPlus} type="submit" disabled={saving}>
              {saving ? "Salvando..." : modalMode === "edit" ? "Salvar" : "Cadastrar"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
