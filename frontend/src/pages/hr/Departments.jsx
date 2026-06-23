import { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import styles from "../Employees.module.css";

const emptyDepartmentForm = {
  name: "",
  description: "",
};

export default function DepartmentsTab({ departments, onUpdate, setError, setSuccess, getErrorMessage }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyDepartmentForm);
  const [saving, setSaving] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setForm(emptyDepartmentForm);
    setModalOpen(true);
  };

  const startEdit = (dept) => {
    setModalMode("edit");
    setEditingId(dept.id);
    setForm({
      name: dept.name || "",
      description: dept.description || "",
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
        name: form.name,
        description: form.description || null,
      };

      if (modalMode === "edit") {
        await api.put(`/departments/${editingId}`, payload);
        setSuccess("Departamento atualizado com sucesso.");
      } else {
        await api.post("/departments/", payload);
        setSuccess("Departamento criado com sucesso.");
      }

      setModalOpen(false);
      setForm(emptyDepartmentForm);
      await onUpdate();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept) => {
    const confirmed = window.confirm(`Remover departamento "${dept.name}"?`);
    if (!confirmed) return;

    setError("");
    setSuccess("");
    try {
      await api.delete(`/departments/${dept.id}`);
      setSuccess("Departamento removido com sucesso.");
      await onUpdate();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className={styles.fullGrid}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
        <Button icon={FiPlus} onClick={openCreate}>
          Novo Departamento
        </Button>
      </div>

      <Card title="Departamentos Organizacionais" subtitle="Os principais setores e divisões da empresa.">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id}>
                  <td>
                    <span className={styles.name}>{dept.name}</span>
                  </td>
                  <td>{dept.description || "-"}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        title="Editar"
                        aria-label={`Editar ${dept.name}`}
                        onClick={() => startEdit(dept)}
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        title="Remover"
                        aria-label={`Remover ${dept.name}`}
                        onClick={() => handleDelete(dept)}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!departments.length && (
                <tr>
                  <td colSpan="3" className={styles.emptyCell}>
                    Nenhum departamento cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={modalMode === "edit" ? "Editar Departamento" : "Novo Departamento"}
        subtitle="Cadastre o nome do novo setor e uma descrição sobre suas atribuições."
        onClose={() => setModalOpen(false)}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Nome do Departamento</span>
            <input
              type="text"
              value={form.name}
              onChange={updateField("name")}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Descrição</span>
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
