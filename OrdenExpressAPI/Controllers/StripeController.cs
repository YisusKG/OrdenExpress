using Stripe;
using Stripe.Checkout;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;
using OrdenExpressAPI.Models.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace OrdenExpressAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StripeController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<StripeController> _logger;
        private readonly IConfiguration _config;
        private readonly string _webhookSecret;
        private readonly string _secretKey;

        public StripeController(AppDbContext context, ILogger<StripeController> logger, IConfiguration config)
        {
            _context = context;
            _logger = logger;
            _config = config;
            _webhookSecret = config["Stripe:WebhookSecret"] ?? "";
            _secretKey = config["Stripe:SecretKey"] ?? "";
        }

        [Authorize(Policy = "Cliente")]
        [HttpPost("checkout")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] StripeCheckoutRequestDto dto)
        {
            if (!IsStripeConfigured())
                return BadRequest(new { message = "Configura Stripe:SecretKey con una llave real sk_test_ o sk_live_." });

            if (dto.Productos == null || dto.Productos.Count == 0)
                return BadRequest(new { message = "El pedido debe tener productos" });

            StripeConfiguration.ApiKey = _secretKey;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var pedido = new Pedido
                {
                    ID_Cliente = dto.ID_Cliente,
                    Fecha = DateTime.Now,
                    Estado = "PendientePago",
                    Total = dto.Total,
                    Metodo_Pago = "Tarjeta"
                };

                _context.Pedido.Add(pedido);
                await _context.SaveChangesAsync();

                var lineItems = new List<SessionLineItemOptions>();
                decimal totalCalculado = 0;

                foreach (var prodDto in dto.Productos)
                {
                    var producto = await _context.Producto.FindAsync(prodDto.ID_Producto);
                    if (producto == null || producto.Cantidad_Disponible < prodDto.Cantidad)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new { message = $"Producto {prodDto.ID_Producto} sin stock suficiente" });
                    }

                    var detalle = new DetallePedido
                    {
                        ID_Pedido = pedido.ID_Pedido,
                        ID_Producto = prodDto.ID_Producto,
                        Cantidad = prodDto.Cantidad,
                        Total = prodDto.Cantidad * prodDto.Precio_Unitario
                    };

                    _context.DetallePedido.Add(detalle);
                    totalCalculado += detalle.Total;

                    producto.Cantidad_Disponible -= prodDto.Cantidad;
                    if (producto.Cantidad_Disponible <= 0) producto.Imagen = null;

                    lineItems.Add(new SessionLineItemOptions
                    {
                        Quantity = prodDto.Cantidad,
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "mxn",
                            UnitAmount = (long)Math.Round(prodDto.Precio_Unitario * 100, MidpointRounding.AwayFromZero),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = producto.Nombre_P
                            }
                        }
                    });
                }

                if (Math.Abs(pedido.Total - totalCalculado) > 0.01m)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { message = "Total no coincide con productos" });
                }

                await _context.SaveChangesAsync();

                var baseUrl = _config["Frontend:BaseUrl"] ?? "http://127.0.0.1:5173";
                var successUrl = string.IsNullOrWhiteSpace(dto.SuccessUrl)
                    ? $"{baseUrl}/recibo/{pedido.ID_Pedido}?session_id={{CHECKOUT_SESSION_ID}}"
                    : dto.SuccessUrl;
                var cancelUrl = string.IsNullOrWhiteSpace(dto.CancelUrl)
                    ? $"{baseUrl}/pago?cancelado=1&pedido={pedido.ID_Pedido}"
                    : dto.CancelUrl;

                var options = new SessionCreateOptions
                {
                    Mode = "payment",
                    PaymentMethodTypes = new List<string> { "card" },
                    LineItems = lineItems,
                    SuccessUrl = successUrl,
                    CancelUrl = cancelUrl,
                    Metadata = new Dictionary<string, string>
                    {
                        ["idPedido"] = pedido.ID_Pedido.ToString(),
                        ["folio"] = PedidoController.GenerateFolio(pedido)
                    }
                };

                var service = new SessionService();
                var session = await service.CreateAsync(options);
                await transaction.CommitAsync();

                var recibo = await BuildReciboByIdAsync(pedido.ID_Pedido);

                return Ok(new
                {
                    checkoutUrl = session.Url,
                    sessionId = session.Id,
                    idPedido = pedido.ID_Pedido,
                    folio = PedidoController.GenerateFolio(pedido),
                    recibo
                });
            }
            catch (StripeException ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creando Stripe Checkout Session");
                return BadRequest(new { message = ex.StripeError?.Message ?? "Error al crear pago con Stripe" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creando pedido para Stripe");
                return StatusCode(500, new ApiErrorResponse { StatusCode = 500, Message = "Error interno al crear pago", Detail = ex.Message });
            }
        }

        [Authorize(Policy = "Cliente")]
        [HttpPost("confirm-session")]
        public async Task<IActionResult> ConfirmSession([FromBody] ConfirmStripeSessionDto dto)
        {
            if (!IsStripeConfigured())
                return BadRequest(new { message = "Configura Stripe:SecretKey con una llave real sk_test_ o sk_live_." });

            StripeConfiguration.ApiKey = _secretKey;

            try
            {
                var service = new SessionService();
                var session = await service.GetAsync(dto.SessionId);
                var idPedido = session.Metadata?["idPedido"];

                if (string.IsNullOrWhiteSpace(idPedido) || !int.TryParse(idPedido, out var pedidoId))
                    return BadRequest(new { message = "La sesion de Stripe no tiene pedido asociado" });

                if (session.PaymentStatus != "paid")
                    return BadRequest(new { message = "El pago aun no esta confirmado" });

                var recibo = await MarkPedidoPagadoAsync(pedidoId);
                if (recibo == null)
                    return NotFound(new { message = "Pedido no encontrado" });

                return Ok(new { message = "Pago confirmado", recibo });
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Error confirmando Stripe Checkout Session");
                return BadRequest(new { message = ex.StripeError?.Message ?? "Error al confirmar pago con Stripe" });
            }
        }

        [Authorize(Policy = "Cliente")]
        [HttpPost("cancel-pending/{pedidoId:int}")]
        public async Task<IActionResult> CancelPending(int pedidoId)
        {
            var pedido = await _context.Pedido
                .Include(p => p.Detalles)
                .FirstOrDefaultAsync(p => p.ID_Pedido == pedidoId);

            if (pedido == null)
                return NotFound(new { message = "Pedido no encontrado" });

            if (pedido.Estado != "PendientePago")
                return BadRequest(new { message = "El pedido ya no esta pendiente de pago" });

            foreach (var detalle in pedido.Detalles)
            {
                var producto = await _context.Producto.FindAsync(detalle.ID_Producto);
                if (producto != null)
                    producto.Cantidad_Disponible += detalle.Cantidad;
            }

            _context.DetallePedido.RemoveRange(pedido.Detalles);
            _context.Pedido.Remove(pedido);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Pago cancelado y stock restaurado" });
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            
            try
            {
                Event stripeEvent;
                var sigHeader = Request.Headers["Stripe-Signature"].ToString();
                stripeEvent = EventUtility.ConstructEvent(json, sigHeader, _webhookSecret);

                if (stripeEvent.Type == Events.CheckoutSessionCompleted)
                {
                    var session = stripeEvent.Data.Object as Session;
                    var idPedido = session?.Metadata?["idPedido"];

                    if (!string.IsNullOrEmpty(idPedido!) && int.TryParse(idPedido, out int pedidoId))
                    {
                        using var transaction = await _context.Database.BeginTransactionAsync();
                        try
                        {
                            var pedido = await _context.Pedido
                                .Include(p => p.Detalles)
                                .FirstOrDefaultAsync(p => p.ID_Pedido == pedidoId);

                            if (pedido != null && pedido.Estado == "PendientePago")
                            {
                                pedido.Estado = "Pendiente";
                                pedido.Metodo_Pago = "Tarjeta";
                                pedido.Fecha = DateTime.Now;
                                await _context.SaveChangesAsync();

                                // Emit socket via Node or service
                                _logger.LogInformation($"✅ Pago confirmado para pedido {pedidoId}. Total: ${pedido.Total}");

                                await transaction.CommitAsync();
                                return Ok(new { message = "Webhook procesado correctamente" });
                            }
                        }
                        catch (Exception ex)
                        {
                            await transaction.RollbackAsync();
                            _logger.LogError(ex, "Error webhook stripe pedido {PedidoId}", idPedido);
                        }
                    }
                }

                return Ok(new { message = "Evento recibido" });
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe webhook error");
                return BadRequest(new { error = "Invalid signature" });
            }
        }

        private bool IsStripeConfigured()
        {
            return (_secretKey.StartsWith("sk_test_", StringComparison.Ordinal) ||
                    _secretKey.StartsWith("sk_live_", StringComparison.Ordinal)) &&
                   !_secretKey.Contains("your_stripe", StringComparison.OrdinalIgnoreCase);
        }

        private async Task<ReciboPedidoDto?> MarkPedidoPagadoAsync(int pedidoId)
        {
            var pedido = await _context.Pedido
                .Include(p => p.Cliente)
                .Include(p => p.Detalles)
                    .ThenInclude(d => d.Producto)
                .FirstOrDefaultAsync(p => p.ID_Pedido == pedidoId);

            if (pedido == null)
                return null;

            if (pedido.Estado == "PendientePago")
            {
                pedido.Estado = "Pendiente";
                pedido.Metodo_Pago = "Tarjeta";
                pedido.Fecha = DateTime.Now;
                await _context.SaveChangesAsync();
            }

            return PedidoController.BuildRecibo(pedido);
        }

        private async Task<ReciboPedidoDto?> BuildReciboByIdAsync(int pedidoId)
        {
            var pedido = await _context.Pedido
                .Include(p => p.Cliente)
                .Include(p => p.Detalles)
                    .ThenInclude(d => d.Producto)
                .FirstOrDefaultAsync(p => p.ID_Pedido == pedidoId);

            return pedido == null ? null : PedidoController.BuildRecibo(pedido);
        }
    }

    public class ConfirmStripeSessionDto
    {
        public string SessionId { get; set; } = string.Empty;
    }
}

