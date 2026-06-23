import { useCallback, useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiUsers, FiUserCheck, FiBriefcase, FiFolder } from "react-icons/fi";
import api from "../../services/api";
import StatCard from "../../components/ui/StatCard";
import EmployeesTab from "./Employees";
import RolesTab from "./Roles";
import DepartmentsTab from "./Departments";
import styles from "../Employees.module.css";

export default function GestaoRH() {
  const [activeTab, setActiveTab] = useState("employees"); // 'employees' | 'roles' | 'departments'

  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeEmployeesCount = useMemo(
    () => employees.filter((e) => e.is_active).length,
    [employees]
  );

  const getErrorMessage = useCallback((err) => {
    return err?.response?.data?.detail || "Não foi possível concluir a operação.";
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const [employeesRes, rolesRes, departmentsRes] = await Promise.all([
        api.get("/employees/"),
        api.get("/roles/"),
        api.get("/departments/"),
      ]);

      setEmployees(employeesRes.data);
      setRoles(rolesRes.data);
      setDepartments(departmentsRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [getErrorMessage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className={styles.employees}>
      <div className={styles.toolbar}>
        <p className={styles.helper}>
          Gerencie funcionários, cargos organizacionais e departamentos da empresa.
        </p>

        <div className={styles.actions}>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "var(--bg-surface-raised)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              font: "inherit",
              fontSize: "13px",
              fontWeight: 600,
              transition: "all var(--transition-base)"
            }}
            onClick={loadData}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "spin" : ""} />
            Atualizar dados
          </button>
        </div>
      </div>

      {(error || success) && (
        <div className={`${styles.notice} ${error ? styles.noticeError : styles.noticeSuccess}`}>
          {error || success}
        </div>
      )}

      <div className={styles.statsGrid}>
        <StatCard icon={FiUsers} label="Total Funcionários" value={employees.length} />
        <StatCard icon={FiUserCheck} label="Funcionários Ativos" value={activeEmployeesCount} />
        <StatCard icon={FiBriefcase} label="Cargos Cadastrados" value={roles.length} tone="gold" />
        <StatCard icon={FiFolder} label="Departamentos" value={departments.length} tone="gold" />
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === "employees" ? styles.tabButtonActive : ""}`}
          onClick={() => {
            setActiveTab("employees");
            setError("");
            setSuccess("");
          }}
        >
          Funcionários
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "roles" ? styles.tabButtonActive : ""}`}
          onClick={() => {
            setActiveTab("roles");
            setError("");
            setSuccess("");
          }}
        >
          Cargos
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "departments" ? styles.tabButtonActive : ""}`}
          onClick={() => {
            setActiveTab("departments");
            setError("");
            setSuccess("");
          }}
        >
          Departamentos
        </button>
      </div>

      {activeTab === "employees" && (
        <EmployeesTab
          employees={employees}
          roles={roles}
          onUpdate={loadData}
          setError={setError}
          setSuccess={setSuccess}
          getErrorMessage={getErrorMessage}
        />
      )}

      {activeTab === "roles" && (
        <RolesTab
          roles={roles}
          departments={departments}
          onUpdate={loadData}
          setError={setError}
          setSuccess={setSuccess}
          getErrorMessage={getErrorMessage}
        />
      )}

      {activeTab === "departments" && (
        <DepartmentsTab
          departments={departments}
          onUpdate={loadData}
          setError={setError}
          setSuccess={setSuccess}
          getErrorMessage={getErrorMessage}
        />
      )}
    </div>
  );
}
