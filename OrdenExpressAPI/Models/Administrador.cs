using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrdenExpressAPI.Models
{
    [Table("Administrador")]
public class Administrador
{
    [Key]
    public int ID_Administrador { get; set; }

    [Required]
    [StringLength(100)]
    public string Nombre_A { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Apellido_PaternoA { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Apellido_MaternoA { get; set; }

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
}
}
