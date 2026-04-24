using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;

namespace OrdenExpressAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "Admin")]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;
        public UsuariosController(AppDbContext context) { _context = context; }

        // ── CLIENTES ──
        [HttpGet("clientes")]
        public async Task<IActionResult> GetClientes()
        {
            var clientes = await _context.Cliente
                .Select(c => new {
                    c.ID_Cliente, c.Nombre, c.Apellido_Paterno, c.Apellido_Materno,
                    c.Correo_E, c.Telefono, c.Usuario
                }).ToListAsync();
            return Ok(clientes);
        }

        [HttpDelete("clientes/{id}")]
        public async Task<IActionResult> DeleteCliente(int id)
        {
            var cliente = await _context.Cliente.FindAsync(id);
            if (cliente == null) return NotFound(new { message = "Cliente no encontrado" });
            _context.Cliente.Remove(cliente);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cliente eliminado" });
        }

        // ── EMPLEADOS ──
        [HttpGet("empleados")]
        public async Task<IActionResult> GetEmpleados()
        {
            var empleados = await _context.Empleado
                .Select(e => new {
                    e.ID_Empleado, e.Nombre, e.Apellido_Paterno, e.Apellido_Materno,
                    e.Correo_E, e.Telefono, e.Usuario, e.Rol_Empleado
                }).ToListAsync();
            return Ok(empleados);
        }

        [HttpPost("empleados")]
        public async Task<IActionResult> CreateEmpleado([FromBody] Empleado empleado)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            empleado.Salt = BCrypt.Net.BCrypt.GenerateSalt();
            empleado.PasswordHash = BCrypt.Net.BCrypt.HashPassword(empleado.PasswordHash, empleado.Salt);
            _context.Empleado.Add(empleado);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Empleado registrado correctamente" });
        }

        [HttpPut("empleados/{id}")]
        public async Task<IActionResult> UpdateEmpleado(int id, [FromBody] Empleado datos)
        {
            var empleado = await _context.Empleado.FindAsync(id);
            if (empleado == null) return NotFound(new { message = "Empleado no encontrado" });
            empleado.Nombre = datos.Nombre;
            empleado.Apellido_Paterno = datos.Apellido_Paterno;
            empleado.Apellido_Materno = datos.Apellido_Materno;
            empleado.Correo_E = datos.Correo_E;
            empleado.Telefono = datos.Telefono;
            empleado.Rol_Empleado = datos.Rol_Empleado;
            if (!string.IsNullOrEmpty(datos.PasswordHash))
            {
                empleado.Salt = BCrypt.Net.BCrypt.GenerateSalt();
                empleado.PasswordHash = BCrypt.Net.BCrypt.HashPassword(datos.PasswordHash, empleado.Salt);
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Empleado actualizado" });
        }

        [HttpDelete("empleados/{id}")]
        public async Task<IActionResult> DeleteEmpleado(int id)
        {
            var empleado = await _context.Empleado.FindAsync(id);
            if (empleado == null) return NotFound(new { message = "Empleado no encontrado" });
            _context.Empleado.Remove(empleado);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Empleado eliminado" });
        }
    }
}
