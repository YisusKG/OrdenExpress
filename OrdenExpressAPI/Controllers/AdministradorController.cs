using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models.DTOs;

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
        
        /// <summary>
        /// Inicializa una nueva instancia del controlador de administradores.
        /// </summary>
        /// <param name="context">
        /// Instancia del contexto de base de datos utilizada para acceder
        /// a la información persistida del sistema.
        /// </param>
        public AdministradorController(AppDbContext context)
        {
            _context = context;
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
                .FirstOrDefaultAsync(x =>
                    x.Usuario == dto.Usuario &&
                    x.PasswordHash == dto.Contraseña);

            if (admin == null)
                return Unauthorized(new { message = "Usuario o contraseña incorrectos" });

            return Ok(new { message = "Login exitoso" });
        }
    }
}
