using Microsoft.AspNetCore.Mvc;
using ExpenseControl.API.Entities;
using ExpenseControl.API.Data;

namespace ExpenseControl.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransacaoController : ControllerBase
    {
        private readonly ExpenseDbContext _context;

        public TransacaoController(ExpenseDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Get()
        {
            var transacoes = _context.Transacoes.ToList();
            return Ok(transacoes);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Transacao transacao)
        {
            var pessoa = _context.Pessoas.Find(transacao.PessoaId);
            if (pessoa == null)
                return BadRequest("Pessoa não encontrada");

            var categoria = _context.Categorias.Find(transacao.CategoriaId);
            if (categoria == null)
                return BadRequest("Categoria não encontrada");

            if (transacao.Valor <= 0)
                return BadRequest("Valor deve ser positivo");

            if (pessoa.Idade < 18 && transacao.Tipo == TipoTransacao.Receita)
                return BadRequest("Menor de idade só pode ter despesas");

            if (categoria.Finalidade != Finalidade.Ambas)
            {
                if (transacao.Tipo == TipoTransacao.Receita && categoria.Finalidade != Finalidade.Receita)
                    return BadRequest("Categoria inválida para receita");

                if (transacao.Tipo == TipoTransacao.Despesa && categoria.Finalidade != Finalidade.Despesa)
                    return BadRequest("Categoria inválida para despesa");
            }

            _context.Transacoes.Add(transacao);
            _context.SaveChanges();

            return Ok(transacao);
        }
    }
}