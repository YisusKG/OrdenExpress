using Stripe;
using Stripe.Checkout;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;
using System.Text.Json;

namespace OrdenExpressAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StripeController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<StripeController> _logger;
        private readonly string _webhookSecret;

        public StripeController(AppDbContext context, ILogger<StripeController> logger, IConfiguration config)
        {
            _context = context;
            _logger = logger;
            _webhookSecret = config["Stripe:WebhookSecret"] ?? "";
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
                                pedido.Estado = "Pagado";
                                pedido.Metodo_Pago = "Tarjeta";
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
    }
}

