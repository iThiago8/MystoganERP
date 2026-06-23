import {
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiBox,
  FiDownload,
  FiPackage,
  FiAlertTriangle,
  FiTruck
} from "react-icons/fi";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../services/api";
import { useAuth } from "../auth/useAuth";

import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { hasAnyRole } = useAuth();
  const canViewStock = hasAnyRole(["admin", "stock"]);

  const [transactions, setTransactions] = useState([]);
  const [productsCount, setProductsCount] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(null);
  const [pendingDeliveriesCount, setPendingDeliveriesCount] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);

  useEffect(() => {
    api
      .get("/transactions/")
      .then((response) => {
        setTransactions(response.data);
      })
      .catch((error) => {
        console.error(error);
      });

    if (canViewStock) {
      setLoadingStock(true);
      Promise.all([
        api.get("/products/"),
        api.get("/products/low-stock"),
        api.get("/deliveries/"),
      ])
        .then(([productsRes, lowStockRes, deliveriesRes]) => {
          const activeProducts = productsRes.data.filter((p) => p.is_active);
          setProductsCount(activeProducts.length);
          setLowStockCount(lowStockRes.data.length);
          
          const pendingDeliveries = deliveriesRes.data.filter((d) => d.status === "PENDENTE");
          setPendingDeliveriesCount(pendingDeliveries.length);
        })
        .catch((error) => {
          console.error("Erro ao carregar dados do estoque no Dashboard:", error);
        })
        .finally(() => {
          setLoadingStock(false);
        });
    }
  }, [canViewStock]);

  const receitas = transactions
    .filter((t) => t.transaction_type === "INCOME")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const despesas = transactions
    .filter((t) => t.transaction_type === "EXPENSE")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const saldo = receitas - despesas;

  // Gera os últimos 7 dias no formato "YYYY-MM-DD"
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  // Labels "DD/MM" para exibir abaixo de cada barra
  const chartLabels = last7Days.map((dia) => {
    const [, month, day] = dia.split("-");
    return `${day}/${month}`;
  });

  // Soma o amount de cada dia (suporta datas com ou sem horário)
  const totaisPorDia = last7Days.map((dia) =>
    transactions
      .filter((t) => t.transaction_date.startsWith(dia))
      .reduce((acc, t) => acc + Number(t.amount), 0)
  );

  // Normaliza para escala 0–100% para o gráfico de barras
  const max = Math.max(...totaisPorDia, 1);
  const chartData = totaisPorDia.map((v) => Math.round((v / max) * 100));

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

  function handleExport() {
    const doc = new jsPDF();
    const geradoEm = new Date().toLocaleString("pt-BR");

    // ── Cabeçalho ──────────────────────────────────────────────────────
    doc.setFillColor(31, 78, 121);
    doc.rect(0, 0, 210, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Mystogan ERP", 14, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Relatório de Movimentações Financeiras", 14, 20);

    doc.setFontSize(9);
    doc.text(`Gerado em: ${geradoEm}`, 196, 20, { align: "right" });

    // ── Resumo financeiro ──────────────────────────────────────────────
    doc.setTextColor(31, 78, 121);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Resumo", 14, 38);

    doc.setDrawColor(46, 117, 182);
    doc.setLineWidth(0.5);
    doc.line(14, 40, 196, 40);

    autoTable(doc, {
      startY: 44,
      theme: "plain",
      styles: { font: "helvetica", fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold", textColor: [80, 80, 80], cellWidth: 50 },
        1: { textColor: [30, 30, 30] },
      },
      body: [
        ["Total de Receitas", `R$ ${receitas.toFixed(2)}`],
        ["Total de Despesas", `R$ ${despesas.toFixed(2)}`],
        ["Saldo", `R$ ${saldo.toFixed(2)}`],
        ["Total de Transações", String(transactions.length)],
      ],
    });

    // ── Tabela de transações ───────────────────────────────────────────
    const afterSummary = doc.lastAutoTable.finalY + 10;

    doc.setTextColor(31, 78, 121);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Movimentações", 14, afterSummary);

    doc.setDrawColor(46, 117, 182);
    doc.line(14, afterSummary + 2, 196, afterSummary + 2);

    const rows = transactions.map((t) => [
      t.transaction_date?.split("T")[0] ?? "-",
      t.description ?? "-",
      t.category ?? "-",
      t.transaction_type === "INCOME" ? "Receita" : "Despesa",
      `R$ ${Number(t.amount).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: afterSummary + 6,
      head: [["Data", "Descrição", "Categoria", "Tipo", "Valor"]],
      body: rows,
      styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [46, 117, 182],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [240, 246, 252] },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 65 },
        2: { cellWidth: 35 },
        3: { cellWidth: 28 },
        4: { cellWidth: 30, halign: "right" },
      },
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 3) {
          data.cell.styles.textColor =
            data.cell.raw === "Receita" ? [22, 120, 60] : [180, 40, 40];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    // ── Rodapé ─────────────────────────────────────────────────────────
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Mystogan ERP  •  Página ${i} de ${pageCount}`,
        105,
        290,
        { align: "center" }
      );
    }

    doc.save(`relatorio_movimentacoes_${new Date().toISOString().split("T")[0]}.pdf`);
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.toolbar}>
        <p className={styles.welcome}>
          Bem-vindo de volta — aqui está um resumo geral da operação.
        </p>

        <div className={styles.actions}>
          <Button variant="ghost" icon={FiDownload} onClick={handleExport}>
            Exportar
          </Button>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Resumo Financeiro</h2>
      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {canViewStock && (
        <>
          <h2 className={styles.sectionTitle}>Estoque & Logística</h2>
          <div className={styles.statsGrid}>
            <StatCard
              icon={FiPackage}
              label="Produtos Ativos"
              value={loadingStock ? "..." : productsCount ?? 0}
            />
            <StatCard
              icon={FiAlertTriangle}
              label="Alerta Estoque Baixo"
              value={loadingStock ? "..." : lowStockCount ?? 0}
              tone={lowStockCount > 0 ? "gold" : "default"}
            />
            <StatCard
              icon={FiTruck}
              label="Entregas Pendentes"
              value={loadingStock ? "..." : pendingDeliveriesCount ?? 0}
              tone={pendingDeliveriesCount > 0 ? "gold" : "default"}
            />
          </div>
        </>
      )}

      <div className={styles.grid}>
        <Card
          title="Visão geral"
          subtitle="Últimos 7 dias"
          className={styles.chartCard}
        >
          <div className={styles.chart}>
            {chartData.map((v, i) => (
              <div key={i} className={styles.barWrap}>
                <div
                  className={styles.bar}
                  style={{ height: `${v}%` }}
                />
                <span className={styles.barLabel}>{chartLabels[i]}</span>
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
