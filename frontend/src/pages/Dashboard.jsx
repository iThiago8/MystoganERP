import {
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiBox,
  FiDownload
} from "react-icons/fi";

import { useEffect, useState } from "react";
import api from "../services/api";

import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

import styles from "./Dashboard.module.css";

const CHART = [40, 65, 50, 80, 55, 90, 70];

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api
      .get("/transactions/")
      .then((response) => {
        setTransactions(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const receitas = transactions
    .filter((t) => t.transaction_type === "INCOME")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const despesas = transactions
    .filter((t) => t.transaction_type === "EXPENSE")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const saldo = receitas - despesas;

  const stats = [
    {
      icon: FiDollarSign,
      label: "Receitas",
      value: `R$ ${receitas.toFixed(2)}`,
      tone: "gold",
    },
    {
      icon: FiTrendingUp,
      label: "Despesas",
      value: `R$ ${despesas.toFixed(2)}`,
    },
    {
      icon: FiUsers,
      label: "Saldo",
      value: `R$ ${saldo.toFixed(2)}`,
    },
    {
      icon: FiBox,
      label: "Transações",
      value: transactions.length,
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.toolbar}>
        <p className={styles.welcome}>
          Bem-vindo de volta — aqui está um resumo geral da operação.
        </p>

        <div className={styles.actions}>
          <Button variant="ghost" icon={FiDownload}>
            Exportar
          </Button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className={styles.grid}>
        <Card
          title="Visão geral"
          subtitle="Últimos 7 dias"
          className={styles.chartCard}
        >
          <div className={styles.chart}>
            {CHART.map((v, i) => (
              <div key={i} className={styles.barWrap}>
                <div
                  className={styles.bar}
                  style={{ height: `${v}%` }}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Atividade recente"
          subtitle="Últimas movimentações financeiras"
        >
          <ul className={styles.activityList}>
            {transactions.slice(0, 5).map((transaction) => (
              <li
                key={transaction.id}
                className={styles.activityItem}
              >
                <Badge tone="gold">•</Badge>

                <span className={styles.activityLabel}>
                  {transaction.description}
                </span>

                <span className={styles.activityTime}>
                  {transaction.transaction_date}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
