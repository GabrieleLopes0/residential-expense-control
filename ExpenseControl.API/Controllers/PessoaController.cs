using Microsoft.AspNetCore.Mvc;
using ExpenseControl.API.Entities;
using ExpenseControl.API.Data;

namespace ExpenseControl.API.Controllers
{
    // Controller de Pessoa - CRUD + totais
    [ApiController]
    [Route("api/[controller]")]
    public class PessoaController : ControllerBase
    {
        private readonly ExpenseDbContext _context;

        public PessoaController(ExpenseDbContext context)
        {
            _context = context;
        }

        // Lista todas as pessoas
        [HttpGet]
        public IActionResult Get()
        {
            var pessoas = _context.Pessoas.ToList();
            return Ok(pessoas);
        }

        // Cria uma nova pessoa
        [HttpPost]
        public IActionResult Post([FromBody] Pessoa pessoa)
        {
            // Valida nome (obrigatório, máx 200)
            if (string.IsNullOrEmpty(pessoa.Nome) || pessoa.Nome.Length > 200)
                return BadRequest("Nome inválido (máximo 200 caracteres)");

            // Valida idade
            if (pessoa.Idade < 0)
                return BadRequest("Idade deve ser um número positivo");

            _context.Pessoas.Add(pessoa);
            _context.SaveChanges();

            return Ok(pessoa);
        }

        // Edita uma pessoa existente
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] Pessoa pessoaAtualizada)
        {
            var pessoa = _context.Pessoas.Find(id);

            if (pessoa == null)
                return NotFound();

            // Mesmas validações da criação
            if (string.IsNullOrEmpty(pessoaAtualizada.Nome) || pessoaAtualizada.Nome.Length > 200)
                return BadRequest("Nome inválido (máximo 200 caracteres)");

            if (pessoaAtualizada.Idade < 0)
                return BadRequest("Idade deve ser um número positivo");

            // Atualiza os campos
            pessoa.Nome = pessoaAtualizada.Nome;
            pessoa.Idade = pessoaAtualizada.Idade;

            _context.SaveChanges();

            return Ok(pessoa);
        }

        // Deleta uma pessoa e suas transações
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var pessoa = _context.Pessoas.Find(id);

            if (pessoa == null)
                return NotFound();

            // Remove transações vinculadas antes de deletar
            var transacoes = _context.Transacoes.Where(t => t.PessoaId == id);
            _context.Transacoes.RemoveRange(transacoes);

            _context.Pessoas.Remove(pessoa);
            _context.SaveChanges();

            return NoContent();
        }

        // Retorna a quantidade de pessoas
        [HttpGet("count")]
        public IActionResult Count()
        {
            return Ok(_context.Pessoas.Count());
        }

        // Totais de receitas e despesas por pessoa
        [HttpGet("totais")]
        public IActionResult GetTotais()
        {
            var resultado = _context.Pessoas
                .Select(p => new
                {
                    Pessoa = p.Nome,
                    // Soma receitas da pessoa
                    TotalReceitas = _context.Transacoes
                        .Where(t => t.PessoaId == p.Id && t.Tipo == TipoTransacao.Receita)
                        .Sum(t => (decimal?)t.Valor) ?? 0,
                    // Soma despesas da pessoa
                    TotalDespesas = _context.Transacoes
                        .Where(t => t.PessoaId == p.Id && t.Tipo == TipoTransacao.Despesa)
                        .Sum(t => (decimal?)t.Valor) ?? 0
                })
                .Select(r => new
                {
                    r.Pessoa,
                    r.TotalReceitas,
                    r.TotalDespesas,
                    // Saldo = receitas - despesas
                    Saldo = r.TotalReceitas - r.TotalDespesas
                });

            return Ok(resultado);
        }
    }
}
