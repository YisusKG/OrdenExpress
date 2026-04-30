using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;
using OrdenExpressAPI.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using OrdenExpressAPI.Services;

namespace OrdenExpressAPI.Controllers
{
    /// <summary>
    /// Controlador responsable de la gestión de clientes.
    /// </summary>
    /// <remarks>
    /// Permite realizar operaciones como:
    /// - Registro de nuevos clientes.
    /// - Autenticación.
    /// - Actualización de fotografía de perfil.
    /// </remarks>
[Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "Cliente")]
    public class ClienteController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IFileService _fileService;
        private readonly ILogger<ClienteController> _logger;
        
        /// <summary>
        /// Inicializa una nueva instancia del controlador de clientes.
        /// </summary>
        /// <param name="context">Contexto de base de datos.</param>
        /// <param name="fileService">Servicio encargado de la gestión de archivos.</param>
        /// <param name="logger">Logger para registro de eventos y errores.</param>
        public ClienteController(AppDbContext context, IFileService fileService, ILogger<ClienteController> logger)
        {
            _context = context;
            _fileService = fileService;
            _logger = logger;
        }

        /// <summary>
        /// Registra un nuevo cliente en el sistema.
        /// </summary>
        /// <param name="cliente">Objeto que contiene la información del cliente a registrar.</param>
        /// <returns>
        /// 200 OK si el registro es exitoso.
        /// 400 BadRequest si los datos no cumplen con las validaciones.
        /// </returns>
        /// <response code="200">Cliente registrado correctamente.</response>
        /// <response code="400">Datos inválidos.</response>
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Registrar([FromBody] Cliente cliente)
        {
            try 
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                await _context.Cliente.AddAsync(cliente);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Cliente registrado correctamente: {Usuario}", cliente.Usuario);
                return Ok(new { message = "Cliente registrado correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar cliente. Usuario: {Usuario}, Error: {Message}", cliente?.Usuario, ex.Message);
                if (ex.InnerException != null)
                    _logger.LogError(ex.InnerException, "Inner exception: {Message}", ex.InnerException.Message);
                    
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Permite a un cliente iniciar sesión en el sistema.
        /// </summary>
        /// <param name="dto">Credenciales del cliente.</param>
        /// <returns>
        /// 200 OK si la autenticación es correcta.
        /// 401 Unauthorized si las credenciales son inválidas.
        /// </returns>
        /// <response code="200">Login exitoso.</response>
        /// <response code="401">Credenciales incorrectas.</response>
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var cliente = await _context.Cliente
                .FirstOrDefaultAsync(x =>
                    x.Usuario == dto.Usuario &&
                    x.Contraseña == dto.Contraseña);

            if (cliente == null)
                return Unauthorized(new { message = "Usuario o contraseña incorrectos" });

            return Ok(new { message = "Login exitoso", idCliente = cliente.ID_Cliente });
        }

        /// <summary>
        /// Obtiene un cliente por su ID.
        /// </summary>
        /// <param name="id">Identificador único del cliente.</param>
        /// <returns>Datos del cliente.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> Obtener(int id)
        {
            var cliente = await _context.Cliente.FindAsync(id);
            if (cliente == null)
                return NotFound(new { message = "Cliente no encontrado" });
            return Ok(cliente);
        }

        /// <summary>
        /// Actualiza los datos de un cliente.
        /// </summary>
        /// <param name="id">Identificador único del cliente.</param>
        /// <param name="data">Datos actualizados del cliente.</param>
        /// <returns>Confirmación de actualización.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] Cliente data)
        {
            var cliente = await _context.Cliente.FindAsync(id);
            if (cliente == null)
                return NotFound(new { message = "Cliente no encontrado" });

            cliente.Nombre = data.Nombre ?? cliente.Nombre;
            cliente.Apellido_Paterno = data.Apellido_Paterno ?? cliente.Apellido_Paterno;
            cliente.Apellido_Materno = data.Apellido_Materno ?? cliente.Apellido_Materno;
            cliente.Telefono = data.Telefono ?? cliente.Telefono;
            cliente.Correo_E = data.Correo_E ?? cliente.Correo_E;
            cliente.Usuario = data.Usuario ?? cliente.Usuario;
            if (!string.IsNullOrEmpty(data.Contraseña))
                cliente.Contraseña = BCrypt.Net.BCrypt.HashPassword(data.Contraseña);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cliente actualizado correctamente" });
        }

        /// <summary>
        /// Actualiza la fotografía de perfil de un cliente específico.
        /// </summary>
        /// <param name="id">Identificador único del cliente.</param>
        /// <param name="foto">Archivo de imagen enviado desde el cliente.</param>
        /// <returns>
        /// 200 OK si la actualización es correcta.
        /// 404 NotFound si el cliente no existe.
        /// </returns>
        /// <response code="200">Foto actualizada correctamente.</response>
        /// <response code="404">Cliente no encontrado.</response>
        [HttpPut("foto/{id}")]
        public async Task<IActionResult> ActualizarFoto(int id, IFormFile foto)
        {
            var cliente = await _context.Cliente.FindAsync(id);

            if (cliente == null)
                return NotFound(new { message = "Cliente no encontrado" });

            var fileName = await _fileService.SaveFileAsync(foto, "perfil");

            if (fileName != null)
                cliente.Foto_Perfil = fileName;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Foto actualizada correctamente" });
        }
    }
}
