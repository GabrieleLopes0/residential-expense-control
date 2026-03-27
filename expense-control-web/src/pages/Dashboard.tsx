// Página principal - Dashboard
// Página principal - Dashboard com gráfico e saldo
import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { api } from "../services/api";
import type { Transacao, Pessoa } from "../types";

interface ChartPoint {
  index: number;
  descricao: string;
  pessoa: string;
  tipo: number;
  receita: number | null;
  despesa: number | null;
}

// Monta dados do gráfico
function buildChartData(transacoes: Transacao[], pessoasMap: Map<number, string>): ChartPoint[] {
  if (transacoes.length === 0) return [];

  const points: ChartPoint[] = transacoes.map((t, i) => ({
    index: i + 1,
    descricao: t.descricao,
    pessoa: pessoasMap.get(t.pessoaId) ?? "—",
    tipo: t.tipo,
    receita: t.tipo === 0 ? t.valor : null,
    despesa: t.tipo === 1 ? t.valor : null,
  }));

  const n = points.length;
  const lastIdx = n - 1;

  let lastRec: number | null = null;
  let lastDesp: number | null = null;
  for (const p of points) {
    if (p.receita !== null) lastRec = p.receita;
    if (p.despesa !== null) lastDesp = p.despesa;
  }

  if (points[0].receita === null) points[0].receita = 0;
  if (points[0].despesa === null) points[0].despesa = 0;

  if (points[lastIdx].receita === null) points[lastIdx].receita = lastRec ?? 0;
  if (points[lastIdx].despesa === null) points[lastIdx].despesa = lastDesp ?? 0;

  return points;
}

// Formata valor em BRL
const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Tooltip personalizado do gráfico
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload as ChartPoint;
  const isReceita = data.tipo === 0;
  const valor = isReceita ? data.receita! : data.despesa!;
  const tipo = isReceita ? "Receita" : "Despesa";
  const cor = isReceita ? "#10b981" : "#ef4444";

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-desc">{data.descricao}</p>
      <p className="chart-tooltip-pessoa">{data.pessoa}</p>
      <p style={{ color: cor, fontWeight: 700 }}>{tipo}: {fmt(valor)}</p>
    </div>
  );
};

// Renderiza dots apenas para o tipo correspondente
// Renderiza dot apenas no tipo correspondente (receita ou despesa)
const renderDot = (color: string, tipoAlvo: number) => (props: Record<string, unknown>) => {
  const { cx, cy, payload } = props as { cx: number; cy: number; payload: ChartPoint };
  if (payload.tipo !== tipoAlvo) return <g key={`e-${cx}-${tipoAlvo}`} />;
  return <circle key={`d-${cx}-${tipoAlvo}`} cx={cx} cy={cy} r={4} fill={color} strokeWidth={0} />;
};

const renderActiveDot = (color: string, tipoAlvo: number) => (props: Record<string, unknown>) => {
  const { cx, cy, payload } = props as { cx: number; cy: number; payload: ChartPoint };
  if (payload.tipo !== tipoAlvo) return <g key={`ea-${cx}-${tipoAlvo}`} />;
  return <circle key={`ad-${cx}-${tipoAlvo}`} cx={cx} cy={cy} r={6} fill={color} stroke="#fff" strokeWidth={2} />;
};

export const Dashboard: React.FC = () => {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [saldoFinal, setSaldoFinal] = useState(0);
  const [counts, setCounts] = useState({
    pessoas: 0,
    transacoes: 0,
    categorias: 0,
  });
  const [loading, setLoading] = useState(true);

  // Carrega dados do dashboard
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transRes, pessoasRes] = await Promise.all([
          api.get<Transacao[]>("/transacao"),
          api.get<Pessoa[]>("/pessoa"),
        ]);

        const pessoasMap = new Map<number, string>();
        pessoasRes.data.forEach((p) => pessoasMap.set(p.id, p.nome));

        setChartData(buildChartData(transRes.data, pessoasMap));

        // Calcula saldo final (receitas - despesas)
        let saldo = 0;
        transRes.data.forEach((t) => {
          saldo += t.tipo === 0 ? t.valor : -t.valor;
        });
        setSaldoFinal(saldo);

        const [pessoasCount, transacoesCount, categoriasCount] = await Promise.all([
          api.get("/pessoa/count").then((res) => res.data),
          api.get("/transacao/count").then((res) => res.data),
          api.get("/categoria/count").then((res) => res.data),
        ]);

        setCounts({
          pessoas: pessoasCount,
          transacoes: transacoesCount,
          categorias: categoriasCount,
        });
      } catch {
        alert("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="p-4">Carregando...</p>;

  // Verifica se saldo é positivo
  const saldoPositivo = saldoFinal >= 0;

  return (
    <div className="dashboard-container">
      <h1>Minha Casa</h1>

      {/* Gráfico de receitas e despesas */}
      <div className="chart-container">
        <div className="chart-legend">
          <span className="chart-legend-item">
            <span className="chart-legend-dot" style={{ background: "#10b981" }} />
            Receitas
          </span>
          <span className="chart-legend-item">
            <span className="chart-legend-dot" style={{ background: "#ef4444" }} />
            Despesas
          </span>
        </div>

        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="index" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v: number) =>
                    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
                  }
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#gradReceita)"
                  connectNulls
                  dot={renderDot("#10b981", 0)}
                  activeDot={renderActiveDot("#10b981", 0)}
                />
                <Area
                  type="monotone"
                  dataKey="despesa"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fill="url(#gradDespesa)"
                  connectNulls
                  dot={renderDot("#ef4444", 1)}
                  activeDot={renderActiveDot("#ef4444", 1)}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="saldo-final" style={{ borderColor: saldoPositivo ? "#a7f3d0" : "#fecaca", background: saldoPositivo ? "#ecfdf5" : "#fef2f2" }}>
              <span className="saldo-final-label">Saldo Final:</span>
              <span className="saldo-final-valor" style={{ color: saldoPositivo ? "#059669" : "#dc2626" }}>
                {fmt(saldoFinal)} — {saldoPositivo ? "Positivo" : "Negativo"}
              </span>
            </div>
          </>
        ) : (
          <p className="text-center p-4" style={{ color: "var(--gray-600)" }}>
            Nenhuma transação cadastrada ainda.
          </p>
        )}
      </div>

      {/* Cards de contagem */}
      <div className="cards-container">
        <Card title="Pessoas" count={counts.pessoas} link="/pessoas" />
        <Card title="Transações" count={counts.transacoes} link="/transacoes" />
        <Card title="Categorias" count={counts.categorias} link="/categorias" />
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  count: number;
  link: string;
}

// Componente de card do dashboard
const Card: React.FC<CardProps> = ({ title, count, link }) => {
  return (
    <a href={link} className="card">
      <span className="card-number">{count}</span>
      <span className="card-title">{title}</span>
    </a>
  );
};