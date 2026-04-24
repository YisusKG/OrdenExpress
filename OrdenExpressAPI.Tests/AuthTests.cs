using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using OrdenExpressAPI.Controllers;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;
using OrdenExpressAPI.Models.DTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Xunit;

namespace OrdenExpressAPI.Tests;

public class AuthTests
{
    private static (AuthController, AppDbContext) CreateController()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new AppDbContext(options);
        var mockConfig = new Mock<IConfiguration>();
        mockConfig.Setup(c => c["Jwt:Key"]).Returns("SuperSecretKeyOrdenExpress2024!@#");
        mockConfig.Setup(c => c["Jwt:Issuer"]).Returns("test");
        mockConfig.Setup(c => c["Jwt:Audience"]).Returns("test");
        var mockLogger = new Mock<ILogger<AuthController>>();
        return (new AuthController(context, mockConfig.Object, mockLogger.Object), context);
    }

    // ── LOGIN CLIENTE ──
    [Fact]
    public async Task LoginCliente_CredencialesValidas_RetornaOk()
    {
        var (controller, context) = CreateController();
        var salt = BCrypt.Net.BCrypt.GenerateSalt();
        context.Cliente.Add(new Cliente { Usuario = "test", Contraseña = BCrypt.Net.BCrypt.HashPassword("test123", salt) });
        await context.SaveChangesAsync();

        var result = await controller.LoginCliente(new LoginDto { Usuario = "test", Contraseña = "test123" });

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task LoginCliente_UsuarioNoExiste_RetornaUnauthorized()
    {
        var (controller, _) = CreateController();

        var result = await controller.LoginCliente(new LoginDto { Usuario = "noexiste", Contraseña = "wrong" });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task LoginCliente_ContrasenaIncorrecta_RetornaUnauthorized()
    {
        var (controller, context) = CreateController();
        var salt = BCrypt.Net.BCrypt.GenerateSalt();
        context.Cliente.Add(new Cliente { Usuario = "test", Contraseña = BCrypt.Net.BCrypt.HashPassword("correcta", salt) });
        await context.SaveChangesAsync();

        var result = await controller.LoginCliente(new LoginDto { Usuario = "test", Contraseña = "incorrecta" });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task LoginCliente_ModeloInvalido_RetornaBadRequest()
    {
        var (controller, _) = CreateController();
        controller.ModelState.AddModelError("Usuario", "Required");

        var result = await controller.LoginCliente(new LoginDto { Usuario = "", Contraseña = "" });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    // ── LOGIN ADMIN ──
    [Fact]
    public async Task LoginAdmin_CredencialesValidas_RetornaOk()
    {
        var (controller, context) = CreateController();
        context.Administrador.Add(new Administrador { Usuario = "admin", PasswordHash = "admin" });
        await context.SaveChangesAsync();

        var result = await controller.LoginAdmin(new LoginDto { Usuario = "admin", Contraseña = "admin" });

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task LoginAdmin_AdminNoExiste_RetornaUnauthorized()
    {
        var (controller, _) = CreateController();

        var result = await controller.LoginAdmin(new LoginDto { Usuario = "noexiste", Contraseña = "wrong" });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task LoginAdmin_ContrasenaIncorrecta_RetornaUnauthorized()
    {
        var (controller, context) = CreateController();
        var saltAdmin = BCrypt.Net.BCrypt.GenerateSalt();
        context.Administrador.Add(new Administrador { Usuario = "admin", PasswordHash = BCrypt.Net.BCrypt.HashPassword("otracontrasena", saltAdmin) });
        await context.SaveChangesAsync();

        var result = await controller.LoginAdmin(new LoginDto { Usuario = "admin", Contraseña = "wrong" });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    // ── REGISTER CLIENTE ──
    [Fact]
    public async Task RegisterCliente_Valido_RetornaOk()
    {
        var (controller, context) = CreateController();
        var cliente = new Cliente { Usuario = "nuevo", Contraseña = "pass123", Nombre = "Nuevo" };

        var result = await controller.RegisterCliente(cliente);

        Assert.IsType<OkObjectResult>(result);
        Assert.Single(context.Cliente);
    }

    [Fact]
    public async Task RegisterCliente_ModeloInvalido_RetornaBadRequest()
    {
        var (controller, _) = CreateController();
        controller.ModelState.AddModelError("Usuario", "Required");

        var result = await controller.RegisterCliente(new Cliente());

        Assert.IsType<BadRequestObjectResult>(result);
    }

    // ── LOGIN EMPLEADO ──
    [Fact]
    public async Task LoginEmpleado_CredencialesValidas_RetornaOk()
    {
        var (controller, context) = CreateController();
        var salt = BCrypt.Net.BCrypt.GenerateSalt();
        context.Empleado.Add(new Empleado
        {
            Usuario = "emp1",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("pass123", salt),
            Nombre = "Empleado", Apellido_Paterno = "Test",
            Correo_E = "emp@test.com", Telefono = "123"
        });
        await context.SaveChangesAsync();

        var result = await controller.LoginEmpleado(new LoginDto { Usuario = "emp1", Contraseña = "pass123" });

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task LoginEmpleado_UsuarioNoExiste_RetornaUnauthorized()
    {
        var (controller, _) = CreateController();

        var result = await controller.LoginEmpleado(new LoginDto { Usuario = "noexiste", Contraseña = "wrong" });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task LoginEmpleado_ContrasenaIncorrecta_RetornaUnauthorized()
    {
        var (controller, context) = CreateController();
        var salt = BCrypt.Net.BCrypt.GenerateSalt();
        context.Empleado.Add(new Empleado
        {
            Usuario = "emp1",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("correcta", salt),
            Nombre = "Empleado", Apellido_Paterno = "Test",
            Correo_E = "emp@test.com", Telefono = "123"
        });
        await context.SaveChangesAsync();

        var result = await controller.LoginEmpleado(new LoginDto { Usuario = "emp1", Contraseña = "incorrecta" });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    // ── REGISTER EMPLEADO ──
    [Fact]
    public async Task RegisterEmpleado_Valido_RetornaOk()
    {
        var (controller, context) = CreateController();
        var empleado = new Empleado
        {
            Usuario = "nuevo", PasswordHash = "pass123",
            Nombre = "Nuevo", Apellido_Paterno = "Empleado",
            Correo_E = "nuevo@test.com", Telefono = "123"
        };

        var result = await controller.RegisterEmpleado(empleado);

        Assert.IsType<OkObjectResult>(result);
        Assert.Single(context.Empleado);
    }

    [Fact]
    public async Task RegisterEmpleado_ModeloInvalido_RetornaBadRequest()
    {
        var (controller, _) = CreateController();
        controller.ModelState.AddModelError("Usuario", "Required");

        var result = await controller.RegisterEmpleado(new Empleado());

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task RegisterEmpleado_SinRol_AsignaCocinaDefault()
    {
        var (controller, context) = CreateController();
        var empleado = new Empleado
        {
            Usuario = "sinrol", PasswordHash = "pass123",
            Nombre = "Sin", Apellido_Paterno = "Rol",
            Correo_E = "sinrol@test.com", Telefono = "123",
            Rol_Empleado = null!
        };

        await controller.RegisterEmpleado(empleado);

        var saved = await context.Empleado.FirstOrDefaultAsync();
        Assert.NotNull(saved);
        Assert.Equal("Cocina", saved.Rol_Empleado);
    }
}

