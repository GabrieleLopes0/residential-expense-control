import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Pessoa } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const Dashboard = () => {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPessoas = async () => {
      try {
        const response = await api.get('/pessoa/totais'); // endpoint que dá totais por pessoa
        setPessoas(response.data);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchPessoas();
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <BarChart width={600} height={300} data={pessoas}>
        <XAxis dataKey="nome" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="totalReceitas" fill="#4caf50" />
        <Bar dataKey="totalDespesas" fill="#f44336" />
      </BarChart>
    </div>
  );
};

export default Dashboard;