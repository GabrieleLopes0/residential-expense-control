// Interfaces das entidades

export interface Pessoa {
  id: number;
  nome: string;
  idade: number;
}

// 0 = Receita, 1 = Despesa, 2 = Ambas
export type Finalidade = 0 | 1 | 2;

export interface Categoria {
  id: number;
  descricao: string;
  finalidade: Finalidade;
}

export interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: number; // 0 = Receita, 1 = Despesa
  pessoaId: number;
  categoriaId: number;
  pessoa?: { id: number };
  categoria?: { id: number };
}
