using Microsoft.AspNetCore.Mvc;
using ExpenseControl.API.Entities;
using ExpenseControl.API.Data;

namespace ExpenseControl.API.Controllers
{
    // Controller de Transação - CRUD
    [ApiController]
    [Route("api/[controller]")]
    public class TransacaoController : ControllerBase
    {
        private readonly ExpenseDbContext _context;

        public TransacaoController(ExpenseDbContext context)
        {
            _context = context;
        }

        // Lista todas as transações
        [HttpGet]
        public IActionResult Get()
        {
            var transacoes = _context.Transacoes.ToList();
            return Ok(transacoes);
        }

        // Retorna a quantidade de transações
        [HttpGet("count")]
        public IActionResult Count()
        {
            return Ok(_context.Transacoes.Count());
        }

        // Cria uma nova transação
        [HttpPost]
        public IActionResult Create([FromBody] Transacao transacao)
        {
            // Busca pessoa e categoria vinculadas
            var pessoa = _context.Pessoas.Find(transacao.PessoaId);
            if (pessoa == null)
                return BadRequest("Pessoa não encontrada");

            var categoria = _context.Categorias.Find(transacao.CategoriaId);
            if (categoria == null)
                return BadRequest("Categoria não encontrada");

            // Valida descrição (obrigatória, máx 400)
            if (string.IsNullOrEmpty(transacao.Descricao) || transacao.Descricao.Length > 400)
                return BadRequest("Descrição inválida (máximo 400 caracteres)");

            // Valor deve ser positivo
            if (transacao.Valor <= 0)
                return BadRequest("Valor deve ser positivo");

            // Menor de idade só pode ter despesas
            if (pessoa.Idade < 18 && transacao.Tipo == TipoTransacao.Receita)
                return BadRequest("Menor de idade só pode ter despesas");

            // Valida finalidade da categoria com o tipo
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

        // Edita uma transação existente
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Transacao transacaoAtualizada)
        {
            var transacao = _context.Transacoes.Find(id);
            if (transacao == null)
                return NotFound();

            // Busca pessoa e categoria vinculadas
            var pessoa = _context.Pessoas.Find(transacaoAtualizada.PessoaId);
            if (pessoa == null)
                return BadRequest("Pessoa não encontrada");

            var categoria = _context.Categorias.Find(transacaoAtualizada.CategoriaId);
            if (categoria == null)
                return BadRequest("Categoria não encontrada");

            // Mesmas validações da criação
            if (transacaoAtualizada.Valor <= 0)
                return BadRequest("Valor deve ser positivo");

            if (transacaoAtualizada.Descricao.Length > 400)
                return BadRequest("Descrição deve ter no máximo 400 caracteres");

            if (pessoa.Idade < 18 && transacaoAtualizada.Tipo == TipoTransacao.Receita)
                return BadRequest("Menor de idade só pode ter despesas");

            if (categoria.Finalidade != Finalidade.Ambas)
            {
                if (transacaoAtualizada.Tipo == TipoTransacao.Receita && categoria.Finalidade != Finalidade.Receita)
                    return BadRequest("Categoria inválida para receita");

                if (transacaoAtualizada.Tipo == TipoTransacao.Despesa && categoria.Finalidade != Finalidade.Despesa)
                    return BadRequest("Categoria inválida para despesa");
            }

            // Atualiza os campos
            transacao.Descricao = transacaoAtualizada.Descricao;
            transacao.Valor = transacaoAtualizada.Valor;
            transacao.Tipo = transacaoAtualizada.Tipo;
            transacao.PessoaId = transacaoAtualizada.PessoaId;
            transacao.CategoriaId = transacaoAtualizada.CategoriaId;

            _context.SaveChanges();

            return Ok(transacao);
        }

        // Deleta uma transação
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var transacao = _context.Transacoes.Find(id);
            if (transacao == null)
                return NotFound();

            _context.Transacoes.Remove(transacao);
            _context.SaveChanges();

            return NoContent();
        }
    }
}
