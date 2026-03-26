export interface Pessoa {
  id: number;
  nome: string;
  idade: number;
}

export interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: number;
  categoriaId: number;
  pessoaId: number;
}