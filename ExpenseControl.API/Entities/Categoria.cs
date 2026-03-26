namespace ExpenseControl.API.Entities
{
    public enum Finalidade
    {
        Receita,
        Despesa,
        Ambas
    }

    public class Categoria
    {
        public int Id { get; set; }

        public string Descricao { get; set; } = string.Empty;

        public Finalidade Finalidade { get; set; }
    }
}