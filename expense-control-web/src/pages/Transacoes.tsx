import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // <<< Import
import { api } from "../services/api";
import type { Transacao, Pessoa, Categoria } from "../types";
import { Table } from "../components/Table/Table";
import { Button } from "../components/Button/Button";
import { Input } from "../components/Input/Input";
import { Modal } from "../components/Modal/Modal";

export const Transacoes: React.FC = () => {
  const navigate = useNavigate(); // <<< Hook para voltar
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState(0);
  const [tipo, setTipo] = useState(1); // 1=Receita, 2=Despesa
  const [pessoaId, setPessoaId] = useState<number | null>(null);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);

  const fetchTransacoes = async () => {
    try {
      setLoading(true);
      const [resTrans, resPessoas, resCats] = await Promise.all([
        api.get<Transacao[]>("/transacao"),
        api.get<Pessoa[]>("/pessoa"),
        api.get<Categoria[]>("/categoria")
      ]);
      setTransacoes(resTrans.data);
      setPessoas(resPessoas.data);
      setCategorias(resCats.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransacoes();
  }, []);

  const handleSave = async () => {
    if (!pessoaId || !categoriaId) return alert("Selecione pessoa e categoria");
    const payload = { descricao, valor, tipo, pessoaId, categoriaId };
    try {
      if (editingTransacao) {
        await api.put(`/transacao/${editingTransacao.id}`, payload);
      } else {
        await api.post("/transacao", payload);
      }
      setIsModalOpen(false);
      setDescricao("");
      setValor(0);
      setTipo(1);
      setPessoaId(null);
      setCategoriaId(null);
      setEditingTransacao(null);
      fetchTransacoes();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar transação");
    }
  };

  const handleEdit = (t: Transacao) => {
    setEditingTransacao(t);
    setDescricao(t.descricao);
    setValor(t.valor);
    setTipo(t.tipo);
    setPessoaId(t.pessoaId);
    setCategoriaId(t.categoriaId);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente deletar?")) return;
    try {
      await api.delete(`/transacao/${id}`);
      fetchTransacoes();
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar transação");
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="p-4">
      {/* ← Voltar */}
      <button onClick={() => navigate("/")} className="mb-4 text-blue-500 hover:underline">
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold mb-4">Transações</h1>
      <Button onClick={() => setIsModalOpen(true)}>Nova Transação</Button>

      <Table
        columns={["ID", "Descrição", "Valor", "Tipo", "Pessoa", "Categoria", "Ações"]}
        data={transacoes}
        renderRow={(t) => (
          <tr key={t.id}>
            <td className="border px-4 py-2">{t.id}</td>
            <td className="border px-4 py-2">{t.descricao}</td>
            <td className="border px-4 py-2">{t.valor}</td>
            <td className="border px-4 py-2">{t.tipo === 1 ? "Receita" : "Despesa"}</td>
            <td className="border px-4 py-2">{pessoas.find(p => p.id === t.pessoaId)?.nome}</td>
            <td className="border px-4 py-2">{categorias.find(c => c.id === t.categoriaId)?.descricao}</td>
            <td className="border px-4 py-2">
              <Button onClick={() => handleEdit(t)} className="mr-2">Editar</Button>
              <Button onClick={() => handleDelete(t.id)} className="bg-red-500 hover:bg-red-600">Deletar</Button>
            </td>
          </tr>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransacao(null);
          setDescricao("");
          setValor(0);
          setTipo(1);
          setPessoaId(null);
          setCategoriaId(null);
        }}
        title={editingTransacao ? "Editar Transação" : "Nova Transação"}
      >
        <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição" />
        <Input type="number" value={valor.toString()} onChange={(e) => setValor(Number(e.target.value))} placeholder="Valor" />
        <select value={tipo} onChange={(e) => setTipo(Number(e.target.value))} className="border p-2 rounded mt-2 w-full">
          <option value={1}>Receita</option>
          <option value={2}>Despesa</option>
        </select>
        <select value={pessoaId || ""} onChange={(e) => setPessoaId(Number(e.target.value))} className="border p-2 rounded mt-2 w-full">
          <option value="">Selecione Pessoa</option>
          {pessoas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
        <select value={categoriaId || ""} onChange={(e) => setCategoriaId(Number(e.target.value))} className="border p-2 rounded mt-2 w-full">
          <option value="">Selecione Categoria</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.descricao}</option>)}
        </select>

        <div className="mt-4 text-right">
          <Button onClick={handleSave}>{editingTransacao ? "Salvar" : "Adicionar"}</Button>
        </div>
      </Modal>
    </div>
  );
};