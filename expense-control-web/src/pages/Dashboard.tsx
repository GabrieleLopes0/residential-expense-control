import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../services/api";
import type { Pessoa } from "../types";

export const Dashboard: React.FC = () => {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPessoas = async () => {
      try {
        const response = await api.get("/pessoa/totais");
        setPessoas(response.data);
      } catch (error) {
        alert("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    fetchPessoas();
  }, []);

  if (loading) return <p className="p-4">Carregando...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Minha Casa</h1>

      {/* Gráfico */}
      <div className="mb-8">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pessoas}>
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalReceitas" fill="#4ade80" />
            <Bar dataKey="totalDespesas" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Pessoas" link="/pessoas" />
        <Card title="Transações" link="/transacoes" />
        <Card title="Categorias" link="/categorias" />
      </div>
    </div>
  );
};

// Card simples
interface CardProps {
  title: string;
  link: string;
}

const Card: React.FC<CardProps> = ({ title, link }) => {
  return (
    <a href={link} className="block p-4 bg-white rounded shadow hover:shadow-md transition text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
    </a>
  );
};