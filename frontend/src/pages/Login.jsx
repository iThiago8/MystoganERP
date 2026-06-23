import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";

import { useAuth } from "../auth/useAuth";
import Button from "../components/ui/Button";
import styles from "./Login.module.css";
import logoImg from "../assets/MystoganERPLogo.png";

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.brand}>
          <img src={logoImg} alt="Mystogan Logo" className={styles.brandMark} />
          <div>
            <span className={styles.brandName}>Mystogan ERP</span>
            <span className={styles.brandTag}>Acesso ao sistema</span>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>E-mail</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Senha</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <Button icon={FiLogIn} type="submit" disabled={loading}>
            Entrar
          </Button>
        </form>
      </section>
    </main>
  );
}
