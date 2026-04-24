# COMPLEMENTO DE ESTRUCTURA - Archivos Faltantes

Este documento complementa el archivo ESTRUCTURA_COMPLETA_PROYECTO.md con los archivos que faltan.

---

## 📁 Archivos de Configuración

### db/config.js (Configuración de SQL Server para Node.js)

```javascript
module.exports = {
  user: 'sa',
  password: 'administradorbasededatos',
  server: 'localhost',           // o el nombre del host de tu SQL Server
  database: 'OrdenExpress',
  options: {
    encrypt: false,              // poner en true si estás en Azure
    trustServerCertificate: true
  },
  port: 1433                     // puerto por defecto de SQL Server
};
```

---

## 📦 BACKEND .NET - Controladores Completos

### OrdenExpressAPI/Controllers/AdministradorController.cs

```csharp
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
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var admin = await _context.Administrador
                .FirstOrDefaultAsync(x =>
                    x.Usuario == dto.Usuario &&
                    x.Contraseña == dto.Contraseña);

            if (admin == null)
                return Unauthorized(new { message = "Usuario o contraseña incorrectos" });

            return Ok(new { message = "Login exitoso" });
        }
    }
}
```

---

### OrdenExpressAPI/Controllers/ClienteController.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;
using OrdenExpressAPI.Models.DTOs;
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
    public class ClienteController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IFileService _fileService;
        
        /// <summary>
        /// Inicializa una nueva instancia del controlador de clientes.
        /// </summary>
        /// <param name="context">Contexto de base de datos.</param>
        /// <param name="fileService">Servicio encargado de la gestión de archivos.</param>
        public ClienteController(AppDbContext context, IFileService fileService)
        {
            _context = context;
            _fileService = fileService;
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
        [HttpPost]
        public async Task<IActionResult> Registrar([FromBody] Cliente cliente)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _context.Cliente.AddAsync(cliente);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cliente registrado correctamente" });
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
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
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
        /// Actualiza la fotografía de perfil de un cliente específico.
        /// </summary>
        /// <param name="id">Identificador único del cliente.</param>
        /// <param name="foto">Archivo de imagen enviado desde el cliente.</param>
        /// <returns>
        /// 200 OK si la actualización es correcta.
        /// 404 NotFound si el cliente no existe.
        /// </returns<response code="200>
        /// ">Foto actualizada correctamente.</response>
        /// <response code="404">Cliente>
        [Http no encontrado.</responsePut("foto/{id}")]
        public> ActualizarFoto async Task<IActionResult(int id, IFormFile foto)
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
```

---

### OrdenExpressAPI/Controllers/PedidoController.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;
using OrdenExpressAPI.Models.DTOs;

namespace OrdenExpressAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
                .ToListAsync();

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
                .FirstOrDefaultAsync(p => p.ID_Pedido == id);

            if (pedido == null)
                return NotFound();

            return pedido;
        }

        // POST: api/Pedido/crear - Crear pedido con detalles
        [HttpPost("crear")]
        public async Task<IActionResult> CrearPedido([FromBody] CrearPedidoDTO dto)
        {
            if (dto.Productos == null || dto.Productos.Count == 0)
            {
                return BadRequest(new { message = "El pedido debe tener productos" });
            }

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

            // Crear los detalles del pedido
            foreach (var prod in dto.Productos)
            {
                var detalle = new Detalle_Pedido
                {
                    ID_Pedido = pedido.ID_Pedido,
                    ID_Producto = prod.ID_Producto,
                    Cantidad = prod.Cantidad,
                    Total = prod.Cantidad * prod.Precio_Unitario
                };

                _context.Detalle_Pedido.Add(detalle);

                // Actualizar inventario
                var producto = await _context.Producto.FindAsync(prod.ID_Producto);
                if (producto != null)
                {
                    producto.Cantidad_Disponible -= prod.Cantidad;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Pedido creado correctamente", idPedido = pedido.ID_Pedido });
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
```

---

### OrdenExpressAPI/Controllers/ProductoController.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;
using OrdenExpressAPI.Services;

namespace OrdenExpressAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
        public async Task<IActionResult> ObtenerMenu()
        {
            var productos = await _context.Producto
                .Where(p => p.Imagen != null)
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

            var fileName = await _fileService.SaveFileAsync(p.Imagen, "fotos");

            if (fileName != null)
                producto.Imagen = fileName;

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
            producto.Descripcion = productoActualizado.Descripcion;
            producto.Cantidad_Min = productoActualizado.Cantidad_Min;
            producto.Cantidad_Max = productoActualizado.Cantidad_Max;
            producto.Costo_Base = productoActualizado.Costo_Base;
            producto.Porcentaje_Gan = productoActualizado.Porcentaje_Gan;
            producto.Precio_Venta = productoActualizado.Costo_Base + 
                (productoActualizado.Costo_Base * productoActualizado.Porcentaje_Gan / 100);

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
```

---

### OrdenExpressAPI/Data/AppDbContext.cs

```csharp
using Microsoft.EntityFrameworkCore;
using OrdenExpressAPI.Models;

namespace OrdenExpressAPI.Data
{
    /// <summary>
    /// Contexto principal de la base de datos del sistema OrdenExpress.
    /// </summary>
    /// <remarks>
    /// Hereda de DbContext y representa la sesión con la base de datos.
    /// Permite realizar operaciones CRUD mediante Entity Framework Core.
    /// Cada DbSet corresponde a una tabla dentro del modelo relacional.
    /// </remarks>
    public class AppDbContext : DbContext
    {
        /// <summary>
        /// Inicializa una nueva instancia del contexto.
        /// </summary>
        /// <param name="options">Opciones de configuración del contexto.</param>
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        /// <summary>Entidad que representa la tabla de Administradores.</summary>
        public DbSet<Administrador> Administrador { get; set; }

        /// <summary>Entidad que representa la tabla de Clientes.</summary>
        public DbSet<Cliente> Cliente { get; set; }

        /// <summary>Entidad que representa la tabla de Productos.</summary>
        public DbSet<Producto> Producto { get; set; }

        /// <summary>Entidad que representa la tabla de Pedidos.</summary>
        public DbSet<Pedido> Pedido { get; set; }

        /// <summary>Entidad que representa la tabla de Detalles de Pedidos.</summary>
        public DbSet<Detalle_Pedido> Detalle_Pedido { get; set; }
    }
}
```

---

### OrdenExpressAPI/Models/DTOs/PedidoDTO.cs

```csharp
using System.ComponentModel.DataAnnotations;

namespace OrdenExpressAPI.Models.DTOs
{
    public class CrearPedidoDTO
    {
        public int ID_Cliente { get; set; }
        public string Metodo_Pago { get; set; } = "Efectivo";
        public decimal Total { get; set; }
        public List<DetallePedidoDTO> Productos { get; set; } = new();
    }

    public class DetallePedidoDTO
    {
        public int ID_Producto { get; set; }
        public int Cantidad { get; set; }
        public decimal Precio_Unitario { get; set; }
    }

    public class ProductoMenuDTO
    {
        public int ID_Producto { get; set; }
        public string Nombre_P { get; set; } = string.Empty;
        public string? Clasificacion { get; set; }
        public decimal Precio_Venta { get; set; }
        public string? Imagen { get; set; }
    }
}
```

---

### OrdenExpressAPI/Models/DTOs/LoginDTO.cs (Versión corregida)

```csharp
using System.ComponentModel.DataAnnotations;

namespace OrdenExpressAPI.Models.DTOs
{
    /// <summary>
    /// Objeto de Transferencia de Datos (DTO) utilizado para el proceso de autenticación.
    /// </summary>
    /// <remarks>
    /// Esta clase encapsula las credenciales necesarias para validar
    /// el acceso de un usuario al sistema.
    /// Se utiliza tanto para administradores como para clientes.
    /// </remarks>
    public class LoginDTO
    {
        /// <summary>
        /// Nombre de usuario registrado en el sistema.
        /// </summary>
        /// <value>Cadena de texto obligatoria.</value>
        [Required]
        public string Usuario { get; set; }

        /// <summary>
        /// Contraseña asociada al usuario.
        /// </summary>
        /// <value>Cadena de texto obligatoria.</value>
        [Required]
        public string Contraseña { get; set; }
    }
}
```

---

## 📋 Resumen de Archivos del Proyecto

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | server.js | Servidor principal Node.js |
| 2 | db/config.js | Configuración SQL Server |
| 3 | db/script_base_datos.sql | Script de base de datos |
| 4 | routes/cliente.js | Rutas API de clientes |
| 5 | routes/pedido.js | Rutas API de pedidos |
| 6 | routes/producto.js | Rutas API de productos |
| 7 | routes/reportes.js | Rutas API de reportes |
| 8 | routes/pagos.js | Rutas API de pagos (Stripe) |
| 9 | package.json | Dependencias Node.js |
| 10 | OrdenExpressAPI/Models/Cliente.cs | Modelo Cliente |
| 11 | OrdenExpressAPI/Models/Pedido.cs | Modelo Pedido + Detalle_Pedido |
| 12 | OrdenExpressAPI/Models/Producto.cs | Modelo Producto |
| 13 | OrdenExpressAPI/Models/Administrador.cs | Modelo Administrador |
| 14 | OrdenExpressAPI/Models/DTOs/LoginDTO.cs | DTO Login |
| 15 | OrdenExpressAPI/Models/DTOs/PedidoDTO.cs | DTO Pedido |
| 16 | OrdenExpressAPI/Controllers/ClienteController.cs | Controlador Cliente |
| 17 | OrdenExpressAPI/Controllers/AdministradorController.cs | Controlador Administrador |
| 18 | OrdenExpressAPI/Controllers/PedidoController.cs | Controlador Pedido |
| 19 | OrdenExpressAPI/Controllers/ProductoController.cs | Controlador Producto |
| 20 | OrdenExpressAPI/Data/AppDbContext.cs | Contexto EF Core |
| 21 | OrdenExpressAPI/Services/IFileService.cs | Interfaz FileService |
| 22 | OrdenExpressAPI/Services/FileService.cs | Implementación FileService |

