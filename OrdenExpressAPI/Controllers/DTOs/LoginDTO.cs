using System.ComponentModel.DataAnnotations;

namespace OrdenExpressAPI.Models.DTOs
{
    /// <summary>
    /// Objeto de Transferencia de Datos (DTO) utilizado para el proceso de autenticación.
    /// </summary>
    /// <remarks>
    /// Esta clase encapsula las credenciales necesarias para validar
    /// el acceso de un usuario al sistema.
    /// Se utiliza tanto para administradores como para clientes.
    /// </remarks>
public class LoginDto
    {
        /// <summary>
        /// Nombre de usuario registrado en el sistema.
        /// </summary>
        /// <value>Cadena de texto obligatoria.</value>
        [Required]
        public string Usuario { get; set; } = string.Empty;

        /// <summary>
        /// Contraseña asociada al usuario.
        /// </summary>
        /// <value>Cadena de texto obligatoria.</value>
        [Required]
        public string Contraseña { get; set; } = string.Empty;
    }
}
