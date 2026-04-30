using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;
using Microsoft.AspNetCore.Authorization;
using OrdenExpressAPI.Models.DTOs;


namespace OrdenExpressAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PedidoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PedidoController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Pedido
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetPedidos()
        {
            return await _context.Pedido.ToListAsync();
        }

        // GET: api/Pedido/todos - Para el panel de cocina
        [HttpGet("todos")]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetTodosPedidos()
        {
            var pedidos = await _context.Pedido
                .Include(p => p.Cliente)
                .Include(p => p.Detalles)
                    .ThenInclude(d => d.Producto)
                .OrderByDescending(p => p.Fecha)
                .ToListAsync(); // Fixed EF nullability by making Detalles non-null

            return Ok(pedidos);
        }

        // GET: api/Pedido/cliente/{id} - Pedidos de un cliente
        [HttpGet("cliente/{id}")]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetPedidosCliente(int id)
        {
            var pedidos = await _context.Pedido
                .Where(p => p.ID_Cliente == id)
                .OrderByDescending(p => p.Fecha)
                .ToListAsync();

            return Ok(pedidos);
        }

        // GET: api/Pedido/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Pedido>> GetPedido(int id)
        {
            var pedido = await _context.Pedido
                .Include(p => p.Cliente)
                .Include(p => p.Detalles)
                    .ThenInclude(d => d.Producto)
                .FirstOrDefaultAsync(p => p.ID_Pedido == id); // Fixed EF nullability

            if (pedido == null)
                return NotFound();

            return pedido;
        }

// POST: api/Pedido/crear - Crear pedido con transacción atómica
[HttpPost("crear")]
        public async Task<IActionResult> CrearPedido([FromBody] CrearPedidoDto dto)
        {
            if (dto.Productos == null || dto.Productos.Count == 0)
            {
                return BadRequest(new ApiErrorResponse { StatusCode = 400, Message = "El pedido debe tener productos" });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try 
            {
                // Crear el pedido
                var pedido = new Pedido
                {
                    ID_Cliente = dto.ID_Cliente,
                    Fecha = DateTime.Now,
                    Estado = "Pendiente",
                    Total = dto.Total,
                    Metodo_Pago = dto.Metodo_Pago ?? "Efectivo"
                };

                _context.Pedido.Add(pedido);
                await _context.SaveChangesAsync();

                // Validar y crear detalles + inventario
                decimal totalCalculado = 0;
                foreach (var prodDto in dto.Productos)
                {
                    var producto = await _context.Producto.FindAsync(prodDto.ID_Producto);
                    if (producto == null || producto.Cantidad_Disponible < prodDto.Cantidad)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new ApiErrorResponse { StatusCode = 400, Message = $"Producto {prodDto.ID_Producto} sin stock suficiente" });
                    }

                    var detalle = new DetallePedido
                    {
                        ID_Pedido = pedido.ID_Pedido,
                        ID_Producto = prodDto.ID_Producto,
                        Cantidad = prodDto.Cantidad,
                        Total = prodDto.Cantidad * prodDto.Precio_Unitario
                    };

                    _context.DetallePedido.Add(detalle);
                    totalCalculado += detalle.Total;

                    producto.Cantidad_Disponible -= prodDto.Cantidad;
                    if (producto.Cantidad_Disponible <= 0) producto.Imagen = null; // Hide from menu
                }


                if (Math.Abs(pedido.Total - totalCalculado) > 0.01m)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new ApiErrorResponse { Code = "400", Message = "Total no coincide con productos" });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Pedido creado correctamente", IdPedido = pedido.ID_Pedido });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new ApiErrorResponse { Code = "500", Message = "Error interno al crear pedido", Detail = ex.Message });
            }
        }

        // PUT: api/Pedido/estado/{id} - Cambiar estado del pedido
        [HttpPut("estado/{id}")]
        public async Task<IActionResult> CambiarEstado(int id, [FromBody] string nuevoEstado)
        {
            var pedido = await _context.Pedido.FindAsync(id);

            if (pedido == null)
                return NotFound(new { message = "Pedido no encontrado" });

            // Validar estados permitidos
            var estadosValidos = new[] { "Pendiente", "En Preparación", "Listo", "Entregado", "Cancelado" };
            if (!estadosValidos.Contains(nuevoEstado))
            {
                return BadRequest(new { message = "Estado no válido" });
            }

            pedido.Estado = nuevoEstado;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Estado actualizado", pedido });
        }

        // PUT: api/Pedido/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPedido(int id, Pedido pedido)
        {
            if (id != pedido.ID_Pedido)
                return BadRequest();

            _context.Entry(pedido).State = EntityState.Modified;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Pedido/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePedido(int id)
        {
            var pedido = await _context.Pedido.FindAsync(id);
            if (pedido == null)
                return NotFound();

            _context.Pedido.Remove(pedido);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

