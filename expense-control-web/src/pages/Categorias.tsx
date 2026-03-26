import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // <<< Import
import { api } from "../services/api";
import type { Categoria } from "../types";
import { Table } from "../components/Table/Table";
import { Button } from "../components/Button/Button";
import { Input } from "../components/Input/Input";
import { Modal } from "../components/Modal/Modal";

export const Categorias: React.FC = () => {
  const navigate = useNavigate(); // <<< Hook
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await api.get<Categoria[]>("/categoria");
      setCategorias(response.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleSave = async () => {
    try {
      if (editingCategoria) {
        await api.put(`/categoria/${editingCategoria.id}`, { descricao, finalidade: editingCategoria.finalidade });
      } else {
        await api.post("/categoria", { descricao, finalidade: 0 });
      }
      setIsModalOpen(false);
      setDescricao("");
      setEditingCategoria(null);
      fetchCategorias();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar categoria");
    }
  };

  const handleEdit = (c: Categoria) => {
    setEditingCategoria(c);
    setDescricao(c.descricao);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente deletar?")) return;
    try {
      await api.delete(`/categoria/${id}`);
      fetchCategorias();
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar categoria");
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="p-4">
      {/* ← Voltar */}
      <button onClick={() => navigate("/")} className="mb-4 text-blue-500 hover:underline">
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold mb-4">Categorias</h1>
      <Button onClick={() => setIsModalOpen(true)}>Adicionar Categoria</Button>

      <Table
        columns={["ID", "Descrição", "Ações"]}
        data={categorias}
        renderRow={(categoria) => (
          <tr key={categoria.id}>
            <td className="border px-4 py-2">{categoria.id}</td>
            <td className="border px-4 py-2">{categoria.descricao}</td>
            <td className="border px-4 py-2">
              <Button onClick={() => handleEdit(categoria)} className="mr-2">Editar</Button>
              <Button onClick={() => handleDelete(categoria.id)} className="bg-red-500 hover:bg-red-600">Deletar</Button>
            </td>
          </tr>
        )}
      />

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingCategoria(null); setDescricao(""); }} title={editingCategoria ? "Editar Categoria" : "Nova Categoria"}>
        <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição" />
        <div className="mt-4 text-right">
          <Button onClick={handleSave}>{editingCategoria ? "Salvar" : "Adicionar"}</Button>
        </div>
      </Modal>
    </div>
  );
};