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
        public DbSet<DetallePedido> DetallePedido { get; set; }


        /// <summary>Entidad que representa la tabla de Empleados.</summary>
        public DbSet<Empleado> Empleado { get; set; }
    }
}

