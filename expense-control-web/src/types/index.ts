export interface Pessoa {
  id: number;
  nome: string;
  idade: number;
}

export interface Categoria {
  id: number;
  descricao: string;
  finalidade: number;
}

export interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: number;
  categoriaId: number;
  pessoaId: number;
}