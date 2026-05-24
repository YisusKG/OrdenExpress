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

    public class StripeCheckoutRequestDto : CrearPedidoDto
    {
        public string? SuccessUrl { get; set; }
        public string? CancelUrl { get; set; }
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

    public class ReciboPedidoDto
    {
        public int IdPedido { get; set; }
        public string Folio { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public string Estado { get; set; } = string.Empty;
        public string MetodoPago { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public string Negocio { get; set; } = "Pinchos Banderillas";
        public string Cliente { get; set; } = "Cliente";
        public List<ReciboDetalleDto> Productos { get; set; } = new();
    }

    public class ReciboDetalleDto
    {
        public string Nombre { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Total { get; set; }
    }

    public class CambiarEstadoDto
    {
        public string nuevoEstado { get; set; } = string.Empty;
    }
}

