using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;
using System.ComponentModel.DataAnnotations;

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
        public async Task<IActionResult> CreateEmpleado([FromBody] CreateEmpleadoDto datos)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var usuarioExiste = await _context.Empleado.AnyAsync(e => e.Usuario == datos.Usuario);
            if (usuarioExiste) return BadRequest(new { message = "El usuario ya existe" });

            var correoExiste = await _context.Empleado.AnyAsync(e => e.Correo_E == datos.Correo_E);
            if (correoExiste) return BadRequest(new { message = "El correo ya existe" });

            var salt = BCrypt.Net.BCrypt.GenerateSalt();
            var empleado = new Empleado
            {
                Nombre = datos.Nombre,
                Apellido_Paterno = datos.Apellido_Paterno,
                Apellido_Materno = datos.Apellido_Materno,
                Telefono = datos.Telefono,
                Correo_E = datos.Correo_E,
                Usuario = datos.Usuario,
                Salt = salt,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(datos.PasswordHash, salt),
                Rol_Empleado = NormalizeEmpleadoRole(datos.Rol_Empleado)
            };

            _context.Empleado.Add(empleado);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Empleado registrado correctamente", id = empleado.ID_Empleado });
        }

        [HttpPut("empleados/{id}")]
        public async Task<IActionResult> UpdateEmpleado(int id, [FromBody] UpdateEmpleadoDto datos)
        {
            var empleado = await _context.Empleado.FindAsync(id);
            if (empleado == null) return NotFound(new { message = "Empleado no encontrado" });
            empleado.Nombre = datos.Nombre;
            empleado.Apellido_Paterno = datos.Apellido_Paterno;
            empleado.Apellido_Materno = datos.Apellido_Materno;
            empleado.Correo_E = datos.Correo_E;
            empleado.Telefono = datos.Telefono;
            empleado.Usuario = datos.Usuario;
            empleado.Rol_Empleado = NormalizeEmpleadoRole(datos.Rol_Empleado);
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

        private static string NormalizeEmpleadoRole(string? role)
        {
            if (string.IsNullOrWhiteSpace(role))
                return "Empleado";

            var normalized = role.Trim();
            return normalized.Equals("Cocina", StringComparison.OrdinalIgnoreCase) ||
                   normalized.Equals("Cocinero", StringComparison.OrdinalIgnoreCase)
                ? "Cocinero"
                : "Empleado";
        }
    }

    public class CreateEmpleadoDto
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        public string Apellido_Paterno { get; set; } = string.Empty;

        public string? Apellido_Materno { get; set; }

        [Required]
        public string Telefono { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Correo_E { get; set; } = string.Empty;

        [Required]
        public string Usuario { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string Rol_Empleado { get; set; } = "Empleado";
    }

    public class UpdateEmpleadoDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Apellido_Paterno { get; set; } = string.Empty;
        public string? Apellido_Materno { get; set; }
        public string Telefono { get; set; } = string.Empty;
        public string Correo_E { get; set; } = string.Empty;
        public string Usuario { get; set; } = string.Empty;
        public string? PasswordHash { get; set; }
        public string Rol_Empleado { get; set; } = "Empleado";
    }
}
