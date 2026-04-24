using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrdenExpressAPI.Models
{
    [Table("Producto")]
public class Producto
{
    [Key]
    public int ID_Producto { get; set; }

    [Required]
    [StringLength(100)]
    public string Nombre_P { get; set; } = string.Empty;

    [StringLength(50)]
    public string? Clasificacion { get; set; }

    [Required]
    [StringLength(500)]
    public string Descripcion { get; set; } = string.Empty;

    [Required]
    public int Cantidad_Disponible { get; set; }

    public int? Cantidad_Min { get; set; }
    public int? Cantidad_Max { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Costo_Base { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Precio_Venta { get; set; }

    public string? Imagen { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? Porcentaje_Gan { get; set; }
}
}
