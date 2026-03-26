using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class PessoaController : ControllerBase
{
    private static List<Pessoa> pessoas = new List<Pessoa>();
    private static int id = 1;

    // GET: api/pessoa
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(pessoas);
    }

    // GET: api/pessoa/1
    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var pessoa = pessoas.FirstOrDefault(p => p.Id == id);

        if (pessoa == null)
            return NotFound("Pessoa não encontrada");

        return Ok(pessoa);
    }

    // POST: api/pessoa
    [HttpPost]
    public IActionResult Create([FromBody] Pessoa pessoa)
    {
        if (string.IsNullOrEmpty(pessoa.Nome) || pessoa.Nome.Length > 200)
            return BadRequest("Nome inválido");

        pessoa.Id = id++;
        pessoas.Add(pessoa);

        return CreatedAtAction(nameof(GetById), new { id = pessoa.Id }, pessoa);
    }

    // PUT: api/pessoa/1
    [HttpPut("{id}")]
    public IActionResult Update(int id, [FromBody] Pessoa pessoaAtualizada)
    {
        var pessoa = pessoas.FirstOrDefault(p => p.Id == id);

        if (pessoa == null)
            return NotFound("Pessoa não encontrada");

        if (string.IsNullOrEmpty(pessoaAtualizada.Nome) || pessoaAtualizada.Nome.Length > 200)
            return BadRequest("Nome inválido");

        pessoa.Nome = pessoaAtualizada.Nome;
        pessoa.Idade = pessoaAtualizada.Idade;

        return Ok(pessoa);
    }

    // DELETE: api/pessoa/1
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var pessoa = pessoas.FirstOrDefault(p => p.Id == id);

        if (pessoa == null)
            return NotFound("Pessoa não encontrada");

        pessoas.Remove(pessoa);

        return NoContent();
    }
}