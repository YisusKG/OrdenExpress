using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

using OrdenExpressAPI.Controllers;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;
using OrdenExpressAPI.Services;
using OrdenExpressAPI.Models.DTOs;
using Microsoft.Extensions.Logging;

namespace OrdenExpressAPI.Tests;

public class ClienteIntegrationTests
{
    [Fact]
    public async Task RegistrarCliente_DebeRetornarOk_CuandoLosDatosSonValidos()
    {
        // Arrange - STUB: InMemoryDatabase + MOCK FileService
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDB_" + Guid.NewGuid())
            .Options;

        await using var context = new AppDbContext(options);
        var mockFileService = new Mock<IFileService>();
        mockFileService.Setup(fs => fs.SaveFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>())).ReturnsAsync("test.jpg");
        var mockLogger = new Mock<ILogger<ClienteController>>();

        var controller = new ClienteController(context, mockFileService.Object, mockLogger.Object);
        var nuevoCliente = new Cliente 
        { 
            Nombre = "Juan", 
            Usuario = "j123", 
            Contraseña = "123",
            Telefono = "555-1234"
        };

        // Act
        var result = await controller.Registrar(nuevoCliente);

        // Assert
        Assert.IsType<OkObjectResult>(result);

        // Verify stub DB has data
        var saved = await context.Cliente.FirstOrDefaultAsync(c => c.Usuario == "j123");
        Assert.NotNull(saved);
        Assert.Equal("Juan", saved.Nombre);

        // Verify mock was called (for ActualizarFoto test case)
        mockFileService.Verify(fs => fs.SaveFileAsync(It.IsAny<IFormFile>(), "perfil"), Times.Never);
    }

    [Theory]
    [InlineData("", "pass")]
    [InlineData("user", "")]
    public async Task RegistrarCliente_DebeRetornarBadRequest_CuandoDatosInvalidos(string usuario, string pass)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("InvalidDB")
            .Options;

        await using var context = new AppDbContext(options);
        var mockFileService = new Mock<IFileService>();
        var mockLogger = new Mock<ILogger<ClienteController>>();
        var controller = new ClienteController(context, mockFileService.Object, mockLogger.Object);
        controller.ModelState.AddModelError("Error", "Simulated error");
        var clienteInvalido = new Cliente { Usuario = usuario, Contraseña = pass };

        var result = await controller.Registrar(clienteInvalido);
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task LoginCliente_Valido_DebeRetornarOk()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("LoginDB")
            .Options;

        await using var context = new AppDbContext(options);
        var mockFileService = new Mock<IFileService>();
        var mockLogger = new Mock<ILogger<ClienteController>>();
        var controller = new ClienteController(context, mockFileService.Object, mockLogger.Object);

        // Seed stub data
        var cliente = new Cliente { Nombre = "Test User", Usuario = "testuser", Contraseña = "testpass" };
        await context.Cliente.AddAsync(cliente);
        await context.SaveChangesAsync();

        // Act
        var result = await controller.Login(new LoginDto { Usuario = "testuser", Contraseña = "testpass" });

        // Assert
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task LoginCliente_Invalido_DebeRetornarUnauthorized()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("LoginInvalidDB")
            .Options;

        await using var context = new AppDbContext(options);
        var mockFileService = new Mock<IFileService>();
        var mockLogger = new Mock<ILogger<ClienteController>>();
        var controller = new ClienteController(context, mockFileService.Object, mockLogger.Object);

        var result = await controller.Login(new LoginDto { Usuario = "wrong", Contraseña = "wrong" });
        Assert.IsType<UnauthorizedObjectResult>(result);
    }
}
