using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace OrdenExpressAPI.Models
{
    public class ProductoForm
    {
        [Required]
        [StringLength(100)]
        public string Nombre_P { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Clasificacion { get; set; }

        [Required]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        public int Cantidad_Disponible { get; set; }

        public int? Cantidad_Min { get; set; }
        public int? Cantidad_Max { get; set; }

        [Required]
        public decimal Costo_Base { get; set; }

        [Required]
        public decimal Precio_Venta { get; set; }

        public IFormFile? Imagen { get; set; }

        public decimal? Porcentaje_Gan { get; set; }
    }
}
