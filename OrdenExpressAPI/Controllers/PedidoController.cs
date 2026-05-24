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
        public PedidoController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetPedidos() => await _context.Pedido.ToListAsync();

        [HttpGet("todos")]
        [Authorize(Roles = "Admin,Cocinero")]
        public async Task<ActionResult> GetTodosPedidos() {
            var pedidos = await _context.Pedido.Include(p => p.Cliente).Include(p => p.Detalles).ThenInclude(d => d.Producto)
                .OrderByDescending(p => p.Fecha).Select(p => new { p.ID_Pedido, p.ID_Cliente, p.Fecha, p.Estado, p.Total, p.Metodo_Pago,
                    Folio = GenerateFolio(p),
                    Cliente = p.Cliente == null ? null : new { p.Cliente.ID_Cliente, p.Cliente.Nombre, p.Cliente.Apellido_Paterno },
                    Detalles = p.Detalles.Select(d => new { d.ID_Detalle, d.ID_Producto, d.Cantidad, d.Total,
                        Producto = d.Producto == null ? null : new { d.Producto.ID_Producto, d.Producto.Nombre_P } }).ToList()
                }).ToListAsync();
            return Ok(pedidos);
        }

        [HttpGet("recepcion")]
        [Authorize(Roles = "Admin,Empleado")]
        public async Task<ActionResult> GetPedidosRecepcion() {
            var pedidos = await _context.Pedido.Include(p => p.Cliente).Include(p => p.Detalles).ThenInclude(d => d.Producto)
                .OrderByDescending(p => p.Fecha).Select(p => new { p.ID_Pedido, p.ID_Cliente, p.Fecha, p.Estado, p.Total, p.Metodo_Pago,
                    Folio = GenerateFolio(p),
                    Cliente = p.Cliente == null ? null : new { p.Cliente.ID_Cliente, p.Cliente.Nombre, p.Cliente.Apellido_Paterno },
                    Detalles = p.Detalles.Select(d => new { d.ID_Detalle, d.ID_Producto, d.Cantidad, d.Total,
                        Producto = d.Producto == null ? null : new { d.Producto.ID_Producto, d.Producto.Nombre_P } }).ToList()
                }).ToListAsync();
            return Ok(pedidos);
        }

        [HttpGet("folio/{folio}")]
        [Authorize(Roles = "Admin,Empleado")]
        public async Task<ActionResult> GetPedidoPorFolio(string folio) {
            var pedidos = await _context.Pedido.Include(p => p.Cliente).Include(p => p.Detalles).ThenInclude(d => d.Producto)
                .Where(p => GenerateFolio(p).Contains(folio)).OrderByDescending(p => p.Fecha)
                .Select(p => new { p.ID_Pedido, p.ID_Cliente, p.Fecha, p.Estado, p.Total, p.Metodo_Pago,
                    Folio = GenerateFolio(p),
                    Cliente = p.Cliente == null ? null : new { p.Cliente.ID_Cliente, p.Cliente.Nombre, p.Cliente.Apellido_Paterno },
                    Detalles = p.Detalles.Select(d => new { d.ID_Detalle, d.ID_Producto, d.Cantidad, d.Total,
                        Producto = d.Producto == null ? null : new { d.Producto.ID_Producto, d.Producto.Nombre_P } }).ToList()
                }).ToListAsync();
            return Ok(pedidos);
        }

        [HttpPut("cobrar/{id}")]
        [Authorize(Roles = "Admin,Empleado")]
        public async Task<IActionResult> CobrarPedido(int id) {
            var pedido = await _context.Pedido.FindAsync(id);
            if (pedido == null) return NotFound(new { message = "Pedido no encontrado" });
            if (pedido.Metodo_Pago != "Efectivo") return BadRequest(new { message = "Solo pedidos en Efectivo" });
            if (pedido.Estado == "Pagado" || pedido.Estado == "Cancelado") return BadRequest(new { message = "Ya cobrado o cancelado" });
            pedido.Estado = "Pagado";
            await _context.SaveChangesAsync();
            var recibo = await BuildReciboByIdAsync(id);
            return Ok(new { message = "Pedido cobrado", Recibo = recibo });
        }

        [HttpPut("entregar/{id}")]
        [Authorize(Roles = "Admin,Empleado")]
        public async Task<IActionResult> EntregarPedido(int id) {
            var pedido = await _context.Pedido.FindAsync(id);
            if (pedido == null) return NotFound(new { message = "Pedido no encontrado" });
            if (pedido.Estado == "Cancelado") return BadRequest(new { message = "No se puede entregar" });
            if (pedido.Metodo_Pago == "Efectivo" && pedido.Estado == "Pendiente") return BadRequest(new { message = "No se puede entregar un pedido en efectivo sin cobrar" });
            pedido.Estado = "Entregado";
            await _context.SaveChangesAsync();
            return Ok(new { message = "Pedido entregado" });
        }

        [HttpGet("cliente/{id}")]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetPedidosCliente(int id) =>
            Ok(await _context.Pedido.Where(p => p.ID_Cliente == id).OrderByDescending(p => p.Fecha).ToListAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<Pedido>> GetPedido(int id) {
            var pedido = await _context.Pedido.Include(p => p.Cliente).Include(p => p.Detalles).ThenInclude(d => d.Producto).FirstOrDefaultAsync(p => p.ID_Pedido == id);
            if (pedido == null) return NotFound();
            return pedido;
        }

        [HttpGet("recibo/{id}")]
        public async Task<ActionResult<ReciboPedidoDto>> GetRecibo(int id) {
            var pedido = await _context.Pedido.Include(p => p.Cliente).Include(p => p.Detalles).ThenInclude(d => d.Producto).FirstOrDefaultAsync(p => p.ID_Pedido == id);
            if (pedido == null) return NotFound(new { message = "Pedido no encontrado" });
            return Ok(BuildRecibo(pedido));
        }

        [HttpPost("crear")]
        public async Task<IActionResult> CrearPedido([FromBody] CrearPedidoDto dto) {
            if (dto.Productos == null || dto.Productos.Count == 0) return BadRequest(new ApiErrorResponse { StatusCode = 400, Message = "Sin productos" });
            using var transaction = await _context.Database.BeginTransactionAsync();
            try {
                var pedido = new Pedido { ID_Cliente = dto.ID_Cliente, Fecha = DateTime.Now, Estado = "Pendiente", Total = dto.Total, Metodo_Pago = dto.Metodo_Pago ?? "Efectivo" };
                _context.Pedido.Add(pedido); await _context.SaveChangesAsync();
                decimal totalCalculado = 0;
                foreach (var prodDto in dto.Productos) {
                    var producto = await _context.Producto.FindAsync(prodDto.ID_Producto);
                    if (producto == null) { await transaction.RollbackAsync(); return NotFound(new ApiErrorResponse { Code = "404", Message = $"Producto #{prodDto.ID_Producto} no encontrado" }); }
                    if (producto.Cantidad_Disponible < prodDto.Cantidad) { await transaction.RollbackAsync(); return BadRequest(new ApiErrorResponse { Code = "400", Message = $"Stock insuficiente para {producto.Nombre_P}" }); }
                    var detalle = new DetallePedido { ID_Pedido = pedido.ID_Pedido, ID_Producto = prodDto.ID_Producto, Cantidad = prodDto.Cantidad, Total = prodDto.Cantidad * prodDto.Precio_Unitario };
                    _context.DetallePedido.Add(detalle); totalCalculado += detalle.Total;
                    producto.Cantidad_Disponible -= prodDto.Cantidad;
                    if (producto.Cantidad_Disponible <= 0) producto.Imagen = null;
                }
                if (Math.Abs(pedido.Total - totalCalculado) > 0.01m) { await transaction.RollbackAsync(); return BadRequest(new ApiErrorResponse { Code = "400", Message = "Total no coincide" }); }
                await _context.SaveChangesAsync(); await transaction.CommitAsync();
                var recibo = await BuildReciboByIdAsync(pedido.ID_Pedido);
                return Ok(new { Message = "Pedido creado", IdPedido = pedido.ID_Pedido, Folio = GenerateFolio(pedido), Recibo = recibo });
            } catch (Exception ex) { await transaction.RollbackAsync(); return StatusCode(500, new ApiErrorResponse { Code = "500", Message = "Error interno", Detail = ex.Message }); }
        }

        public static string GenerateFolio(Pedido pedido) => $"PB-{pedido.Fecha:yyyyMMdd}-{pedido.ID_Pedido:D5}";

        public static ReciboPedidoDto BuildRecibo(Pedido pedido) => new ReciboPedidoDto {
            IdPedido = pedido.ID_Pedido, Folio = GenerateFolio(pedido), Fecha = pedido.Fecha, Estado = pedido.Estado,
            MetodoPago = pedido.Metodo_Pago, Total = pedido.Total,
            Cliente = pedido.Cliente == null ? "Cliente" : $"{pedido.Cliente.Nombre} {pedido.Cliente.Apellido_Paterno}".Trim(),
            Productos = pedido.Detalles.Select(d => new ReciboDetalleDto { Nombre = d.Producto?.Nombre_P ?? $"Producto #{d.ID_Producto}", Cantidad = d.Cantidad, PrecioUnitario = d.Cantidad > 0 ? d.Total / d.Cantidad : 0, Total = d.Total }).ToList()
        };

        private async Task<ReciboPedidoDto?> BuildReciboByIdAsync(int idPedido) {
            var pedido = await _context.Pedido.Include(p => p.Cliente).Include(p => p.Detalles).ThenInclude(d => d.Producto).FirstOrDefaultAsync(p => p.ID_Pedido == idPedido);
            return pedido == null ? null : BuildRecibo(pedido);
        }

        [HttpPut("estado/{id}")]
        [Authorize(Roles = "Admin,Cocinero")]
        public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoDto dto) {
            var pedido = await _context.Pedido.FindAsync(id);
            if (pedido == null) return NotFound(new { message = "Pedido no encontrado" });
            var estadosValidos = new[] { "Pendiente", "En Preparación", "Listo", "Entregado", "Cancelado" };
            if (!estadosValidos.Contains(dto.nuevoEstado)) return BadRequest(new { message = "Estado no válido" });
            pedido.Estado = dto.nuevoEstado; pedido.Fecha = DateTime.Now; await _context.SaveChangesAsync();
            return Ok(new { message = "Estado actualizado" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPedido(int id, Pedido pedido) { if (id != pedido.ID_Pedido) return BadRequest(); _context.Entry(pedido).State = EntityState.Modified; await _context.SaveChangesAsync(); return NoContent(); }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePedido(int id) { var pedido = await _context.Pedido.FindAsync(id); if (pedido == null) return NotFound(); _context.Pedido.Remove(pedido); await _context.SaveChangesAsync(); return NoContent(); }
    }
}
