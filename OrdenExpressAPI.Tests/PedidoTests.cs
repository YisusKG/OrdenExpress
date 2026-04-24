using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using OrdenExpressAPI.Controllers;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;
using OrdenExpressAPI.Models.DTOs;
using System.Collections.Generic;
using Xunit;

namespace OrdenExpressAPI.Tests;

public class PedidoTests
{
    private readonly AppDbContext _context;
    private readonly PedidoController _controller;

    public PedidoTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .ConfigureWarnings(x => x.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        _context = new AppDbContext(options);
        _controller = new PedidoController(_context);
    }

    [Fact]
    public async Task GetPedidos_ReturnsList()
    {
        _context.Pedido.Add(new Pedido { ID_Cliente = 1, Estado = "Pendiente", Total = 100 });
        await _context.SaveChangesAsync();

        var result = await _controller.GetPedidos();

        Assert.True(result.Value != null || result.Result != null);
    }

    [Fact]
    public async Task GetTodosPedidos_IncludesRelatedData()
    {
        _context.Cliente.Add(new Cliente { ID_Cliente = 1, Nombre = "Test" });
        _context.Pedido.Add(new Pedido { ID_Pedido = 1, ID_Cliente = 1, Estado = "Pendiente", Total = 10m });
        await _context.SaveChangesAsync();

        var result = await _controller.GetTodosPedidos();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var pedidos = Assert.IsType<List<Pedido>>(okResult.Value);
        Assert.NotEmpty(pedidos);
    }

    [Fact]
    public async Task GetPedidosCliente_FiltersById()
    {
        _context.Pedido.Add(new Pedido { ID_Cliente = 1 });
        _context.Pedido.Add(new Pedido { ID_Cliente = 2 });
        await _context.SaveChangesAsync();

        var result = await _controller.GetPedidosCliente(1);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var pedidos = Assert.IsType<List<Pedido>>(okResult.Value);
        Assert.Single(pedidos);
    }

    [Fact]
    public async Task GetPedido_NotFoundReturnsNotFound()
    {
        var result = await _controller.GetPedido(999);
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task CrearPedido_ValidInput_Success()
    {
        _context.Producto.Add(new Producto { ID_Producto = 1, Cantidad_Disponible = 10, Precio_Venta = 10 });
        await _context.SaveChangesAsync();

        var dto = new CrearPedidoDto
        {
            ID_Cliente = 1,
            Total = 20,
            Productos = new List<DetallePedidoDto> { new() { ID_Producto = 1, Cantidad = 2, Precio_Unitario = 10 } }
        };

        var result = await _controller.CrearPedido(dto);

        Assert.IsType<OkObjectResult>(result);
        var savedPedido = await _context.Pedido.FirstOrDefaultAsync();
        Assert.NotNull(savedPedido);
        Assert.Equal("PendientePago", savedPedido.Estado);
    }

    [Fact]
    public async Task CrearPedido_NoStock_BadRequest()
    {
        _context.Producto.Add(new Producto { ID_Producto = 1, Cantidad_Disponible = 5 });
        await _context.SaveChangesAsync();

        var dto = new CrearPedidoDto
        {
            ID_Cliente = 1, Total = 20,
            Productos = new List<DetallePedidoDto> { new() { ID_Producto = 1, Cantidad = 10, Precio_Unitario = 2 } }
        };

        var result = await _controller.CrearPedido(dto);
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task CrearPedido_EmptyProductos_BadRequest()
    {
        var dto = new CrearPedidoDto { ID_Cliente = 1, Total = 0, Productos = new List<DetallePedidoDto>() };
        var result = await _controller.CrearPedido(dto);
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task CambiarEstado_Valid_Success()
    {
        _context.Pedido.Add(new Pedido { ID_Pedido = 1, Estado = "Pendiente" });
        await _context.SaveChangesAsync();

        var result = await _controller.CambiarEstado(1, "Listo");

        Assert.IsType<OkObjectResult>(result);
        var updated = await _context.Pedido.FindAsync(1);
        Assert.NotNull(updated);
        Assert.Equal("Listo", updated.Estado);
    }

    [Fact]
    public async Task CambiarEstado_Invalid_BadRequest()
    {
        _context.Pedido.Add(new Pedido { ID_Pedido = 1 });
        await _context.SaveChangesAsync();

        var result = await _controller.CambiarEstado(1, "Invalid");
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task CambiarEstado_NotFound_NotFound()
    {
        var result = await _controller.CambiarEstado(999, "Listo");
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task PutPedido_Success()
    {
        _context.Pedido.Add(new Pedido { ID_Pedido = 1, Total = 10 });
        await _context.SaveChangesAsync();

        var pedido = await _context.Pedido.FindAsync(1);
        Assert.NotNull(pedido);
        pedido.Total = 20;

        var result = await _controller.PutPedido(1, pedido);
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task PutPedido_IdMismatch_BadRequest()
    {
        var pedido = new Pedido { ID_Pedido = 2, Total = 10 };
        var result = await _controller.PutPedido(1, pedido);
        Assert.IsType<BadRequestResult>(result);
    }

    [Fact]
    public async Task DeletePedido_Success()
    {
        _context.Pedido.Add(new Pedido { ID_Pedido = 1 });
        await _context.SaveChangesAsync();

        var result = await _controller.DeletePedido(1);

        Assert.IsType<NoContentResult>(result);
        Assert.Empty(_context.Pedido);
    }

    [Fact]
    public async Task DeletePedido_NotFound()
    {
        var result = await _controller.DeletePedido(999);
        Assert.IsType<NotFoundResult>(result);
    }
}
