using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class TransacaoController : ControllerBase
{
    private static List<Transacao> transacoes = new List<Transacao>();
    private static int id = 1;

    private static List<Pessoa> pessoas = PessoaController.pessoas;
    private static List<Categoria> categorias = CategoriaController.categorias;

    // GET
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(transacoes);
    }

    // POST
    [HttpPost]
    public IActionResult Create([FromBody] Transacao transacao)
    {
        var pessoa = pessoas.FirstOrDefault(p => p.Id == transacao.PessoaId);
        if (pessoa == null)
            return BadRequest("Pessoa não encontrada");

        var categoria = categorias.FirstOrDefault(c => c.Id == transacao.CategoriaId);
        if (categoria == null)
            return BadRequest("Categoria não encontrada");

        if (transacao.Valor <= 0)
            return BadRequest("Valor deve ser positivo");

        // Validação de idade
        if (pessoa.Idade < 18 && transacao.Tipo == TipoTransacao.Receita)
            return BadRequest("Menor de idade só pode ter despesas");

        // Validadar categoria
        if (categoria.Finalidade != Finalidade.Ambas)
        {
            if (transacao.Tipo == TipoTransacao.Receita && categoria.Finalidade != Finalidade.Receita)
                return BadRequest("Categoria inválida para receita");

            if (transacao.Tipo == TipoTransacao.Despesa && categoria.Finalidade != Finalidade.Despesa)
                return BadRequest("Categoria inválida para despesa");
        }

        transacao.Id = id++;
        transacoes.Add(transacao);

        return Ok(transacao);
    }
}