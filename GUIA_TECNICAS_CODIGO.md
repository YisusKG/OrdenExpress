# Guía de Técnicas Implementadas en el Código

A continuación se presenta cada técnica con el código correspondiente y la explicación lista para la exposición.

---

## 🔵 1️⃣ IDENTIFICACIÓN DE MÓDULOS REUTILIZABLES

### 📦 AppDbContext

**Archivo:** `OrdenExpressAPI/Data/AppDbContext.cs`

**Código:**
```csharp
namespace OrdenExpressAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Administrador> Administrador { get; set; }
        public DbSet<Cliente> Cliente { get; set; }
        public DbSet<Producto> Producto { get; set; }
        public DbSet<Pedido> Pedido { get; set; }
    }
}
```

**Cómo explicarlo:**
> "Separé el acceso a datos en un módulo independiente llamado AppDbContext, lo que permite reutilizar la configuración de base de datos sin repetir código. Este contexto centraliza todas las operaciones con la base de datos y puede ser inyectado en cualquier controlador."

---

### 📦 DTOs (Data Transfer Objects)

**Archivo:** `OrdenExpressAPI/Controllers/DTOs/LoginDTO.cs`

**Código:**
```csharp
using System.ComponentModel.DataAnnotations;

namespace OrdenExpressAPI.Models.DTOs
{
    public class LoginDTO
    {
        [Required]
        public string Usuario { get; set; }

        [Required]
        public string Contraseña { get; set; }
    }
}
```

**Cómo explicarlo:**
> "Implementé DTOs como módulos de transferencia de datos reutilizables para evitar depender directamente del modelo principal. El LoginDTO se usa tanto en ClienteController como en AdministradorController, demostrando su reutilización."

---

### 📦 Inyección de Dependencias

**Archivo:** `OrdenExpressAPI/Controllers/ClienteController.cs`

**Código (en ClienteController):**
```csharp
public class ClienteController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IFileService _fileService;
    
    public ClienteController(AppDbContext context, IFileService fileService)
    {
        _context = context;
        _fileService = fileService;
    }
}
```

**Cómo explicarlo:**
> "Utilicé inyección de dependencias para desacoplar módulos y permitir que puedan reutilizarse o modificarse sin afectar otras partes del sistema. El servicio IFileService puede cambiarse fácilmente sin modificar el controlador."

---

## 🔵 2️⃣ TÉCNICAS DE LEGIBILIDAD APLICADAS

### 📝 Nombres descriptivos

**Archivo:** Múltiples archivos (ClienteController.cs, AppDbContext.cs, Producto.cs)

**Código:**
```csharp
public class ClienteController : ControllerBase { }
public class AppDbContext : DbContext { }
public class Producto { }
```

**Cómo explicarlo:**
> "Utilicé nombres descriptivos en clases y métodos para mejorar la comprensión del código. Cada nombre indica claramente su función: ClienteController gestiona clientes, AppDbContext es el contexto de la base de datos, etc."

---

### 📝 Separación clara de métodos

**Archivo:** `OrdenExpressAPI/Controllers/ClienteController.cs`

**Código:**
```csharp
[HttpPost]
public async Task<IActionResult> Registrar([FromBody] Cliente cliente) { }

[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginDTO dto) { }

[HttpPut("foto/{id}")]
public async Task<IActionResult> ActualizarFoto(int id, IFormFile foto) { }
```

**Cómo explicarlo:**
> "Cada método tiene una responsabilidad específica: Registrar para crear clientes, Login para autenticación, y ActualizarFoto para gestionar imágenes de perfil. Esto facilita su lectura y mantenimiento."

---

### 📝 Uso de Data Annotations

**Archivo:** `OrdenExpressAPI/Models/Producto.cs`

**Código (en Producto.cs):**
```csharp
public class Producto
{
    [Key]
    public int ID_Producto { get; set; }

    [Required]
    [StringLength(100)]
    public string Nombre_P { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Costo_Base { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Precio_Venta { get; set; }
}
```

**Cómo explicarlo:**
> "Las reglas de validación están declaradas directamente en el modelo mediante Data Annotations como [Required], [StringLength] y [Column], haciendo más claro el comportamiento del sistema sin necesidad de validaciones manuales."

---

## 🔵 3️⃣ TÉCNICAS DE ESTRUCTURACIÓN DEL CÓDIGO

### 🏗️ Separación en capas

**Estructura de carpetas:**
```
OrdenExpressAPI/
├── Controllers/       # Capa de presentación
├── Models/           # Capa de datos
├── Data/             # Capa de acceso a datos
└── Services/         # Capa de servicios
```

**Cómo explicarlo:**
> "Implementé una arquitectura en capas para dividir responsabilidades y reducir acoplamiento. Cada capa tiene una función específica: Controllers maneja las peticiones, Models define las entidades, Data proporciona el acceso a datos, y Services contiene la lógica de negocio."

---

### 🏗️ Patrón MVC

**Archivo:** `OrdenExpressAPI/Models/Cliente.cs` y `OrdenExpressAPI/Controllers/ClienteController.cs`

**Código (Modelo - Controlador):**
```csharp
// Modelo
public class Cliente 
{
    public int ID_Cliente { get; set; }
    public string Nombre { get; set; }
    public string Usuario { get; set; }
    public string Contraseña { get; set; }
}

// Controlador
[Route("api/[controller]")]
[ApiController]
public class ClienteController : ControllerBase { }
```

**Cómo explicarlo:**
> "Se utilizó el patrón MVC para organizar la lógica de negocio y la interacción con el cliente. Los Models definen la estructura de datos, los Controllers manejan las peticiones HTTP y la lógica de negocio."

---

### 🏗️ Uso de Entity Framework (ORM)

**Archivo:** `OrdenExpressAPI/Data/AppDbContext.cs`

**Código (en AppDbContext):**
```csharp
public class AppDbContext : DbContext
{
    public DbSet<Administrador> Administrador { get; set; }
    public DbSet<Cliente> Cliente { get; set; }
    public DbSet<Producto> Producto { get; set; }
    public DbSet<Pedido> Pedido { get; set; }
}
```

**Cómo explicarlo:**
> "Se utilizó Entity Framework Core como ORM para estructurar la persistencia de datos de forma orientada a objetos. Esto permite trabajar con tablas como propiedades del contexto sin escribir SQL."

---

## 🔵 4️⃣ GESTIÓN DE ERRORES

### ⚠️ Validación de ModelState

**Archivo:** `OrdenExpressAPI/Controllers/ClienteController.cs`

**Código:**
```csharp
if (!ModelState.IsValid)
    return BadRequest(ModelState);
```

**Cómo explicarlo:**
> "Se valida que los datos enviados cumplan las reglas de validación antes de procesarlos, retornando 400 BadRequest si hay errores."

---

### ⚠️ Uso de códigos HTTP

**Archivo:** `OrdenExpressAPI/Controllers/ClienteController.cs`

**Código:**
```csharp
return NotFound(new { message = "Cliente no encontrado" });
return Unauthorized(new { message = "Usuario o contraseña incorrectos" });
return BadRequest(ModelState);
return Ok(new { message = "Login exitoso" });
```

**Cómo explicarlo:**
> "Se implementaron respuestas HTTP adecuadas para informar correctamente al cliente el tipo de error: 404 para no encontrado, 401 para no autorizado, 400 para datos inválidos, y 200 para éxito."

---

### ⚠️ Validaciones de null

**Archivo:** `OrdenExpressAPI/Controllers/ClienteController.cs`

**Código:**
```csharp
var cliente = await _context.Cliente.FindAsync(id);
if (cliente == null)
    return NotFound(new { message = "Cliente no encontrado" });
```

**Cómo explicarlo:**
> "Se verifica la existencia del recurso antes de realizar operaciones sobre él, evitando errores de referencia nula y mejorando la experiencia del usuario."

---

## 🔵 5️⃣ TÉCNICAS DE AFINACIÓN DE CÓDIGO

### 🚀 Async / Await

**Archivo:** `OrdenExpressAPI/Controllers/ClienteController.cs`

**Código:**
```csharp
public async Task<IActionResult> Registrar([FromBody] Cliente cliente)
{
    await _context.Cliente.AddAsync(cliente);
    await _context.SaveChangesAsync();
    return Ok(new { message = "Cliente registrado correctamente" });
}

public async Task<IActionResult> Login([FromBody] LoginDTO dto)
{
    var cliente = await _context.Cliente
        .FirstOrDefaultAsync(x => 
            x.Usuario == dto.Usuario && 
            x.Contraseña == dto.Contraseña);
    // ...
}
```

**Cómo explicarlo:**
> "Se implementó programación asíncrona con async/await para evitar bloquear el servidor durante operaciones de base de datos, mejorando el rendimiento y la escalabilidad del sistema."

---

### 🚀 Propuesta de hashing de contraseñas

**Archivo:** `OrdenExpressAPI/Controllers/ClienteController.cs` (línea donde se valida la contraseña)

**Código (propuesto en comentarios):**
```csharp
// Actualmente (sin seguridad):
x.Contraseña == dto.Contraseña

// Propuesta segura:
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
var hashedPassword = Convert.ToBase64String(
    KeyDerivation.Pbkdf2(
        password: dto.Contraseña,
        salt: Encoding.UTF8.GetBytes(cliente.Salt),
        prf: KeyDerivationPrf.HMACSHA256,
        iterationCount: 100000,
        numBytesRequested: 256 / 8
    ));
```

**Cómo explicarlo:**
> "Se propuso mejorar la seguridad implementando hashing con PBKDF2 para proteger la información sensible de contraseñas, evitando almacenarlas en texto plano."

---

# 🎯 RESUMEN EJECUTIVO PARA LA EXPOSICIÓN

## Si te preguntan:

### ❓ ¿Qué técnicas de identificación de módulos aplicaste?
> **AppDbContext, DTOs e inyección de dependencias.**

### ❓ ¿Qué técnicas de legibilidad aplicaste?
> **Nombres descriptivos, separación de responsabilidades y Data Annotations.**

### ❓ ¿Qué técnicas de estructuración aplicaste?
> **Separación en capas, patrón MVC y uso de ORM (Entity Framework).**

### ❓ ¿Qué técnicas de gestión de errores aplicaste?
> **ModelState, validaciones null y códigos HTTP apropiados.**

### ❓ ¿Qué técnicas de afinación aplicaste?
> **Async/Await para operaciones asíncronas y propuesta de hashing de contraseñas.**

