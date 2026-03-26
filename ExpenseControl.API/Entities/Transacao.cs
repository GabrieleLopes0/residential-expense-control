public enum TipoTransacao
{
    Receita,
    Despesa
}

public class Transacao
{
    public int Id { get; set; }
    public string Descricao { get; set; }
    public decimal Valor { get; set; }
    public TipoTransacao Tipo { get; set; }

    public int CategoriaId { get; set; }
    public int PessoaId { get; set; }
}