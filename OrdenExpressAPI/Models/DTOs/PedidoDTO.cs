using System.ComponentModel.DataAnnotations;

namespace OrdenExpressAPI.Models.DTOs
{
    public class CrearPedidoDto
    {
        public int ID_Cliente { get; set; }
        public string Metodo_Pago { get; set; } = "Efectivo";
        public decimal Total { get; set; }
        public List<DetallePedidoDto> Productos { get; set; } = new();
    }

    public class DetallePedidoDto
    {
        public int ID_Producto { get; set; }
        public int Cantidad { get; set; }
        public decimal Precio_Unitario { get; set; }
    }


    public class ProductoMenuDto
    {
        public int ID_Producto { get; set; }
        public string Nombre_P { get; set; } = string.Empty;
        public string? Clasificacion { get; set; }
        public decimal Precio_Venta { get; set; }
        public string? Imagen { get; set; }
    }
}

