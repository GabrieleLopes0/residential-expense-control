using Microsoft.EntityFrameworkCore;
using ExpenseControl.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Serviços da aplicação
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Banco SQLite
builder.Services.AddDbContext<ExpenseDbContext>(options =>
    options.UseSqlite("Data Source=expense.db"));

// Configuração de CORS para o frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// Middlewares
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.UseHttpsRedirection();

// Swagger em desenvolvimento
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Mapeia os controllers
app.MapControllers();

app.Run();
