using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrdenExpressAPI.Models
{
    [Table("Pedido")]
    public class Pedido
    {
        [Key]
        public int ID_Pedido { get; set; }

        [Required]
        public int ID_Cliente { get; set; }

        [ForeignKey("ID_Cliente")]
        public Cliente? Cliente { get; set; }

        [Required]
        public DateTime Fecha { get; set; } = DateTime.Now;

        [Required]
        [StringLength(50)]
        public string Estado { get; set; } = "Pendiente";

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }

        [StringLength(50)]
        public string Metodo_Pago { get; set; } = "Efectivo";

        public ICollection<DetallePedido> Detalles { get; set; } = new List<DetallePedido>();
    }

    [Table("Detalle_Pedido")]
    public class DetallePedido
    {
        [Key]
        public int ID_Detalle { get; set; }

        [Required]
        public int ID_Pedido { get; set; }

        [ForeignKey("ID_Pedido")]
        public Pedido? Pedido { get; set; }

        [Required]
        public int ID_Producto { get; set; }

        [ForeignKey("ID_Producto")]
        public Producto? Producto { get; set; }

        [Required]
        public int Cantidad { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }
    }
}

