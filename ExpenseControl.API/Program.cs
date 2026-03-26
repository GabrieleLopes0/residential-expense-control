using Microsoft.EntityFrameworkCore;
using ExpenseControl.API.Data;

var builder = WebApplication.CreateBuilder(args);

// === ADD SERVICES ===
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<ExpenseDbContext>(options =>
    options.UseSqlite("Data Source=expense.db"));

// === ADD CORS ===
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:5175") // porta do front
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// === USE MIDDLEWARE ===
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowFrontend"); // habilita CORS
app.UseAuthorization();
app.UseHttpsRedirection();

// Configure HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Map controllers
app.MapControllers();

// Apenas para exemplo do WeatherForecast
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}