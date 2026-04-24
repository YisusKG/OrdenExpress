using Microsoft.AspNetCore.Http;
using Moq;
using OrdenExpressAPI.Services;
using System.IO;
using System.Text;
using Xunit;

namespace OrdenExpressAPI.Tests;

public class FileServiceTests
{
    [Fact]
    public async Task SaveFileAsync_ArchivoNulo_RetornaNull()
    {
        var service = new FileService();
        var result = await service.SaveFileAsync(null!, "fotos");
        Assert.Null(result);
    }

    [Fact]
    public async Task SaveFileAsync_ArchivoVacio_RetornaNull()
    {
        var service = new FileService();
        var mockFile = new Mock<IFormFile>();
        mockFile.Setup(f => f.Length).Returns(0);

        var result = await service.SaveFileAsync(mockFile.Object, "fotos");
        Assert.Null(result);
    }

    [Fact]
    public async Task SaveFileAsync_ArchivoValido_RetornaNombreArchivo()
    {
        var service = new FileService();
        var content = "fake image content";
        var fileName = "test.jpg";
        var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));

        var mockFile = new Mock<IFormFile>();
        mockFile.Setup(f => f.Length).Returns(stream.Length);
        mockFile.Setup(f => f.FileName).Returns(fileName);
        mockFile.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
            .Returns((Stream target, CancellationToken ct) => stream.CopyToAsync(target, ct));

        var result = await service.SaveFileAsync(mockFile.Object, "test_fotos");

        Assert.NotNull(result);
        Assert.EndsWith(".jpg", result);

        // Limpieza
        var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "test_fotos");
        if (Directory.Exists(folderPath))
            Directory.Delete(folderPath, true);
    }

    [Fact]
    public async Task SaveFileAsync_CreaDirectorioSiNoExiste()
    {
        var service = new FileService();
        var folderName = "test_nuevo_" + Guid.NewGuid().ToString("N");
        var stream = new MemoryStream(Encoding.UTF8.GetBytes("content"));

        var mockFile = new Mock<IFormFile>();
        mockFile.Setup(f => f.Length).Returns(stream.Length);
        mockFile.Setup(f => f.FileName).Returns("img.png");
        mockFile.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
            .Returns((Stream target, CancellationToken ct) => stream.CopyToAsync(target, ct));

        await service.SaveFileAsync(mockFile.Object, folderName);

        var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", folderName);
        Assert.True(Directory.Exists(folderPath));

        // Limpieza
        Directory.Delete(folderPath, true);
    }
}

