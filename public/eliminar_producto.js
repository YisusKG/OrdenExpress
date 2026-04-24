document.addEventListener("DOMContentLoaded", async () => {
  if (!isAdmin()) {
    alert("Sesión de admin requerida.");
    window.location.href = "login.html";
    return;
  }

  const form = document.getElementById("formEliminar");
  const selectProducto = document.getElementById("selectProducto");

  await cargarProductos();
  form.addEventListener("submit", manejarSubmit);

  async function cargarProductos() {
    try {
      const response = await fetch("http://localhost:5022/api/producto", { headers: getAuthHeaders() });
      if (!response.ok) { manejarErrorAcceso(response.status); return; }
      const productos = await response.json();
      productos.forEach(prod => agregarOpcion(selectProducto, prod));
    } catch (err) {
      alert("Error al cargar productos. Verifica API en puerto 5022.");
    }
  }

  function agregarOpcion(select, prod) {
    const option = document.createElement("option");
    option.value = prod.ID_Producto;
    option.textContent = `${prod.Nombre_P} (ID: ${prod.ID_Producto})`;
    select.appendChild(option);
  }

  function manejarErrorAcceso(status) {
    if (status === 403) {
      alert("Acceso denegado. Login como admin requerido.");
      window.location.href = "login.html";
    }
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    const id = selectProducto.value;
    if (!id || !confirm(`¿Eliminar producto ID ${id}? Esta acción NO se puede deshacer.`)) return;
    await eliminarProducto(id);
  }

  async function eliminarProducto(id) {
    try {
      const res = await fetch(`http://localhost:5022/api/producto/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        alert("Producto eliminado correctamente!");
        selectProducto.remove(selectProducto.selectedIndex);
      } else {
        alert(`Error: ${data.message || "No se pudo eliminar"}`);
      }
    } catch (err) {
      alert("Error de conexión.");
    }
  }
});
