document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formPerfil");
  const inputFoto = document.getElementById("inputFoto");
  const imgPreview = document.getElementById("fotoPerfil");
  const idCliente = localStorage.getItem("ID_Cliente");

  if (!idCliente) { window.location.href = "index.html"; return; }

  inputFoto.addEventListener("change", () => {
    const file = inputFoto.files[0];
    if (file) imgPreview.src = URL.createObjectURL(file);
  });

  async function cargarDatosCliente() {
    try {
      const res = await fetch(`http://localhost:5022/api/cliente/${idCliente}`);
      if (!res.ok) throw new Error("Error al obtener datos");
      mostrarPerfil(await res.json());
    } catch (err) {
      alert("No se pudo cargar la información del perfil.");
    }
  }

  function mostrarPerfil(c) {
    imgPreview.src = c.foto_Perfil ? `http://localhost:5022/perfil/${c.foto_Perfil}` : "perfil/default.png";
    form.Nombre.value = c.nombre || "";
    form.Apellido_Paterno.value = c.apellido_Paterno || "";
    form.Apellido_Materno.value = c.apellido_Materno || "";
    form.Telefono.value = c.telefono || "";
    form.Email.value = c.correo_E || "";
    form.Usuario.value = c.usuario || "";
    form.Contrasena.value = c.contraseña || "";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await guardarPerfil();
  });

  async function guardarPerfil() {
    try {
      const res = await fetch(`http://localhost:5022/api/cliente/${idCliente}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.Nombre.value,
          apellido_Paterno: form.Apellido_Paterno.value,
          apellido_Materno: form.Apellido_Materno.value,
          telefono: form.Telefono.value,
          correo_E: form.Email.value,
          usuario: form.Usuario.value,
          contraseña: form.Contrasena.value
        })
      });
      if (!res.ok) { alert((await res.json()).message || "Error al actualizar"); return; }
      await subirFoto();
      alert("Perfil actualizado correctamente.");
      cargarDatosCliente();
    } catch (err) {
      alert("No se pudieron guardar los cambios.");
    }
  }

  async function subirFoto() {
    const fotoFile = inputFoto.files[0];
    if (!fotoFile) return;
    const formData = new FormData();
    formData.append("foto", fotoFile);
    const res = await fetch(`http://localhost:5022/api/cliente/foto/${idCliente}`, { method: "PUT", body: formData });
    if (!res.ok) alert((await res.json()).message || "Error al actualizar la foto");
  }

  cargarDatosCliente();
});
