using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdenExpressAPI.Controllers;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models.DTOs;
using OrdenExpressAPI.Models;

namespace OrdenExpressAPI.Tests;

public class AdministradorTests
{
    private readonly AppDbContext _context;
    private readonly AdministradorController _controller;

    public AdministradorTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new AppDbContext(options);
        _controller = new AdministradorController(_context);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOk()
    {
        var admin = new Administrador { ID_Administrador = 1, Usuario = "admin", PasswordHash = "password123" };
        _context.Administrador.Add(admin);
        await _context.SaveChangesAsync();

        var result = await _controller.Login(new LoginDto { Usuario = "admin", Contraseña = "password123" }) as OkObjectResult;

        Assert.NotNull(result);
        Assert.Equal(200, result.StatusCode);
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        var result = await _controller.Login(new LoginDto { Usuario = "wrong", Contraseña = "wrong" }) as UnauthorizedObjectResult;

        Assert.NotNull(result);
        Assert.Equal(401, result.StatusCode);
    }

    [Fact]
    public async Task Login_InvalidModel_ReturnsBadRequest()
    {
        _controller.ModelState.AddModelError("Usuario", "Required");
        var result = await _controller.Login(new LoginDto { Usuario = "", Contraseña = "" }) as BadRequestObjectResult;

        Assert.NotNull(result);
        Assert.Equal(400, result.StatusCode);
    }
}
