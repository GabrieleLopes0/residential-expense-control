using System.ComponentModel.DataAnnotations;

namespace ExpenseControl.API.Entities
{
    // Tipos de transação
    public enum TipoTransacao
    {
        Receita,
        Despesa
    }

    // Entidade Transação
    public class Transacao
    {
        public int Id { get; set; }

        // Descrição com limite de 400 caracteres
        [Required(ErrorMessage = "Descrição é obrigatória")]
        [MaxLength(400, ErrorMessage = "Descrição deve ter no máximo 400 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        // Aceita apenas valores positivos
        [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser positivo")]
        public decimal Valor { get; set; }

        // Receita ou Despesa
        public TipoTransacao Tipo { get; set; }

        // Relacionamento com Categoria
        public int CategoriaId { get; set; }
        public Categoria? Categoria { get; set; }

        // Relacionamento com Pessoa
        public int PessoaId { get; set; }
        public Pessoa? Pessoa { get; set; }
    }
}
