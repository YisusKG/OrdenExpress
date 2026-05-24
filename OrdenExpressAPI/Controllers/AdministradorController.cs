using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace OrdenExpressAPI.Controllers
{
    /// <summary>
    /// Controlador encargado de la gestión y autenticación de administradores.
    /// </summary>
    /// <remarks>
    /// Este controlador forma parte del módulo de seguridad del sistema.
    /// Permite validar credenciales contra la base de datos utilizando Entity Framework.
    /// </remarks>
    [Route("api/[controller]")]
    [ApiController]
    public class AdministradorController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        
        /// <summary>
        /// Inicializa una nueva instancia del controlador de administradores.
        /// </summary>
        /// <param name="context">
        /// Instancia del contexto de base de datos utilizada para acceder
        /// a la información persistida del sistema.
        /// </param>
        public AdministradorController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
    
        /// <summary>
        /// Permite a un administrador iniciar sesión validando sus credenciales.
        /// </summary>
        /// <param name="dto">
        /// Objeto que contiene el nombre de usuario y contraseña enviados por el cliente.
        /// </param>
        /// <returns>
        /// Retorna un IActionResult que puede contener:
        /// 200 OK si la autenticación es exitosa,
        /// 401 Unauthorized si las credenciales son incorrectas,
        /// 400 BadRequest si los datos enviados no son válidos.
        /// </returns>
        /// <response code="200">Autenticación exitosa.</response>
        /// <response code="401">Credenciales inválidas.</response>
        /// <response code="400">Modelo de datos inválido.</response>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var admin = await _context.Administrador
                .FirstOrDefaultAsync(x => x.Usuario == dto.Usuario);

            if (admin == null || !PasswordMatches(dto.Contraseña, admin.PasswordHash))
                return Unauthorized(new { message = "Usuario o contraseña incorrectos" });

            var token = GenerateJwtToken(admin.ID_Administrador.ToString(), "Admin");
            return Ok(new { message = "Login exitoso", token, role = "Admin", id = admin.ID_Administrador });
        }

        private static bool PasswordMatches(string password, string storedPassword)
        {
            if (storedPassword == password)
                return true;

            try
            {
                return BCrypt.Net.BCrypt.Verify(password, storedPassword);
            }
            catch (BCrypt.Net.SaltParseException)
            {
                return false;
            }
        }

        private string GenerateJwtToken(string id, string role)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, id),
                new Claim(ClaimTypes.Role, role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"] ?? "SuperSecretKeyOrdenExpress2024!@#"));
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
