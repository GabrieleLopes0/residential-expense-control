public enum Finalidade
{
    Receita,
    Despesa,
    Ambas
}

public class Categoria
{
    public int Id { get; set; }
    public string Descricao { get; set; }
    public Finalidade Finalidade { get; set; }
}