let productos = [];

// Cargar productos desde el backend
async function cargarProductos() {
  try {
    const res = await fetch("http://localhost:5022/api/producto/menu");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    productos = await res.json();
    console.log("Productos recibidos del backend:", productos); // para debug
    mostrarProductos(productos);

  } catch (err) {
    console.error("Error al cargar productos:", err);
    document.querySelector("#productos").innerHTML =
      "<p>Error al cargar productos</p>";
  }
}

// Mostrar productos en tarjetas
function mostrarProductos(lista) {
  const contenedor = document.querySelector("#productos");
  contenedor.innerHTML = "";

  if (!lista || lista.length === 0) {
    contenedor.innerHTML = "<p>No hay productos disponibles</p>";
    return;
  }

  lista.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="http://localhost:5022/fotos/${p.imagen}" alt="${p.nombre_P}">
      <h4>${p.nombre_P}</h4>
      <p>${p.clasificacion}</p>
      <p><strong>$${parseFloat(p.precio_Venta).toFixed(2)}</strong></p>
      <button class="btn-comprar" data-producto='${JSON.stringify(p)}'>
        Comprar
      </button>
    `;

    contenedor.appendChild(card);
  });

  // Eventos de comprar
  document.querySelectorAll(".btn-comprar").forEach(btn => {
    btn.addEventListener("click", () => {
      const producto = JSON.parse(btn.dataset.producto);
      agregarAlCarrito(producto);
      window.location.href = "carrito.html"; // redirige al carrito
    });
  });
}

// Agregar al carrito
function agregarAlCarrito(producto) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  const existente = carrito.find(p => p.iD_Producto === producto.iD_Producto);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  alert(`${producto.Nombre_P} agregado al carrito.`);
}

// Filtros por clasificación
function aplicarFiltros() {
  const checks = document.querySelectorAll('input[name="filtro"]:checked');
  const filtros = Array.from(checks).map(c => c.value.toLowerCase());

  if (filtros.length === 0) {
    mostrarProductos(productos);
    return;
  }

  const filtrados = productos.filter(p =>
    filtros.some(f => p.Clasificacion.toLowerCase().includes(f))
  );

  mostrarProductos(filtrados);
}

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();

  const filtros = document.querySelectorAll('input[name="filtro"]');
  filtros.forEach(f => f.addEventListener("change", aplicarFiltros));
});
