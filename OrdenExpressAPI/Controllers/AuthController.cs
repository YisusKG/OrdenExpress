using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using OrdenExpressAPI.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net; 
using OrdenExpressAPI.Models;
using OrdenExpressAPI.Models.DTOs;

namespace OrdenExpressAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private const string CREDENCIALES_INVALIDAS = "Credenciales inválidas";

        public AuthController(AppDbContext context, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("login-cliente")]
        public async Task<IActionResult> LoginCliente([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var cliente = await _context.Cliente
                .FirstOrDefaultAsync(x => x.Usuario == dto.Usuario);

            if (cliente == null || !BCrypt.Net.BCrypt.Verify(dto.Contraseña, cliente.Contraseña))
                return Unauthorized(new { message = CREDENCIALES_INVALIDAS });

            var token = GenerateJwtToken(cliente.ID_Cliente.ToString(), "Cliente");
            return Ok(new { token, role = "Cliente", id = cliente.ID_Cliente });
        }

        [HttpPost("login-admin")]
        public async Task<IActionResult> LoginAdmin([FromBody] LoginDto dto)
        {
            var admin = await _context.Administrador
                .FirstOrDefaultAsync(x => x.Usuario == dto.Usuario);

            if (admin == null)
                return Unauthorized(new { message = CREDENCIALES_INVALIDAS });

            _logger.LogWarning("Intento de login admin fallido para usuario: {Usuario}", dto.Usuario);

            // Demo: Plain text OR hashed password for admin/admin
            if (admin.PasswordHash == "admin" || BCrypt.Net.BCrypt.Verify("admin", admin.PasswordHash))
            {
                var token = GenerateJwtToken(admin.ID_Administrador.ToString(), "Admin");
                return Ok(new { token, role = "Admin", id = admin.ID_Administrador });
            }

            return Unauthorized(new { message = "Credenciales inválidas" });
        }

        [HttpPost("register-cliente")]
        public async Task<IActionResult> RegisterCliente([FromBody] Cliente cliente)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            cliente.Contraseña = BCrypt.Net.BCrypt.HashPassword(cliente.Contraseña);
            _context.Cliente.Add(cliente);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cliente registrado" });
        }

        [HttpPost("login-empleado")]
        public async Task<IActionResult> LoginEmpleado([FromBody] LoginDto dto)
        {
            var empleado = await _context.Empleado
                .FirstOrDefaultAsync(x => x.Usuario == dto.Usuario);

            if (empleado == null || !BCrypt.Net.BCrypt.Verify(dto.Contraseña, empleado.PasswordHash))
                return Unauthorized(new { message = "Credenciales inválidas" });

            var token = GenerateJwtToken(empleado.ID_Empleado.ToString(), "Empleado");
            return Ok(new { token, role = "Empleado", id = empleado.ID_Empleado });
        }

        [HttpPost("register-empleado")]
        public async Task<IActionResult> RegisterEmpleado([FromBody] Empleado empleado)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            empleado.Salt = BCrypt.Net.BCrypt.GenerateSalt();
            empleado.PasswordHash = BCrypt.Net.BCrypt.HashPassword(empleado.PasswordHash ?? "", empleado.Salt ?? "");
            empleado.Rol_Empleado = empleado.Rol_Empleado ?? "Cocina";
            _context.Empleado.Add(empleado);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Empleado registrado" });
        }

        private string GenerateJwtToken(string id, string role)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, id),
                new Claim(ClaimTypes.Role, role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "SuperSecretKeyOrdenExpress2024!@#"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

