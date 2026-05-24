using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;
using OrdenExpressAPI.Services;

namespace OrdenExpressAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "Admin")]
    public class ProductoController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IFileService _fileService;

        public ProductoController(AppDbContext context, IFileService fileService)
        {
            _context = context;
            _fileService = fileService;
        }

        // GET: api/Producto - Obtener todos los productos
        [HttpGet]
        public async Task<IActionResult> ObtenerTodos()
        {
            var productos = await _context.Producto.ToListAsync();
            return Ok(productos);
        }

        // GET: api/Producto/menu - Obtener productos para el menú (con imagen)
        [HttpGet("menu")]
        [AllowAnonymous] // TEMP: permite cargar menú sin auth para debugging
        public async Task<IActionResult> ObtenerMenu()
        {
            var productos = await _context.Producto
                .Where(p => p.Imagen != null && p.Cantidad_Disponible > 0)
                .ToListAsync();
            return Ok(productos);
        }

        // GET: api/Producto/inventario - Obtener productos para inventario
        [HttpGet("inventario")]
        public async Task<IActionResult> ObtenerInventario()
        {
            var productos = await _context.Producto
                .Select(p => new 
                {
                    p.ID_Producto,
                    p.Nombre_P,
                    p.Descripcion,
                    p.Cantidad_Disponible,
                    p.Cantidad_Min,
                    p.Cantidad_Max
                })
                .ToListAsync();
            return Ok(productos);
        }

        // GET: api/Producto/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Obtener(int id)
        {
            var producto = await _context.Producto.FindAsync(id);

            if (producto == null)
                return NotFound(new { message = "Producto no encontrado" });

            return Ok(producto);
        }

        // POST: api/Producto - Agregar producto
        [HttpPost]
        public async Task<IActionResult> Agregar([FromForm] ProductoForm p)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var producto = new Producto
            {
                Nombre_P = p.Nombre_P,
                Clasificacion = p.Clasificacion,
                Descripcion = p.Descripcion,
                Cantidad_Disponible = p.Cantidad_Disponible,
                Cantidad_Min = p.Cantidad_Min,
                Cantidad_Max = p.Cantidad_Max,
                Costo_Base = p.Costo_Base,
                Precio_Venta = p.Precio_Venta,
                Porcentaje_Gan = p.Porcentaje_Gan
            };

            if (p.Imagen != null)
            {
                var fileName = await _fileService.SaveFileAsync(p.Imagen, "fotos");
                if (fileName != null)
                    producto.Imagen = fileName;
            }

            await _context.Producto.AddAsync(producto);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Producto agregado correctamente" });
        }

        // PUT: api/Producto/entrada/{id} - Registrar entrada de inventario
        [HttpPut("entrada/{id}")]
        public async Task<IActionResult> EntradaInventario(int id, [FromBody] int cantidad)
        {
            var producto = await _context.Producto.FindAsync(id);

            if (producto == null)
                return NotFound(new { message = "Producto no encontrado" });

            if (cantidad <= 0)
                return BadRequest(new { message = "La cantidad debe ser mayor a 0" });

            producto.Cantidad_Disponible += cantidad;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Entrada de inventario registrada" });
        }

        // PUT: api/Producto/{id} - Modificar producto
        [HttpPut("{id}")]
        public async Task<IActionResult> Modificar(int id, [FromBody] Producto productoActualizado)
        {
            var producto = await _context.Producto.FindAsync(id);

            if (producto == null)
                return NotFound(new { message = "Producto no encontrado" });

            producto.Nombre_P = productoActualizado.Nombre_P;
            producto.Clasificacion = productoActualizado.Clasificacion;
            producto.Descripcion = productoActualizado.Descripcion;
            producto.Cantidad_Disponible = productoActualizado.Cantidad_Disponible;
            producto.Cantidad_Min = productoActualizado.Cantidad_Min;
            producto.Cantidad_Max = productoActualizado.Cantidad_Max;
            producto.Costo_Base = productoActualizado.Costo_Base;
            producto.Porcentaje_Gan = productoActualizado.Porcentaje_Gan;
            producto.Precio_Venta = productoActualizado.Costo_Base + 
                (productoActualizado.Costo_Base * (productoActualizado.Porcentaje_Gan ?? 0) / 100);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Producto modificado correctamente" });
        }

        // DELETE: api/Producto/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var producto = await _context.Producto.FindAsync(id);

            if (producto == null)
                return NotFound(new { message = "Producto no encontrado" });

            _context.Producto.Remove(producto);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Producto eliminado" });
        }
    }

    // Clase para recibir datos del formulario
    public class ProductoForm
    {
        public string Nombre_P { get; set; } = string.Empty;
        public string? Clasificacion { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public int Cantidad_Disponible { get; set; }
        public int? Cantidad_Min { get; set; }
        public int? Cantidad_Max { get; set; }
        public decimal Costo_Base { get; set; }
        public decimal Precio_Venta { get; set; }
        public decimal? Porcentaje_Gan { get; set; }
        public IFormFile? Imagen { get; set; }
    }
}

