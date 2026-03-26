using Microsoft.AspNetCore.Mvc;
using ExpenseControl.API.Entities;
using ExpenseControl.API.Data;

namespace ExpenseControl.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PessoaController : ControllerBase
    {
        private readonly ExpenseDbContext _context;

        public PessoaController(ExpenseDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Get()
        {
            var pessoas = _context.Pessoas.ToList();
            return Ok(pessoas);
        }

        [HttpPost]
        public IActionResult Post([FromBody] Pessoa pessoa)
        {
            _context.Pessoas.Add(pessoa);
            _context.SaveChanges();

            return Ok(pessoa);
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] Pessoa pessoaAtualizada)
        {
            var pessoa = _context.Pessoas.Find(id);

            if (pessoa == null)
                return NotFound();

            pessoa.Nome = pessoaAtualizada.Nome;
            pessoa.Idade = pessoaAtualizada.Idade;

            _context.SaveChanges();

            return Ok(pessoa);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var pessoa = _context.Pessoas.Find(id);

            if (pessoa == null)
                return NotFound();

            var transacoes = _context.Transacoes.Where(t => t.PessoaId == id);
            _context.Transacoes.RemoveRange(transacoes);

            _context.Pessoas.Remove(pessoa);
            _context.SaveChanges();

            return NoContent();
        }

        [HttpGet("totais")]
        public IActionResult GetTotais()
        {
            var resultado = _context.Pessoas
                .Select(p => new
                {
                    Pessoa = p.Nome,
                    TotalReceitas = _context.Transacoes
                        .Where(t => t.PessoaId == p.Id && t.Tipo == TipoTransacao.Receita)
                        .Sum(t => (decimal?)t.Valor) ?? 0,

                    TotalDespesas = _context.Transacoes
                        .Where(t => t.PessoaId == p.Id && t.Tipo == TipoTransacao.Despesa)
                        .Sum(t => (decimal?)t.Valor) ?? 0
                })
                .Select(r => new
                {
                    r.Pessoa,
                    r.TotalReceitas,
                    r.TotalDespesas,
                    Saldo = r.TotalReceitas - r.TotalDespesas
                });

            return Ok(resultado);
        }
    }
}