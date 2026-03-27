// Página de gerenciamento de transações
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { Transacao, Pessoa, Categoria } from "../types";
import { Toast } from "../components/Toast/Toast";
import { ConfirmModal } from "../components/ConfirmModal/ConfirmModal";

type SortOption = "desc-asc" | "desc-desc" | "valor-asc" | "valor-desc";
type ActiveTab = "transacoes" | "totals";

export const Transacoes: React.FC = () => {
  const navigate = useNavigate();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<ActiveTab>("transacoes");
  const [sortOption, setSortOption] = useState<SortOption>("desc-asc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState<number | "">("");
  const [tipo, setTipo] = useState<number>(0);
  const [pessoaId, setPessoaId] = useState<number | null>(null);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resTrans, resPessoas, resCats] = await Promise.all([
        api.get<Transacao[]>("/transacao"),
        api.get<Pessoa[]>("/pessoa"),
        api.get<Categoria[]>("/categoria"),
      ]);
      setTransacoes(resTrans.data);
      setPessoas(resPessoas.data);
      setCategorias(resCats.data);
      setError("");
    } catch {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedPessoa = pessoas.find((p) => p.id === pessoaId);
  const isMinor = selectedPessoa ? selectedPessoa.idade < 18 : false;

  // Filtra categorias pela finalidade
  const filteredCategorias = categorias.filter((c) => {
    if (c.finalidade === 2) return true;
    if (isMinor) return c.finalidade === 1;
    if (tipo === 0) return c.finalidade === 0;
    if (tipo === 1) return c.finalidade === 1;
    return true;
  });

  // Força despesa para menor de idade
  const handlePessoaChange = (newPessoaId: number | null) => {
    setPessoaId(newPessoaId);
    clearFieldError("pessoaId");

    if (newPessoaId) {
      const pessoa = pessoas.find((p) => p.id === newPessoaId);
      if (pessoa && pessoa.idade < 18) {
        setTipo(1);
        const cat = categorias.find((c) => c.id === categoriaId);
        if (cat && cat.finalidade === 0) {
          setCategoriaId(null);
        }
      }
    }
  };

  const handleTipoChange = (newTipo: number) => {
    setTipo(newTipo);
    if (categoriaId) {
      const cat = categorias.find((c) => c.id === categoriaId);
      if (cat && cat.finalidade !== 2) {
        if (newTipo === 0 && cat.finalidade !== 0) setCategoriaId(null);
        if (newTipo === 1 && cat.finalidade !== 1) setCategoriaId(null);
      }
    }
  };

  const sortedTransacoes = (): Transacao[] => {
    const copy = [...transacoes];
    switch (sortOption) {
      case "desc-asc":
        return copy.sort((a, b) => a.descricao.localeCompare(b.descricao));
      case "desc-desc":
        return copy.sort((a, b) => b.descricao.localeCompare(a.descricao));
      case "valor-asc":
        return copy.sort((a, b) => a.valor - b.valor);
      case "valor-desc":
        return copy.sort((a, b) => b.valor - a.valor);
      default:
        return copy;
    }
  };

  const totaisGerais = () => {
    const receitas = transacoes.filter((t) => t.tipo === 0).reduce((acc, t) => acc + t.valor, 0);
    const despesas = transacoes.filter((t) => t.tipo === 1).reduce((acc, t) => acc + t.valor, 0);
    return { receitas, despesas, saldo: receitas - despesas };
  };

  const validateTransacao = (): boolean => {
    const errors: Record<string, string> = {};

    if (!descricao.trim()) errors.descricao = "Descrição é obrigatória";
    else if (descricao.length > 400) errors.descricao = "Máximo 400 caracteres";

    if (valor === "" || valor <= 0) errors.valor = "Valor deve ser positivo";

    if (!pessoaId) errors.pessoaId = "Selecione uma pessoa";

    if (!categoriaId) errors.categoriaId = "Selecione uma categoria";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Salva transação (criação ou edição)
  const handleSave = async () => {
    if (!validateTransacao()) return;

    const payload = {
      descricao,
      valor: Number(valor),
      tipo,
      pessoaId,
      categoriaId,
    };

    setSaving(true);
    try {
      if (editingTransacao) {
        await api.put(`/transacao/${editingTransacao.id}`, payload);
        showToast("Transação atualizada com sucesso", "success");
      } else {
        await api.post("/transacao", payload);
        showToast("Transação adicionada com sucesso", "success");
      }
      setIsModalOpen(false);
      resetModal();
      fetchData();
    } catch (err: any) {
      let mensagem = "Erro ao salvar transação";
      if (err.response?.data) {
        if (typeof err.response.data === "string") mensagem = err.response.data;
        else if (typeof err.response.data === "object") mensagem = err.response.data.message || JSON.stringify(err.response.data);
      }
      showToast(mensagem, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t: Transacao) => {
    setEditingTransacao(t);
    setDescricao(t.descricao);
    setValor(t.valor);
    setTipo(t.tipo);
    setPessoaId(t.pessoaId);
    setCategoriaId(t.categoriaId);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setConfirmDelete({ visible: true, id });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.id) return;
    try {
      await api.delete(`/transacao/${confirmDelete.id}`);
      showToast("Transação deletada com sucesso", "success");
      fetchData();
    } catch {
      showToast("Erro ao deletar transação", "error");
    } finally {
      setConfirmDelete({ visible: false, id: null });
    }
  };

  const resetModal = () => {
    setEditingTransacao(null);
    setDescricao("");
    setValor("");
    setTipo(0);
    setPessoaId(null);
    setCategoriaId(null);
    setFieldErrors({});
  };

  const getTipoTexto = (tipo: number) => (tipo === 0 ? "Receita" : "Despesa");

  const getCharCounterClass = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio >= 1) return "char-counter danger";
    if (ratio >= 0.8) return "char-counter warning";
    return "char-counter";
  };

  if (loading) return <p className="p-4">Carregando...</p>;
  if (error) return <p className="p-4">{error}</p>;

  return (
    <div className="pessoas-layout">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={closeToast} />
      <ConfirmModal
        message="Tem certeza que deseja deletar esta transação? Essa ação não pode ser desfeita."
        visible={confirmDelete.visible}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ visible: false, id: null })}
      />

      <button onClick={() => navigate("/")} className="back-button">
        &#8592; Voltar
      </button>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "transacoes" ? "active" : ""}`}
          onClick={() => setActiveTab("transacoes")}
        >
          Transações
        </button>
        <button
          className={`tab ${activeTab === "totals" ? "active" : ""}`}
          onClick={() => setActiveTab("totals")}
        >
          Mostrar totais
        </button>
      </div>

      {activeTab === "transacoes" && (
        <div className="filters-bar">
          <div className="filter-group">
            <span className="filter-label">Ordenar por descrição:</span>
            <div className="filter-buttons">
              <button className={`filter-btn ${sortOption === "desc-asc" ? "active" : ""}`} onClick={() => setSortOption("desc-asc")}>A-Z</button>
              <button className={`filter-btn ${sortOption === "desc-desc" ? "active" : ""}`} onClick={() => setSortOption("desc-desc")}>Z-A</button>
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Ordenar por valor:</span>
            <div className="filter-buttons">
              <button className={`filter-btn ${sortOption === "valor-asc" ? "active" : ""}`} onClick={() => setSortOption("valor-asc")}>Menor valor</button>
              <button className={`filter-btn ${sortOption === "valor-desc" ? "active" : ""}`} onClick={() => setSortOption("valor-desc")}>Maior valor</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "transacoes" && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor (R$)</th>
                <th>Tipo</th>
                <th>Pessoa</th>
                <th>Categoria</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransacoes().map((t) => (
                <tr key={t.id}>
                  <td>{t.descricao}</td>
                  <td className="text-right">{t.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td>{getTipoTexto(t.tipo)}</td>
                  <td>{pessoas.find((p) => p.id === t.pessoaId)?.nome}</td>
                  <td>{categorias.find((c) => c.id === t.categoriaId)?.descricao}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="button button-edit mr-2" onClick={() => handleEdit(t)}>Editar</button>
                      <button className="button button-delete" onClick={() => handleDeleteClick(t.id)}>Deletar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {transacoes.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4">Nenhuma transação cadastrada.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="totals-bar">
            <div className="totals-item">
              <span className="totals-label">Total de transações:</span>
              <span className="totals-value highlight">{transacoes.length}</span>
            </div>
          </div>
        </>
      )}

      {activeTab === "totals" && (
        <div className="totals-view">
          <div className="totals-card" style={{ padding: "1.5rem", background: "white", borderRadius: "1rem", boxShadow: "var(--shadow-md)" }}>
            <h3 style={{ marginBottom: "1rem" }}>Resumo Financeiro Geral</h3>
            <div className="totals-item">
              <span className="totals-label">Total de Receitas:</span>
              <span className="totals-value highlight">{totaisGerais().receitas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            <div className="totals-item">
              <span className="totals-label">Total de Despesas:</span>
              <span className="totals-value">{totaisGerais().despesas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            <div className="totals-item">
              <span className="totals-label">Saldo Líquido:</span>
              <span className={`totals-value ${totaisGerais().saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totaisGerais().saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="add-button-fixed">
        <button className="button" onClick={() => { setFieldErrors({}); setIsModalOpen(true); }}>
          + Adicionar Transação
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              {editingTransacao ? "Editar Transação" : "Nova Transação"}
            </div>

            <label htmlFor="descricao">Descrição</label>
            <div className="field-wrapper">
              <input
                id="descricao"
                name="descricao"
                className={fieldErrors.descricao ? "input-error" : ""}
                value={descricao}
                onChange={(e) => { setDescricao(e.target.value); clearFieldError("descricao"); }}
                placeholder="Descrição da transação"
                maxLength={400}
              />
              <span className={getCharCounterClass(descricao.length, 400)}>{descricao.length}/400</span>
              {fieldErrors.descricao && <span className="field-error">{fieldErrors.descricao}</span>}
            </div>

            <label htmlFor="valor">Valor (R$)</label>
            <div className="field-wrapper">
              <input
                id="valor"
                name="valor"
                type="number"
                className={fieldErrors.valor ? "input-error" : ""}
                value={valor === "" ? "" : String(valor)}
                onChange={(e) => { setValor(e.target.value === "" ? "" : Number(e.target.value)); clearFieldError("valor"); }}
                placeholder="Valor (positivo)"
                min="0.01"
                step="0.01"
              />
              {fieldErrors.valor && <span className="field-error">{fieldErrors.valor}</span>}
            </div>

            <label htmlFor="pessoaId">Pessoa</label>
            <div className="field-wrapper">
              <select
                id="pessoaId"
                name="pessoaId"
                className={fieldErrors.pessoaId ? "input-error" : ""}
                value={pessoaId || ""}
                onChange={(e) => handlePessoaChange(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Selecione uma pessoa</option>
                {pessoas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} (idade: {p.idade})
                  </option>
                ))}
              </select>
              {fieldErrors.pessoaId && <span className="field-error">{fieldErrors.pessoaId}</span>}
            </div>

            <label htmlFor="tipo">Tipo</label>
            <select
              id="tipo"
              name="tipo"
              value={tipo}
              onChange={(e) => handleTipoChange(Number(e.target.value))}
              disabled={isMinor}
            >
              <option value={0}>Receita</option>
              <option value={1}>Despesa</option>
            </select>
            {isMinor && (
              <span className="field-error" style={{ color: "#f59e0b" }}>
                Menor de idade -- apenas despesas permitidas
              </span>
            )}

            <label htmlFor="categoriaId">Categoria</label>
            <div className="field-wrapper">
              <select
                id="categoriaId"
                name="categoriaId"
                className={fieldErrors.categoriaId ? "input-error" : ""}
                value={categoriaId || ""}
                onChange={(e) => { setCategoriaId(e.target.value ? Number(e.target.value) : null); clearFieldError("categoriaId"); }}
              >
                <option value="">Selecione uma categoria</option>
                {filteredCategorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.descricao}
                  </option>
                ))}
              </select>
              {filteredCategorias.length === 0 && (
                <span className="field-error" style={{ color: "#f59e0b" }}>
                  Nenhuma categoria disponível para este tipo
                </span>
              )}
              {fieldErrors.categoriaId && <span className="field-error">{fieldErrors.categoriaId}</span>}
            </div>

            <div className="mt-4 text-right">
              <button className="button" onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : editingTransacao ? "Salvar" : "Adicionar"}
              </button>
              <button
                className="button button-delete ml-2"
                onClick={() => { setIsModalOpen(false); resetModal(); }}
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
