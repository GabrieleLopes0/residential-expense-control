using Microsoft.AspNetCore.Mvc;
using ExpenseControl.API.Entities;
using ExpenseControl.API.Data;

namespace ExpenseControl.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriaController : ControllerBase
    {
        private readonly ExpenseDbContext _context;

        public CategoriaController(ExpenseDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Get()
        {
            var categorias = _context.Categorias.ToList();
            return Ok(categorias);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Categoria categoria)
        {
            if (string.IsNullOrEmpty(categoria.Descricao) || categoria.Descricao.Length > 400)
                return BadRequest("Descrição inválida");

            _context.Categorias.Add(categoria);
            _context.SaveChanges();

            return Ok(categoria);
        }

        [HttpGet("totais")]
        public IActionResult GetTotaisCategoria()
        {
            var resultado = _context.Categorias
                .Select(c => new
                {
                    Categoria = c.Descricao,
                    TotalReceitas = _context.Transacoes
                        .Where(t => t.CategoriaId == c.Id && t.Tipo == TipoTransacao.Receita)
                        .Sum(t => (decimal?)t.Valor) ?? 0,

                    TotalDespesas = _context.Transacoes
                        .Where(t => t.CategoriaId == c.Id && t.Tipo == TipoTransacao.Despesa)
                        .Sum(t => (decimal?)t.Valor) ?? 0
                })
                .Select(x => new
                {
                    x.Categoria,
                    x.TotalReceitas,
                    x.TotalDespesas,
                    Saldo = x.TotalReceitas - x.TotalDespesas
                });

            return Ok(resultado);
        }
    }
}