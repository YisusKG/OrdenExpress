using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace OrdenExpressAPI.Services
{
    public interface IFileService
    {
        Task<string?> SaveFileAsync(IFormFile file, string folderName);
    }
}