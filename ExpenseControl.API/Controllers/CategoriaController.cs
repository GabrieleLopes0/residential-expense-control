[ApiController]
[Route("api/[controller]")]
public class CategoriaController : ControllerBase
{
    private static List<Categoria> categorias = new List<Categoria>();
    private static int id = 1;

    // GET
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(categorias);
    }

    // POST
    [HttpPost]
    public IActionResult Create([FromBody] Categoria categoria)
    {
        if (string.IsNullOrEmpty(categoria.Descricao) || categoria.Descricao.Length > 400)
            return BadRequest("Descrição inválida");

        categoria.Id = id++;
        categorias.Add(categoria);

        return Ok(categoria);
    }
}