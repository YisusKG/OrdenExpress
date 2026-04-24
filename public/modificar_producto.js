document.addEventListener("DOMContentLoaded", async () => {
  if (!isAdmin()) { window.location.href = "login.html"; return; }

  const form = document.getElementById("formModificar");
  const selectProducto = document.getElementById("selectProducto");
  const precioVentaInput = form.Precio_Venta;

  function calcularPrecio() {
    const costo = parseFloat(form.Costo_Base.value) || 0;
    const pct = parseFloat(form.Porcentaje_Gan.value) || 0;
    precioVentaInput.value = (costo + costo * pct / 100).toFixed(2);
  }

  form.Costo_Base.addEventListener("input", calcularPrecio);
  form.Porcentaje_Gan.addEventListener("input", calcularPrecio);

  await cargarProductos();
  selectProducto.addEventListener("change", () => cargarDatosProducto(selectProducto.value));
  form.addEventListener("submit", manejarSubmit);

  async function cargarProductos() {
    try {
      const res = await fetch("http://localhost:5022/api/producto/menu", { headers: getAuthHeaders() });
      if (!res.ok) { manejarError403(res.status); return; }
      const productos = await res.json();
      productos.forEach(prod => agregarOpcion(prod));
    } catch (err) {
      alert("Error cargando productos.");
    }
  }

  function agregarOpcion(prod) {
    const opt = document.createElement("option");
    opt.value = prod.iD_Producto;
    opt.textContent = prod.nombreP;
    selectProducto.appendChild(opt);
  }

  function manejarError403(status) {
    if (status === 403) { window.location.href = "login.html"; }
  }

  async function cargarDatosProducto(id) {
    if (!id || id === "undefined") return;
    try {
      const res = await fetch(`http://localhost:5022/api/producto/${id}`, { headers: getAuthHeaders() });
      const data = await res.json();
      llenarFormulario(data);
    } catch (err) {
      alert("No se pudo cargar el producto.");
    }
  }

  function llenarFormulario(data) {
    form.Nombre_P.value = data.Nombre_P || "";
    form.Descripcion.value = data.Descripcion || "";
    form.Cantidad_Min.value = data.Cantidad_Min || 0;
    form.Cantidad_Max.value = data.Cantidad_Max || 0;
    form.Costo_Base.value = data.Costo_Base || 0;
    form.Porcentaje_Gan.value = data.Porcentaje_Gan || 0;
    precioVentaInput.value = data.Precio_Venta ? Number(data.Precio_Venta).toFixed(2) : "0.00";
    calcularPrecio();
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    const datos = {
      Nombre_P: form.Nombre_P.value,
      Descripcion: form.Descripcion.value,
      Cantidad_Min: parseInt(form.Cantidad_Min.value),
      Cantidad_Max: parseInt(form.Cantidad_Max.value),
      Costo_Base: parseFloat(form.Costo_Base.value),
      Porcentaje_Gan: parseFloat(form.Porcentaje_Gan.value),
      Precio_Venta: parseFloat(precioVentaInput.value)
    };
    try {
      const res = await fetch(`http://localhost:5022/api/producto/${selectProducto.value}`, {
        method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(datos)
      });
      const result = await res.json();
      alert(result.message || "Producto modificado correctamente.");
    } catch (err) {
      alert("Error al modificar producto.");
    }
  }
});
