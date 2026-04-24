using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrdenExpressAPI.Models
{
    [Table("Empleado")]
    public class Empleado
    {
        [Key]
        public int ID_Empleado { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Apellido_Paterno { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Apellido_Materno { get; set; }

        [Required]
        [Phone]
        [StringLength(20)]
        public string Telefono { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Correo_E { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Usuario { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Salt { get; set; }

        [Required]
        [StringLength(50)]
        public string Rol_Empleado { get; set; } = "Cocina"; // Cocina, Repartidor, etc.
    }
}
