using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Moq;
using OrdenExpressAPI.Controllers;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;
using OrdenExpressAPI.Models.DTOs;
using OrdenExpressAPI.Services;
using Microsoft.Extensions.Logging;
using Xunit;

namespace OrdenExpressAPI.Tests;

public class ClienteTests
{
    private static (ClienteController, AppDbContext) CreateController()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new AppDbContext(options);
        var mockFileService = new Mock<IFileService>();
        var mockLogger = new Mock<ILogger<ClienteController>>();
        var controller = new ClienteController(context, mockFileService.Object, mockLogger.Object);
        return (controller, context);
    }

    [Fact]
    public async Task Registrar_ModeloValido_RetornaOk()
    {
        var (controller, _) = CreateController();
        var cliente = new Cliente
        {
            Nombre = "Juan", Apellido_Paterno = "Perez",
            Correo_E = "juan@test.com", Telefono = "123456789",
            Usuario = "juanito", Contraseña = "password123"
        };

        var result = await controller.Registrar(cliente);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task Registrar_ModeloInvalido_RetornaBadRequest()
    {
        var (controller, _) = CreateController();
        controller.ModelState.AddModelError("Usuario", "Requerido");

        var result = await controller.Registrar(new Cliente { Usuario = "" });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Registrar_GuardaEnBaseDeDatos()
    {
        var (controller, context) = CreateController();
        var cliente = new Cliente
        {
            Nombre = "Ana", Apellido_Paterno = "Lopez",
            Correo_E = "ana@test.com", Telefono = "987654321",
            Usuario = "ana123", Contraseña = "pass123"
        };

        await controller.Registrar(cliente);

        Assert.Single(context.Cliente);
    }

    [Fact]
    public async Task Login_CredencialesValidas_RetornaOk()
    {
        var (controller, context) = CreateController();
        context.Cliente.Add(new Cliente
        {
            Nombre = "Juan", Apellido_Paterno = "Perez",
            Correo_E = "juan@test.com", Telefono = "123456789",
            Usuario = "juanito", Contraseña = "password123"
        });
        await context.SaveChangesAsync();

        var result = await controller.Login(new LoginDto { Usuario = "juanito", Contraseña = "password123" });

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task Login_CredencialesInvalidas_RetornaUnauthorized()
    {
        var (controller, _) = CreateController();

        var result = await controller.Login(new LoginDto { Usuario = "noexiste", Contraseña = "wrong" });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Login_ModeloInvalido_RetornaBadRequest()
    {
        var (controller, _) = CreateController();
        controller.ModelState.AddModelError("Usuario", "Requerido");

        var result = await controller.Login(new LoginDto { Usuario = "", Contraseña = "" });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task ActualizarFoto_ClienteNoExiste_RetornaNotFound()
    {
        var (controller, _) = CreateController();

        var result = await controller.ActualizarFoto(999, new Mock<IFormFile>().Object);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task ActualizarFoto_ClienteExiste_RetornaOk()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new AppDbContext(options);

        var mockFileService = new Mock<IFileService>();
        mockFileService.Setup(x => x.SaveFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()))
            .ReturnsAsync("foto.jpg");

        var mockLogger = new Mock<ILogger<ClienteController>>();
        var controller = new ClienteController(context, mockFileService.Object, mockLogger.Object);

        context.Cliente.Add(new Cliente
        {
            ID_Cliente = 1, Nombre = "Test", Apellido_Paterno = "Test",
            Correo_E = "test@test.com", Telefono = "123", Usuario = "test", Contraseña = "pass"
        });
        await context.SaveChangesAsync();

        var mockFoto = new Mock<IFormFile>();
        var result = await controller.ActualizarFoto(1, mockFoto.Object);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task ActualizarFoto_SinFoto_RetornaOkSinCambiarFoto()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new AppDbContext(options);

        var mockFileService = new Mock<IFileService>();
        mockFileService.Setup(x => x.SaveFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()))
            .ReturnsAsync((string?)null);

        var mockLogger = new Mock<ILogger<ClienteController>>();
        var controller = new ClienteController(context, mockFileService.Object, mockLogger.Object);

        context.Cliente.Add(new Cliente
        {
            ID_Cliente = 1, Nombre = "Test", Apellido_Paterno = "Test",
            Correo_E = "test@test.com", Telefono = "123", Usuario = "test", Contraseña = "pass"
        });
        await context.SaveChangesAsync();

        var result = await controller.ActualizarFoto(1, new Mock<IFormFile>().Object);

        Assert.IsType<OkObjectResult>(result);
    }
}
