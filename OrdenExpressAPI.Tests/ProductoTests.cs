using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using OrdenExpressAPI.Controllers;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;
using OrdenExpressAPI.Services;
using Xunit;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace OrdenExpressAPI.Tests;

public class ProductoTests
{
    private static AppDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task ObtenerTodos_ReturnsProducts()
    {
        var context = CreateInMemoryContext();
        context.Producto.Add(new Producto { ID_Producto = 1, Nombre_P = "Test" });
        await context.SaveChangesAsync();

        var controller = new ProductoController(context, new Mock<IFileService>().Object);
        var result = await controller.ObtenerTodos();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var products = Assert.IsType<List<Producto>>(okResult.Value);
        Assert.Single(products);
    }

    [Fact]
    public async Task Obtener_ExistingId_ReturnsOk()
    {
        var context = CreateInMemoryContext();
        context.Producto.Add(new Producto { ID_Producto = 1, Nombre_P = "Test" });
        await context.SaveChangesAsync();

        var controller = new ProductoController(context, new Mock<IFileService>().Object);
        var result = await controller.Obtener(1);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task Obtener_NonExistentId_ReturnsNotFound()
    {
        var context = CreateInMemoryContext();
        var controller = new ProductoController(context, new Mock<IFileService>().Object);

        var result = await controller.Obtener(999);
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task Agregar_ValidForm_ReturnsOk()
    {
        var context = CreateInMemoryContext();
        var fileServiceMock = new Mock<IFileService>();
        fileServiceMock.Setup(x => x.SaveFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>())).ReturnsAsync("test.jpg");

        var controller = new ProductoController(context, fileServiceMock.Object);
        var form = new OrdenExpressAPI.Controllers.ProductoForm { Nombre_P = "Test", Cantidad_Disponible = 10, Costo_Base = 10, Precio_Venta = 15, Imagen = new Mock<IFormFile>().Object };

        var result = await controller.Agregar(form);

        Assert.IsType<OkObjectResult>(result);
        Assert.Single(context.Producto);
    }

    [Fact]
    public async Task Agregar_WithImage_SavesFile()
    {
        var context = CreateInMemoryContext();
        var fileServiceMock = new Mock<IFileService>();
        fileServiceMock.Setup(x => x.SaveFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>())).ReturnsAsync("test.jpg");

        var controller = new ProductoController(context, fileServiceMock.Object);
        var form = new OrdenExpressAPI.Controllers.ProductoForm { Nombre_P = "Test", Cantidad_Disponible = 10, Costo_Base = 10, Precio_Venta = 15, Imagen = new Mock<IFormFile>().Object };

        await controller.Agregar(form);
        fileServiceMock.Verify(x => x.SaveFileAsync(It.IsAny<IFormFile>(), "fotos"), Times.Once);
    }

    [Fact]
    public async Task Modificar_Valid_Success()
    {
        var context = CreateInMemoryContext();
        context.Producto.Add(new Producto { ID_Producto = 1, Nombre_P = "Old" });
        await context.SaveChangesAsync();

        var controller = new ProductoController(context, new Mock<IFileService>().Object);
        var result = await controller.Modificar(1, new Producto { Nombre_P = "Updated", Precio_Venta = 25m, Costo_Base = 20m });

        Assert.IsType<OkObjectResult>(result);
        var updated = await context.Producto.FindAsync(1);
        Assert.NotNull(updated);
        Assert.Equal("Updated", updated.Nombre_P);
    }

    [Fact]
    public async Task Modificar_NotFound_ReturnsNotFound()
    {
        var context = CreateInMemoryContext();
        var controller = new ProductoController(context, new Mock<IFileService>().Object);

        var result = await controller.Modificar(999, new Producto { Nombre_P = "X" });
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task Eliminar_Existing_Success()
    {
        var context = CreateInMemoryContext();
        context.Producto.Add(new Producto { ID_Producto = 1 });
        await context.SaveChangesAsync();

        var controller = new ProductoController(context, new Mock<IFileService>().Object);
        var result = await controller.Eliminar(1);

        Assert.IsType<OkObjectResult>(result);
        Assert.Empty(context.Producto);
    }

    [Fact]
    public async Task Eliminar_NotFound_ReturnsNotFound()
    {
        var context = CreateInMemoryContext();
        var controller = new ProductoController(context, new Mock<IFileService>().Object);

        var result = await controller.Eliminar(999);
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task ObtenerInventario_ReturnsAll()
    {
        var context = CreateInMemoryContext();
        context.Producto.AddRange(
            new Producto { ID_Producto = 1, Cantidad_Disponible = 5, Cantidad_Min = 10 },
            new Producto { ID_Producto = 2, Cantidad_Disponible = 20, Cantidad_Max = 15 }
        );
        await context.SaveChangesAsync();

        var controller = new ProductoController(context, new Mock<IFileService>().Object);
        var result = await controller.ObtenerInventario();

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task ObtenerMenu_FiltersAvailable()
    {
        var context = CreateInMemoryContext();
        context.Producto.AddRange(
            new Producto { Cantidad_Disponible = 5, Imagen = "img1.jpg" },
            new Producto { Cantidad_Disponible = 0 }
        );
        await context.SaveChangesAsync();

        var controller = new ProductoController(context, new Mock<IFileService>().Object);
        var result = await controller.ObtenerMenu();

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task EntradaInventario_Valid_IncreasesStock()
    {
        var context = CreateInMemoryContext();
        context.Producto.Add(new Producto { ID_Producto = 1, Cantidad_Disponible = 10 });
        await context.SaveChangesAsync();

        var controller = new ProductoController(context, new Mock<IFileService>().Object);
        var result = await controller.EntradaInventario(1, 5);

        Assert.IsType<OkObjectResult>(result);
        var updated = await context.Producto.FindAsync(1);
        Assert.NotNull(updated);
        Assert.Equal(15, updated.Cantidad_Disponible);
    }

    [Fact]
    public async Task EntradaInventario_NotFound_ReturnsNotFound()
    {
        var context = CreateInMemoryContext();
        var controller = new ProductoController(context, new Mock<IFileService>().Object);

        var result = await controller.EntradaInventario(999, 5);
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task EntradaInventario_CantidadCero_BadRequest()
    {
        var context = CreateInMemoryContext();
        context.Producto.Add(new Producto { ID_Producto = 1, Cantidad_Disponible = 10 });
        await context.SaveChangesAsync();

        var controller = new ProductoController(context, new Mock<IFileService>().Object);
        var result = await controller.EntradaInventario(1, 0);

        Assert.IsType<BadRequestObjectResult>(result);
    }
}
