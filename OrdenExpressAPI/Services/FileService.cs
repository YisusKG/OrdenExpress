using Microsoft.AspNetCore.Http;
using System.IO;
using System;
using System.Threading.Tasks;

namespace OrdenExpressAPI.Services
{
    /// <summary>
    /// Servicio encargado de la gestión y almacenamiento de archivos en el servidor.
    /// </summary>
    /// <remarks>
    /// Implementa la interfaz IFileService.
    /// Permite guardar archivos dentro del directorio wwwroot
    /// organizándolos en carpetas específicas.
    /// </remarks>
    public class FileService : IFileService
    {

        /// <summary>
        /// Guarda un archivo en la carpeta especificada dentro del servidor.
        /// </summary>
        /// <param name="file">Archivo recibido desde el cliente.</param>
        /// <param name="folderName">Nombre de la carpeta donde será almacenado.</param>
        /// <returns>
        /// Retorna el nombre generado del archivo si la operación es exitosa.
        /// Retorna null si el archivo es inválido.
        /// </returns>
        public async Task<string?> SaveFileAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0)
                return null;

            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", folderName);

            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var fullPath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return fileName;
        }
    }
}
