// Página de gerenciamento de pessoas
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { Pessoa } from "../types";
import { Toast } from "../components/Toast/Toast";
import { ConfirmModal } from "../components/ConfirmModal/ConfirmModal";

type SortOption = "nome-asc" | "nome-desc" | "idade-asc" | "idade-desc";
type ActiveTab = "familia" | "totals";

interface PessoaTotais {
  pessoa: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

interface PessoaComTotais extends PessoaTotais {
  id: number;
  idade: number;
}

export const Pessoas: React.FC = () => {
  const navigate = useNavigate();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [totais, setTotais] = useState<PessoaTotais[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState<number | "">("");
  const [editingPessoa, setEditingPessoa] = useState<Pessoa | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("familia");
  const [sortOption, setSortOption] = useState<SortOption>("idade-asc");

  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ message: "", type: "success" as "success" | "error", visible: false });
  const [confirmDelete, setConfirmDelete] = useState<{ visible: boolean; id: number | null }>({ visible: false, id: null });

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type, visible: true });
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const fetchPessoas = async () => {
    try {
      setLoading(true);
      const response = await api.get<Pessoa[]>("/pessoa");
      setPessoas(response.data);
    } catch {
      setError("Erro ao carregar pessoas");
    } finally {
      setLoading(false);
    }
  };

  const fetchTotais = async () => {
    try {
      const response = await api.get<PessoaTotais[]>("/pessoa/totais");
      setTotais(response.data);
    } catch {
      console.error("Erro ao carregar totais");
      setTotais([]);
    }
  };

  useEffect(() => {
    fetchPessoas();
    fetchTotais();
  }, []);

  const sortedPessoas = () => {
    const copy = [...pessoas];
    switch (sortOption) {
      case "nome-asc": return copy.sort((a, b) => a.nome.localeCompare(b.nome));
      case "nome-desc": return copy.sort((a, b) => b.nome.localeCompare(a.nome));
      case "idade-asc": return copy.sort((a, b) => a.idade - b.idade);
      case "idade-desc": return copy.sort((a, b) => b.idade - a.idade);
      default: return copy;
    }
  };

  // Combina pessoas com seus totais de receitas/despesas
  const getPessoasComTotais = (): PessoaComTotais[] => {
    const totaisMap = new Map<string, PessoaTotais>();
    totais.forEach((t) => totaisMap.set(t.pessoa, t));

    const combinado: PessoaComTotais[] = pessoas.map((p) => {
      const fin = totaisMap.get(p.nome) || { pessoa: p.nome, totalReceitas: 0, totalDespesas: 0, saldo: 0 };
      return { ...fin, id: p.id, idade: p.idade };
    });

    switch (sortOption) {
      case "nome-asc": return combinado.sort((a, b) => a.pessoa.localeCompare(b.pessoa));
      case "nome-desc": return combinado.sort((a, b) => b.pessoa.localeCompare(a.pessoa));
      case "idade-asc": return combinado.sort((a, b) => a.idade - b.idade);
      case "idade-desc": return combinado.sort((a, b) => b.idade - a.idade);
      default: return combinado;
    }
  };

  // Calcula totais gerais
  const totaisGerais = () => {
    const combinado = getPessoasComTotais();
    const somaReceitas = combinado.reduce((acc, p) => acc + p.totalReceitas, 0);
    const somaDespesas = combinado.reduce((acc, p) => acc + p.totalDespesas, 0);
    const somaSaldo = combinado.reduce((acc, p) => acc + p.saldo, 0);
    return { somaReceitas, somaDespesas, somaSaldo };
  };

  const validatePessoa = (): boolean => {
    const errors: Record<string, string> = {};
    if (!nome.trim()) errors.nome = "Nome é obrigatório";
    else if (nome.length > 200) errors.nome = "Máximo 200 caracteres";
    if (idade === "" || idade < 0) errors.idade = "Idade deve ser um número válido";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Salva pessoa (criação ou edição)
  const handleSave = async () => {
    if (!validatePessoa()) return;

    setSaving(true);
    try {
      if (editingPessoa) {
        await api.put(`/pessoa/${editingPessoa.id}`, { nome, idade });
        showToast("Pessoa atualizada com sucesso", "success");
      } else {
        await api.post("/pessoa", { nome, idade });
        showToast("Pessoa adicionada com sucesso", "success");
      }
      setIsModalOpen(false);
      setNome("");
      setIdade("");
      setEditingPessoa(null);
      setFieldErrors({});
      fetchPessoas();
      fetchTotais();
    } catch {
      showToast("Erro ao salvar pessoa", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: Pessoa) => {
    setEditingPessoa(p);
    setNome(p.nome);
    setIdade(p.idade);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setConfirmDelete({ visible: true, id });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.id) return;
    try {
      await api.delete(`/pessoa/${confirmDelete.id}`);
      showToast("Pessoa deletada com sucesso", "success");
      fetchPessoas();
      fetchTotais();
    } catch {
      showToast("Erro ao deletar pessoa", "error");
    } finally {
      setConfirmDelete({ visible: false, id: null });
    }
  };

  const getCharCounterClass = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio >= 1) return "char-counter danger";
    if (ratio >= 0.8) return "char-counter warning";
    return "char-counter";
  };

  const totalPessoas = pessoas.length;
  const mediaIdade = totalPessoas > 0 ? pessoas.reduce((acc, p) => acc + p.idade, 0) / totalPessoas : 0;

  if (loading) return <p className="p-4">Carregando...</p>;
  if (error) return <p className="p-4">{error}</p>;

  return (
    <div className="pessoas-layout">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={closeToast} />
      <ConfirmModal
        message="Tem certeza que deseja deletar esta pessoa? Todas as transações vinculadas também serão removidas."
        visible={confirmDelete.visible}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ visible: false, id: null })}
      />

      <button onClick={() => navigate("/")} className="back-button">
        &#8592; Voltar
      </button>

      <div className="tabs">
        <button className={`tab ${activeTab === "familia" ? "active" : ""}`} onClick={() => setActiveTab("familia")}>Família</button>
        <button className={`tab ${activeTab === "totals" ? "active" : ""}`} onClick={() => setActiveTab("totals")}>Mostrar totais</button>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <span className="filter-label">Ordenar por nome:</span>
          <div className="filter-buttons">
            <button className={`filter-btn ${sortOption === "nome-asc" ? "active" : ""}`} onClick={() => setSortOption("nome-asc")}>A - Z</button>
            <button className={`filter-btn ${sortOption === "nome-desc" ? "active" : ""}`} onClick={() => setSortOption("nome-desc")}>Z - A</button>
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">Ordenar por idade:</span>
          <div className="filter-buttons">
            <button className={`filter-btn ${sortOption === "idade-asc" ? "active" : ""}`} onClick={() => setSortOption("idade-asc")}>Menor idade</button>
            <button className={`filter-btn ${sortOption === "idade-desc" ? "active" : ""}`} onClick={() => setSortOption("idade-desc")}>Maior idade</button>
          </div>
        </div>
      </div>

      {activeTab === "familia" && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Idade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedPessoas().map((pessoa) => (
                <tr key={pessoa.id}>
                  <td>{pessoa.nome}</td>
                  <td>{pessoa.idade}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="button button-edit mr-2" onClick={() => handleEdit(pessoa)}>Editar</button>
                      <button className="button button-delete" onClick={() => handleDeleteClick(pessoa.id)}>Deletar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {pessoas.length === 0 && (
                <tr><td colSpan={3} className="text-center p-4">Nenhuma pessoa cadastrada.</td></tr>
              )}
            </tbody>
          </table>
          <div className="totals-bar">
            <div className="totals-item">
              <span className="totals-label">Total de pessoas:</span>
              <span className="totals-value highlight">{totalPessoas}</span>
            </div>
            <div className="totals-item">
              <span className="totals-label">Média de idade:</span>
              <span className="totals-value">{mediaIdade.toFixed(1)} anos</span>
            </div>
          </div>
        </>
      )}

      {activeTab === "totals" && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Receitas (R$)</th>
                <th>Despesas (R$)</th>
                <th>Saldo (R$)</th>
              </tr>
            </thead>
            <tbody>
              {getPessoasComTotais().map((p) => (
                <tr key={p.id}>
                  <td>{p.pessoa}</td>
                  <td className="text-right">{p.totalReceitas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className="text-right">{p.totalDespesas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className={`text-right ${p.saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {p.saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                </tr>
              ))}
              {getPessoasComTotais().length === 0 && (
                <tr><td colSpan={4} className="text-center p-4">Nenhuma pessoa cadastrada.</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td><strong>Totais gerais</strong></td>
                <td className="text-right"><strong>{totaisGerais().somaReceitas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></td>
                <td className="text-right"><strong>{totaisGerais().somaDespesas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></td>
                <td className={`text-right ${totaisGerais().somaSaldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                  <strong>{totaisGerais().somaSaldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="totals-bar mt-4">
            <div className="totals-item">
              <span className="totals-label">Total de pessoas:</span>
              <span className="totals-value">{totalPessoas}</span>
            </div>
            <div className="totals-item">
              <span className="totals-label">Média de idade:</span>
              <span className="totals-value">{mediaIdade.toFixed(1)} anos</span>
            </div>
          </div>
        </>
      )}

      <div className="add-button-fixed">
        <button className="button" onClick={() => { setFieldErrors({}); setIsModalOpen(true); }}>
          Adicionar Membro
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              {editingPessoa ? "Editar Pessoa" : "Nova Pessoa"}
            </div>

            <label htmlFor="nome">Nome</label>
            <div className="field-wrapper">
              <input
                id="nome"
                type="text"
                className={fieldErrors.nome ? "input-error" : ""}
                value={nome}
                onChange={(e) => { setNome(e.target.value); clearFieldError("nome"); }}
                placeholder="Nome da pessoa"
                maxLength={200}
              />
              <span className={getCharCounterClass(nome.length, 200)}>{nome.length}/200</span>
              {fieldErrors.nome && <span className="field-error">{fieldErrors.nome}</span>}
            </div>

            <label htmlFor="idade">Idade</label>
            <div className="field-wrapper">
              <input
                id="idade"
                type="number"
                className={fieldErrors.idade ? "input-error" : ""}
                value={idade === "" ? "" : String(idade)}
                onChange={(e) => { setIdade(e.target.value === "" ? "" : Number(e.target.value)); clearFieldError("idade"); }}
                placeholder="Idade"
                min="0"
                max="150"
              />
              {fieldErrors.idade && <span className="field-error">{fieldErrors.idade}</span>}
            </div>

            <div className="mt-4 text-right">
              <button className="button" onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : editingPessoa ? "Salvar" : "Adicionar"}
              </button>
              <button
                className="button button-delete ml-2"
                onClick={() => { setIsModalOpen(false); setEditingPessoa(null); setNome(""); setIdade(""); setFieldErrors({}); }}
                disabled={saving}
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
