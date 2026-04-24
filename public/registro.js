  document.addEventListener("DOMContentLoaded", () => {
  const registerButton = document.querySelector("#btnRegistrar");

  registerButton.addEventListener("click", async () => {

    const Nombre = document.getElementById("nombre").value.trim();
    const Apellido_Paterno = document.getElementById("apellidoP").value.trim();
    const Apellido_Materno = document.getElementById("apellidoM").value.trim();
    const Usuario = document.getElementById("usuario").value.trim();
    const Telefono = document.getElementById("telefono").value.trim();
    const Correo_E = document.getElementById("email").value.trim();
    const Contraseña = document.getElementById("contrasena").value.trim();

    if (!Nombre || !Apellido_Paterno || !Usuario || !Correo_E || !Contraseña) {
      alert("Todos los campos obligatorios deben ser llenados");
      return;
    }

    const cliente = {
      Nombre: Nombre,
      Apellido_Paterno: Apellido_Paterno,
      Apellido_Materno: Apellido_Materno,
      Usuario: Usuario,
      Telefono: Telefono,
      Correo_E: Correo_E,
      Contraseña: Contraseña
    };

    try {
      const response = await fetch("http://localhost:5022/api/auth/register-cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registro exitoso 🎉");
        window.location.href = "Index.html";
      } else {
        alert(data.message || "Error al registrar usuario.");
      }
    } catch (error) {
      console.error("Error al registrar cliente:", error);
      alert("No se pudo conectar con el servidor.");
    }
  });
});
