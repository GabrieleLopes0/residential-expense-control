using Microsoft.AspNetCore.Mvc;
using ExpenseControl.API.Entities;
using ExpenseControl.API.Data;

namespace ExpenseControl.API.Controllers
{
    // Controller de Categoria - CRUD + totais
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriaController : ControllerBase
    {
        private readonly ExpenseDbContext _context;

        public CategoriaController(ExpenseDbContext context)
        {
            _context = context;
        }

        // Lista todas as categorias
        [HttpGet]
        public IActionResult Get()
        {
            var categorias = _context.Categorias.ToList();
            return Ok(categorias);
        }

        // Cria uma nova categoria
        [HttpPost]
        public IActionResult Create([FromBody] Categoria categoria)
        {
            // Valida descrição (obrigatória, máx 400)
            if (string.IsNullOrEmpty(categoria.Descricao) || categoria.Descricao.Length > 400)
                return BadRequest("Descrição inválida");

            _context.Categorias.Add(categoria);
            _context.SaveChanges();

            return Ok(categoria);
        }

        // Edita uma categoria existente
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Categoria categoriaAtualizada)
        {
            var categoria = _context.Categorias.Find(id);
            if (categoria == null)
                return NotFound();

            // Mesma validação da criação
            if (string.IsNullOrEmpty(categoriaAtualizada.Descricao) || categoriaAtualizada.Descricao.Length > 400)
                return BadRequest("Descrição inválida");

            // Atualiza os campos
            categoria.Descricao = categoriaAtualizada.Descricao;
            categoria.Finalidade = categoriaAtualizada.Finalidade;

            _context.SaveChanges();

            return Ok(categoria);
        }

        // Deleta uma categoria
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var categoria = _context.Categorias.Find(id);
            if (categoria == null)
                return NotFound();

            // Impede exclusão se houver transações vinculadas
            var transacoesVinculadas = _context.Transacoes.Any(t => t.CategoriaId == id);
            if (transacoesVinculadas)
                return BadRequest("Não é possível deletar uma categoria com transações vinculadas");

            _context.Categorias.Remove(categoria);
            _context.SaveChanges();

            return NoContent();
        }

        // Retorna a quantidade de categorias
        [HttpGet("count")]
        public IActionResult Count()
        {
            return Ok(_context.Categorias.Count());
        }

        // Totais de receitas e despesas por categoria
        [HttpGet("totais")]
        public IActionResult GetTotaisCategoria()
        {
            var resultado = _context.Categorias
                .Select(c => new
                {
                    Categoria = c.Descricao,
                    // Soma receitas da categoria
                    TotalReceitas = _context.Transacoes
                        .Where(t => t.CategoriaId == c.Id && t.Tipo == TipoTransacao.Receita)
                        .Sum(t => (decimal?)t.Valor) ?? 0,
                    // Soma despesas da categoria
                    TotalDespesas = _context.Transacoes
                        .Where(t => t.CategoriaId == c.Id && t.Tipo == TipoTransacao.Despesa)
                        .Sum(t => (decimal?)t.Valor) ?? 0
                })
                .Select(x => new
                {
                    x.Categoria,
                    x.TotalReceitas,
                    x.TotalDespesas,
                    // Saldo = receitas - despesas
                    Saldo = x.TotalReceitas - x.TotalDespesas
                });

            return Ok(resultado);
        }
    }
}
