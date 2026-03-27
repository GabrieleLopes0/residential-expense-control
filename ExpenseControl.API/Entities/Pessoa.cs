using System.ComponentModel.DataAnnotations;

namespace ExpenseControl.API.Entities
{
    // Entidade Pessoa
    public class Pessoa
    {
        public int Id { get; set; }

        // Nome com limite de 200 caracteres
        [Required(ErrorMessage = "Nome é obrigatório")]
        [MaxLength(200, ErrorMessage = "Nome deve ter no máximo 200 caracteres")]
        public string Nome { get; set; } = string.Empty;

        // Idade entre 0 e 150
        [Range(0, 150, ErrorMessage = "Idade deve ser entre 0 e 150")]
        public int Idade { get; set; }
    }
}
