using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdenExpressAPI.Data;

namespace OrdenExpressAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "Admin")]
    public class ReportesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ReportesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/reportes/ventas/diarias
        [HttpGet("ventas/diarias")]
        public async Task<IActionResult> VentasDiarias()
        {
            var hoy = DateTime.Today;
            var ventas = await _context.Pedido
                .Where(p => p.Fecha.Date == hoy && p.Estado == "Entregado")
                .GroupBy(p => 1)
                .Select(g => new { Total = g.Sum(p => p.Total), Pedidos = g.Count() })
                .FirstOrDefaultAsync() ?? new { Total = 0m, Pedidos = 0 };
            return Ok(ventas);
        }

        // GET: api/reportes/ventas/semana
        [HttpGet("ventas/semana")]
        public async Task<IActionResult> VentasSemana()
        {
            var hace7Dias = DateTime.Today.AddDays(-6);
            var ventas = await _context.Pedido
                .Where(p => p.Fecha.Date >= hace7Dias && p.Estado == "Entregado")
                .GroupBy(p => p.Fecha.Date)
                .Select(g => new {
                    Fecha = g.Key,
                    Total = g.Sum(p => p.Total),
                    Pedidos = g.Count()
                })
                .OrderBy(g => g.Fecha)
                .ToListAsync();
            return Ok(ventas);
        }

        // GET: api/reportes/ventas/mes
        [HttpGet("ventas/mes")]
        public async Task<IActionResult> VentasMes()
        {
            var hace30Dias = DateTime.Today.AddDays(-29);
            var ventas = await _context.Pedido
                .Where(p => p.Fecha.Date >= hace30Dias && p.Estado == "Entregado")
                .GroupBy(p => new { p.Fecha.Year, p.Fecha.Month })
                .Select(g => new {
                    Anio = g.Key.Year,
                    Mes = g.Key.Month,
                    Total = g.Sum(p => p.Total),
                    Pedidos = g.Count()
                })
                .OrderBy(g => g.Anio).ThenBy(g => g.Mes)
                .ToListAsync();
            return Ok(ventas);
        }

        // GET: api/reportes/productos/mas-vendidos
        [HttpGet("productos/mas-vendidos")]
        public async Task<IActionResult> ProductosMasVendidos()
        {
            var productos = await _context.DetallePedido
                .Include(d => d.Producto)
                .Where(d => d.Producto != null)
                .GroupBy(d => new { d.ID_Producto, d.Producto!.Nombre_P })
                .Select(g => new {
                    ID_Producto = g.Key.ID_Producto,
                    Nombre = g.Key.Nombre_P,
                    CantidadVendida = g.Sum(d => d.Cantidad),
                    TotalGenerado = g.Sum(d => d.Total)
                })
                .OrderByDescending(g => g.CantidadVendida)
                .Take(10)
                .ToListAsync()!; // Null-forgiving: always returns list
            return Ok(productos);
        }

        // GET: api/reportes/pedidos/recientes
        [HttpGet("pedidos/recientes")]
        public async Task<IActionResult> PedidosRecientes()
        {
            var pedidos = await _context.Pedido
                .Include(p => p.Cliente)
                .OrderByDescending(p => p.Fecha)
                .Take(20)
                .Select(p => new {
                    p.ID_Pedido,
                    Cliente = p.Cliente != null ? p.Cliente.Nombre : "N/A",
                    p.Fecha,
                    p.Estado,
                    p.Total,
                    p.Metodo_Pago
                })
                .ToListAsync();
            return Ok(pedidos);
        }

        // GET: api/reportes/clientes
        [HttpGet("clientes")]
        public async Task<IActionResult> ClientesRegistrados()
        {
            var clientes = await _context.Cliente
                .Select(c => new {
                    c.ID_Cliente,
                    c.Nombre,
                    c.Correo_E,
                    c.Telefono,
                    TotalPedidos = _context.Pedido.Count(p => p.ID_Cliente == c.ID_Cliente),
                    TotalGastado = _context.Pedido
                        .Where(p => p.ID_Cliente == c.ID_Cliente && p.Estado == "Entregado")
                        .Sum(p => (decimal?)p.Total) ?? 0
                })
                .OrderByDescending(c => c.TotalGastado)
                .ToListAsync();
            return Ok(clientes);
        }
    }
}

