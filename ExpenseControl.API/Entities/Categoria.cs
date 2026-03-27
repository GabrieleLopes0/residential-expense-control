using System.ComponentModel.DataAnnotations;

namespace ExpenseControl.API.Entities
{
    // Finalidades de categoria
    public enum Finalidade
    {
        Receita,
        Despesa,
        Ambas
    }

    // Entidade Categoria
    public class Categoria
    {
        public int Id { get; set; }

        // Descrição com limite de 400 caracteres
        [Required(ErrorMessage = "Descrição é obrigatória")]
        [MaxLength(400, ErrorMessage = "Descrição deve ter no máximo 400 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        // Receita, Despesa ou Ambas
        public Finalidade Finalidade { get; set; }
    }
}
