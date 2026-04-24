using System.ComponentModel.DataAnnotations;

namespace OrdenExpressAPI.Models
{
    public class ProductoUpdateForm
    {
        [Required]
        [StringLength(100)]
        public string Nombre_P { get; set; } = string.Empty;

        [Required]
        public string Descripcion { get; set; } = string.Empty;

        public int? Cantidad_Min { get; set; }
        public int? Cantidad_Max { get; set; }

        [Required]
        public decimal Costo_Base { get; set; }

        [Required]
        public decimal Precio_Venta { get; set; }

        public decimal? Porcentaje_Gan { get; set; }
    }
}
