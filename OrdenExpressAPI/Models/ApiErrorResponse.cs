namespace OrdenExpressAPI.Models
{
    public class ApiErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        
        // Agregar estas dos para que PedidoController no marque error
        public string Code { get; set; } = string.Empty;
        public string Detail { get; set; } = string.Empty;
    }
}