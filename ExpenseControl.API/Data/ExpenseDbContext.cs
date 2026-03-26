using Microsoft.EntityFrameworkCore;
using ExpenseControl.API.Entities;

namespace ExpenseControl.API.Data
{
    public class ExpenseDbContext : DbContext
    {
        public ExpenseDbContext(DbContextOptions<ExpenseDbContext> options) : base(options)
        {
        }

        public DbSet<Pessoa> Pessoas { get; set; }

        public DbSet<Categoria> Categorias { get; set; }

        public DbSet<Transacao> Transacoes { get; set; }
    }
}