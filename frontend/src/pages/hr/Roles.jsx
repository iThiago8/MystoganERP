import { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import styles from "../Employees.module.css";

const emptyRoleForm = {
  title: "",
  description: "",
  department_id: "",
};

export default function RolesTab({ roles, departments, onUpdate, setError, setSuccess, getErrorMessage }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyRoleForm);
  const [saving, setSaving] = useState(false);

  const getDepartmentName = (deptId) => {
    return departments.find((dept) => dept.id === deptId)?.name || "-";
  };

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setForm(emptyRoleForm);
    setModalOpen(true);
  };

  const startEdit = (role) => {
    setModalMode("edit");
    setEditingId(role.id);
    setForm({
      title: role.title || "",
      description: role.description || "",
      department_id: role.department_id ? String(role.department_id) : "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        department_id: Number(form.department_id),
      };

      if (modalMode === "edit") {
        await api.put(`/roles/${editingId}`, payload);
        setSuccess("Cargo atualizado com sucesso.");
      } else {
        await api.post("/roles/", payload);
        setSuccess("Cargo criado com sucesso.");
      }

      setModalOpen(false);
      setForm(emptyRoleForm);
      await onUpdate();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    const confirmed = window.confirm(`Remover cargo "${role.title}"?`);
    if (!confirmed) return;

    setError("");
    setSuccess("");
    try {
      await api.delete(`/roles/${role.id}`);
      setSuccess("Cargo removido com sucesso.");
      await onUpdate();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className={styles.fullGrid}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
        <Button icon={FiPlus} onClick={openCreate}>
          Novo Cargo
        </Button>
      </div>

      <Card title="Cargos Existentes" subtitle="Cargos e funções distribuídos entre os departamentos.">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cargo / Título</th>
                <th>Descrição</th>
                <th>Departamento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>
                    <span className={styles.name}>{role.title}</span>
                  </td>
                  <td>{role.description || "-"}</td>
                  <td>{getDepartmentName(role.department_id)}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        title="Editar"
                        aria-label={`Editar ${role.title}`}
                        onClick={() => startEdit(role)}
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        title="Remover"
                        aria-label={`Remover ${role.title}`}
                        onClick={() => handleDelete(role)}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!roles.length && (
                <tr>
                  <td colSpan="4" className={styles.emptyCell}>
                    Nenhum cargo cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={modalMode === "edit" ? "Editar Cargo" : "Novo Cargo"}
        subtitle="Defina o título, descrição e departamento associados ao cargo."
        onClose={() => setModalOpen(false)}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Título do Cargo</span>
            <input
              type="text"
              value={form.title}
              onChange={updateField("title")}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Departamento</span>
            <select
              value={form.department_id}
              onChange={updateField("department_id")}
              required
            >
              <option value="">Selecione um departamento</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Descrição / Atividades</span>
            <textarea
              value={form.description}
              onChange={updateField("description")}
              rows={3}
            />
          </label>

          <div className={styles.formActions}>
            <Button icon={modalMode === "edit" ? FiEdit2 : FiPlus} type="submit" disabled={saving}>
              {saving ? "Salvando..." : modalMode === "edit" ? "Salvar" : "Criar"}
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
