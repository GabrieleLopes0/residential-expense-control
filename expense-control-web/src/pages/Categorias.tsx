// Página de gerenciamento de categorias
// Página de gerenciamento de categorias
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { Categoria, Finalidade } from "../types";
import { Input } from "../components/Input/Input";

type SortOption = "desc-asc" | "desc-desc" | "finalidade-asc" | "finalidade-desc";
type ActiveTab = "categoria" | "totals";

interface CategoriaTotais {
  categoria: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

interface CategoriaComTotais extends Categoria {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

export const Categorias: React.FC = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [totais, setTotais] = useState<CategoriaTotais[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [finalidade, setFinalidade] = useState<Finalidade>(0);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("categoria");
  const [sortOption, setSortOption] = useState<SortOption>("desc-asc");

  // Busca categorias da API
  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await api.get<Categoria[]>("/categoria");
      setCategorias(response.data);
    } catch {
      setError("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  const fetchTotais = async () => {
    try {
      const response = await api.get<CategoriaTotais[]>("/categoria/totais");
      setTotais(response.data);
    } catch {
      console.error("Erro ao carregar totais das categorias");
      setTotais([]);
    }
  };

  useEffect(() => {
    fetchCategorias();
    fetchTotais();
  }, []);

  const getFinalidadeText = (finalidade: Finalidade) => {
    switch (finalidade) {
      case 0: return "Receita";
      case 1: return "Despesa";
      case 2: return "Ambas";
      default: return "";
    }
  };

  const sortedCategorias = (): Categoria[] => {
    const copy = [...categorias];
    switch (sortOption) {
      case "desc-asc":
        return copy.sort((a, b) => a.descricao.localeCompare(b.descricao));
      case "desc-desc":
        return copy.sort((a, b) => b.descricao.localeCompare(a.descricao));
      case "finalidade-asc":
        return copy.sort((a, b) =>
          getFinalidadeText(a.finalidade).localeCompare(getFinalidadeText(b.finalidade))
        );
      case "finalidade-desc":
        return copy.sort((a, b) =>
          getFinalidadeText(b.finalidade).localeCompare(getFinalidadeText(a.finalidade))
        );
      default:
        return copy;
    }
  };

  // Combina categorias com seus totais de receitas/despesas
  const getCategoriasComTotais = (): CategoriaComTotais[] => {
    const totaisMap = new Map<string, CategoriaTotais>();
    totais.forEach((t) => totaisMap.set(t.categoria, t));

    const combinado: CategoriaComTotais[] = categorias.map((cat) => {
      const fin = totaisMap.get(cat.descricao) || {
        categoria: cat.descricao,
        totalReceitas: 0,
        totalDespesas: 0,
        saldo: 0,
      };
      return {
        ...cat,
        totalReceitas: fin.totalReceitas,
        totalDespesas: fin.totalDespesas,
        saldo: fin.saldo,
      };
    });

    // Ordenação aplicada apenas para consistência (sem botões na aba totals)
    switch (sortOption) {
      case "desc-asc":
        return combinado.sort((a, b) => a.descricao.localeCompare(b.descricao));
      case "desc-desc":
        return combinado.sort((a, b) => b.descricao.localeCompare(a.descricao));
      case "finalidade-asc":
        return combinado.sort((a, b) =>
          getFinalidadeText(a.finalidade).localeCompare(getFinalidadeText(b.finalidade))
        );
      case "finalidade-desc":
        return combinado.sort((a, b) =>
          getFinalidadeText(b.finalidade).localeCompare(getFinalidadeText(a.finalidade))
        );
      default:
        return combinado;
    }
  };

  // Calcula totais gerais de todas as categorias
  const totaisGerais = () => {
    const combinado = getCategoriasComTotais();
    const somaReceitas = combinado.reduce((acc, c) => acc + c.totalReceitas, 0);
    const somaDespesas = combinado.reduce((acc, c) => acc + c.totalDespesas, 0);
    const somaSaldo = combinado.reduce((acc, c) => acc + c.saldo, 0);
    return { somaReceitas, somaDespesas, somaSaldo };
  };

  const handleSave = async () => {
    if (!descricao.trim()) {
      alert("Descrição é obrigatória");
      return;
    }
    if (descricao.length > 400) {
      alert("Descrição deve ter no máximo 400 caracteres");
      return;
    }
    try {
      if (editingCategoria) {
        await api.put(`/categoria/${editingCategoria.id}`, { descricao, finalidade });
      } else {
        await api.post("/categoria", { descricao, finalidade });
      }
      setIsModalOpen(false);
      setDescricao("");
      setFinalidade(0);
      setEditingCategoria(null);
      fetchCategorias();
      fetchTotais();
    } catch {
      alert("Erro ao salvar categoria");
    }
  };

  const handleEdit = (c: Categoria) => {
    setEditingCategoria(c);
    setDescricao(c.descricao);
    setFinalidade(c.finalidade);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente deletar?")) return;
    try {
      await api.delete(`/categoria/${id}`);
      fetchCategorias();
      fetchTotais();
    } catch {
      alert("Erro ao deletar categoria");
    }
  };

  if (loading) return <p className="p-4">Carregando...</p>;
  if (error) return <p className="p-4">{error}</p>;

  return (
    <div className="pessoas-layout">
      {/* Botão voltar */}
      <button onClick={() => navigate("/")} className="back-button">
        ← Voltar
      </button>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "categoria" ? "active" : ""}`}
          onClick={() => setActiveTab("categoria")}
        >
          Categoria
        </button>
        <button
          className={`tab ${activeTab === "totals" ? "active" : ""}`}
          onClick={() => setActiveTab("totals")}
        >
          Mostrar totais
        </button>
      </div>

      {/* Barra de ordenação */}
      {activeTab === "categoria" && (
        <div className="filters-bar">
          <div className="filter-group">
            <span className="filter-label">Ordenar por descrição:</span>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${sortOption === "desc-asc" ? "active" : ""}`}
                onClick={() => setSortOption("desc-asc")}
              >
                A-Z
              </button>
              <button
                className={`filter-btn ${sortOption === "desc-desc" ? "active" : ""}`}
                onClick={() => setSortOption("desc-desc")}
              >
                Z-A
              </button>
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Ordenar por finalidade:</span>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${sortOption === "finalidade-asc" ? "active" : ""}`}
                onClick={() => setSortOption("finalidade-asc")}
              >
                A-Z
              </button>
              <button
                className={`filter-btn ${sortOption === "finalidade-desc" ? "active" : ""}`}
                onClick={() => setSortOption("finalidade-desc")}
              >
                Z-A
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aba de listagem */}
      {activeTab === "categoria" && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Finalidade</th>
                <th>Ações</th>
              </tr>
              </thead>
            <tbody>
              {sortedCategorias().map((categoria) => (
                <tr key={categoria.id}>
                  <td>{categoria.descricao}</td>
                  <td>{getFinalidadeText(categoria.finalidade)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="button button-edit mr-2"
                        onClick={() => handleEdit(categoria)}
                      >
                        Editar
                      </button>
                      <button
                        className="button button-delete"
                        onClick={() => handleDelete(categoria.id)}
                      >
                        Deletar
                      </button>
                    </div>
                   </td>
                 </tr>
              ))}
              {categorias.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center p-4">
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="totals-bar">
            <div className="totals-item">
              <span className="totals-label">Total de categorias:</span>
              <span className="totals-value highlight">{categorias.length}</span>
            </div>
          </div>
        </>
      )}

      {/* Aba de totais por categoria */}
      {activeTab === "totals" && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Receitas (R$)</th>
                <th>Despesas (R$)</th>
                <th>Saldo (R$)</th>
              </tr>
            </thead>
            <tbody>
              {getCategoriasComTotais().map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.descricao}</td>
                  <td className="text-right">
                    {cat.totalReceitas.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="text-right">
                    {cat.totalDespesas.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td
                    className={`text-right ${
                      cat.saldo >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {cat.saldo.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                </tr>
              ))}
              {getCategoriasComTotais().length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-4">
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td>
                  <strong>Totais gerais</strong>
                </td>
                <td className="text-right">
                  <strong>
                    {totaisGerais().somaReceitas.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>
                </td>
                <td className="text-right">
                  <strong>
                    {totaisGerais().somaDespesas.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>
                </td>
                <td
                  className={`text-right ${
                    totaisGerais().somaSaldo >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <strong>
                    {totaisGerais().somaSaldo.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </>
      )}

      <div className="add-button-fixed">
        <button className="button" onClick={() => setIsModalOpen(true)}>
          + Adicionar Categoria
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              {editingCategoria ? "Editar Categoria" : "Nova Categoria"}
            </div>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição (máx. 400 caracteres)"
            />
            <div className="form-group">
              <label>Finalidade</label>
              <select
                value={finalidade}
                onChange={(e) => setFinalidade(Number(e.target.value) as Finalidade)}
              >
                <option value={0}>Receita</option>
                <option value={1}>Despesa</option>
                <option value={2}>Ambas</option>
              </select>
            </div>
            <div className="mt-4 text-right">
              <button className="button" onClick={handleSave}>
                {editingCategoria ? "Salvar" : "Adicionar"}
              </button>
              <button
                className="button button-delete ml-2"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCategoria(null);
                  setDescricao("");
                  setFinalidade(0);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};