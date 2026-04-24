using System.Collections;
using System.Collections.Generic;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdenExpressAPI.Controllers;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;

namespace OrdenExpressAPI.Tests;

public class ReportesTests
{
    private readonly ReportesController _controller;
    private readonly AppDbContext _context;

    public ReportesTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new AppDbContext(options);
        _controller = new ReportesController(_context);
        SeedData();
    }

    private void SeedData()
    {
        _context.Cliente.Add(new Cliente { ID_Cliente = 1, Nombre = "Test", Correo_E = "test@test.com" });
        _context.Producto.Add(new Producto { ID_Producto = 1, Nombre_P = "Test Product" });
        _context.Pedido.AddRange(
            new Pedido { ID_Pedido = 1, ID_Cliente = 1, Fecha = DateTime.Today, Estado = "Entregado", Total = 100m },
            new Pedido { ID_Pedido = 2, ID_Cliente = 1, Fecha = DateTime.Today.AddDays(-1), Estado = "Entregado", Total = 200m }
        );
        _context.SaveChanges();
    }

    [Fact]
    public async Task VentasDiarias_WithData_ReturnsOk()
    {
        var result = await _controller.VentasDiarias();
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task VentasDiarias_NoSales_ReturnsZero()
    {
        _context.Pedido.RemoveRange(_context.Pedido);
        await _context.SaveChangesAsync();

        var result = await _controller.VentasDiarias();
        var okResult = Assert.IsType<OkObjectResult>(result);
        var propTotal = okResult.Value?.GetType().GetProperty("Total");
        var total = propTotal?.GetValue(okResult.Value) ?? 0m;
        Assert.Equal(0m, (decimal)total);
    }

    [Fact]
    public async Task VentasSemana_WithData_ReturnsOk()
    {
        var result = await _controller.VentasSemana();
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task VentasSemana_EmptyRange_ReturnsEmptyList()
    {
        _context.Pedido.RemoveRange(_context.Pedido);
        await _context.SaveChangesAsync();

        var result = await _controller.VentasSemana();
        var okResult = Assert.IsType<OkObjectResult>(result);
        var ventas = Assert.IsAssignableFrom<IEnumerable>(okResult.Value);
        Assert.Empty(ventas);
    }

    [Fact]
    public async Task VentasMes_WithData_ReturnsOk()
    {
        var result = await _controller.VentasMes();
        var okResult = Assert.IsType<OkObjectResult>(result);
        var ventas = Assert.IsAssignableFrom<IEnumerable>(okResult.Value);
        Assert.NotEmpty(ventas);
    }

    [Fact]
    public async Task ProductosMasVendidos_ReturnsOk()
    {
        _context.DetallePedido.Add(new DetallePedido { ID_Pedido = 1, ID_Producto = 1, Cantidad = 5, Total = 50m });
        await _context.SaveChangesAsync();

        var result = await _controller.ProductosMasVendidos();
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task PedidosRecientes_LimitedTo20()
    {
        _context.Pedido.RemoveRange(_context.Pedido);
        for (int i = 0; i < 25; i++)
            _context.Pedido.Add(new Pedido { ID_Cliente = 1, Fecha = DateTime.Today, Estado = "Entregado", Total = 100 });
        await _context.SaveChangesAsync();

        var result = await _controller.PedidosRecientes();
        var okResult = Assert.IsType<OkObjectResult>(result);
        var pedidos = Assert.IsAssignableFrom<IEnumerable>(okResult.Value);
        Assert.Equal(20, pedidos.Cast<object>().Count());
    }

    [Fact]
    public async Task ClientesRegistrados_ReturnsOk()
    {
        var result = await _controller.ClientesRegistrados();
        var okResult = Assert.IsType<OkObjectResult>(result);
        var clientes = Assert.IsAssignableFrom<IEnumerable>(okResult.Value);
        Assert.NotEmpty(clientes);
    }
}
