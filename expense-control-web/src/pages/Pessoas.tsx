import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // <<< IMPORT
import { api } from "../services/api";
import type { Pessoa } from "../types";
import { Table } from "../components/Table/Table";
import { Button } from "../components/Button/Button";
import { Input } from "../components/Input/Input";
import { Modal } from "../components/Modal/Modal";

export const Pessoas: React.FC = () => {
  const navigate = useNavigate(); // <<< HOOK
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [editingPessoa, setEditingPessoa] = useState<Pessoa | null>(null);

  // Fetch pessoas
  const fetchPessoas = async () => {
    try {
      setLoading(true);
      const response = await api.get<Pessoa[]>("/pessoa");
      setPessoas(response.data);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar pessoas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPessoas();
  }, []);

  // Criar ou editar pessoa
  const handleSave = async () => {
    try {
      if (editingPessoa) {
        await api.put(`/pessoa/${editingPessoa.id}`, { nome });
      } else {
        await api.post("/pessoa", { nome });
      }
      setIsModalOpen(false);
      setNome("");
      setEditingPessoa(null);
      fetchPessoas();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar pessoa");
    }
  };

  // Editar
  const handleEdit = (p: Pessoa) => {
    setEditingPessoa(p);
    setNome(p.nome);
    setIsModalOpen(true);
  };

  // Deletar
  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente deletar?")) return;
    try {
      await api.delete(`/pessoa/${id}`);
      fetchPessoas();
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar pessoa");
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      {/* ← Voltar */}
      <button onClick={() => navigate("/")} className="mb-4 text-blue-500 hover:underline">
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold mb-4">Pessoas</h1>
      <Button onClick={() => setIsModalOpen(true)}>Adicionar Pessoa</Button>

      <Table
        columns={["ID", "Nome", "Ações"]}
        data={pessoas}
        renderRow={(pessoa) => (
          <tr key={pessoa.id}>
            <td className="border px-4 py-2">{pessoa.id}</td>
            <td className="border px-4 py-2">{pessoa.nome}</td>
            <td className="border px-4 py-2">
              <Button onClick={() => handleEdit(pessoa)} className="mr-2">Editar</Button>
              <Button onClick={() => handleDelete(pessoa.id)} className="bg-red-500 hover:bg-red-600">Deletar</Button>
            </td>
          </tr>
        )}
      />

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingPessoa(null); setNome(""); }} title={editingPessoa ? "Editar Pessoa" : "Nova Pessoa"}>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" />
        <div className="mt-4 text-right">
          <Button onClick={handleSave}>{editingPessoa ? "Salvar" : "Adicionar"}</Button>
        </div>
      </Modal>
    </div>
  );
};