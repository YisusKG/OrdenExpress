using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using OrdenExpressAPI.Controllers;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Models;
using Xunit;


namespace OrdenExpressAPI.Tests;

public class UsuariosTests
{   
    private static AppDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetClientes_ReturnsList()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var controller = new UsuariosController(context);
        context.Cliente.Add(new Cliente { ID_Cliente = 1, Nombre = "Test" });
        await context.SaveChangesAsync();

        // Act
        var result = await controller.GetClientes();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var clientes = Assert.IsAssignableFrom<System.Collections.IEnumerable>(okResult.Value);
        Assert.Single(clientes.Cast<object>());
    }

    [Fact]
    public async Task DeleteCliente_ExistingId_Success()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var controller = new UsuariosController(context);
        context.Cliente.Add(new Cliente { ID_Cliente = 1 });
        await context.SaveChangesAsync();

        // Act
        var result = await controller.DeleteCliente(1);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        Assert.Empty(context.Cliente);
    }

    [Fact]
    public async Task DeleteCliente_NonExistentId_NotFound()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var controller = new UsuariosController(context);

        // Act
        var result = await controller.DeleteCliente(999);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetEmpleados_ReturnsList()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var controller = new UsuariosController(context);
        context.Empleado.Add(new Empleado { ID_Empleado = 1, Nombre = "Test" });
        await context.SaveChangesAsync();

        // Act
        var result = await controller.GetEmpleados();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var empleados = Assert.IsAssignableFrom<System.Collections.IEnumerable>(okResult.Value);
        Assert.Single(empleados.Cast<object>());
    }

    [Fact]
    public async Task CreateEmpleado_Valid_Success()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var controller = new UsuariosController(context);
        var empleado = new Empleado { Nombre = "New", Usuario = "newemp", PasswordHash = "pass" };

        // Act
        var result = await controller.CreateEmpleado(empleado);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        Assert.Single(context.Empleado);
    }

    [Fact]
    public async Task UpdateEmpleado_Valid_Success()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var controller = new UsuariosController(context);
        context.Empleado.Add(new Empleado { ID_Empleado = 1, Nombre = "Old" });
        await context.SaveChangesAsync();
        var updateData = new Empleado { Nombre = "Updated" };

        // Act
        var result = await controller.UpdateEmpleado(1, updateData);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        var updated = await context.Empleado.FindAsync(1);
        Assert.NotNull(updated);
        Assert.Equal("Updated", updated.Nombre);
    }

    [Fact]
    public async Task UpdateEmpleado_NotFound_NotFound()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var controller = new UsuariosController(context);

        // Act
        var result = await controller.UpdateEmpleado(999, new Empleado());

        // Assert
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task DeleteEmpleado_Existing_Success()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var controller = new UsuariosController(context);
        context.Empleado.Add(new Empleado { ID_Empleado = 1 });
        await context.SaveChangesAsync();

        // Act
        var result = await controller.DeleteEmpleado(1);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        Assert.Empty(context.Empleado);
    }

    [Fact]
    public async Task DeleteEmpleado_NotFound_NotFound()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var controller = new UsuariosController(context);

        // Act
        var result = await controller.DeleteEmpleado(999);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task CreateEmpleado_InvalidModel_BadRequest()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var controller = new UsuariosController(context);
        controller.ModelState.AddModelError("Nombre", "Required");

        var empleado = new Empleado();

        // Act
        var result = await controller.CreateEmpleado(empleado);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }
}
