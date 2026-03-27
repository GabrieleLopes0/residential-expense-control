using Microsoft.EntityFrameworkCore;
using ExpenseControl.API.Entities;

namespace ExpenseControl.API.Data
{
    // Contexto do banco de dados
    public class ExpenseDbContext : DbContext
    {
        public ExpenseDbContext(DbContextOptions<ExpenseDbContext> options) : base(options)
        {
        }

        // Tabelas do banco
        public DbSet<Pessoa> Pessoas { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Transacao> Transacoes { get; set; }
    }
}
