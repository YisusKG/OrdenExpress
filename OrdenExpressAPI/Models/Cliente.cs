using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrdenExpressAPI.Models
{
    [Table("Cliente")]
    public class Cliente
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID_Cliente { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Apellido_Paterno { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Apellido_Materno { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Correo_E { get; set; } = string.Empty;

        [Required]
        [Phone]
        [StringLength(20)]
        public string Telefono { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Usuario { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string Contraseña { get; set; } = string.Empty;

        [StringLength(100)]
        [NotMapped]
        public string? Salt { get; set; } = string.Empty;

        public string? Foto_Perfil { get; set; }

        public ICollection<Pedido>? Pedidos { get; set; }
    }
}

