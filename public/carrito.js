let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// -------------------------
// ACTUALIZAR CARRITO
// -------------------------
function actualizarCarrito() {
  const contenedor = document.getElementById("carrito-lista");
  const totalSpan = document.getElementById("total");

  contenedor.innerHTML = "";
  let total = 0;

  carrito.forEach((item, index) => {
    const subtotal = item.cantidad * item.precio_Venta;
    total += subtotal;

    const div = document.createElement("div");
    div.className = "carrito-item";

    div.innerHTML = `
      <img src="fotos/${item.imagen}" alt="${item.nombre_P}" style="width: 80px; height: 80px;">
      <div class="info">
        <h4>${item.nombre_P}</h4>
        <p>Precio unitario: $${parseFloat(item.precio_Venta).toFixed(2)}</p>

        <label>Cantidad: </label>
        <input type="number"
               min="1"
               value="${item.cantidad}"
               data-index="${index}"
               class="cantidad-input">
      </div>

      <button class="eliminar" data-index="${index}">X</button>
    `;

    contenedor.appendChild(div);
  });

  totalSpan.textContent = total.toFixed(2);
  localStorage.setItem("carrito", JSON.stringify(carrito));

  agregarEventos();
}

// -------------------------
// EVENTOS DEL CARRITO
// -------------------------
function agregarEventos() {
  // Cambiar cantidad
  document.querySelectorAll(".cantidad-input").forEach(input => {
    input.addEventListener("change", (e) => {
      const index = e.target.dataset.index;
      const nuevaCantidad = parseInt(e.target.value);

      if (nuevaCantidad > 0) {
        carrito[index].Cantidad = nuevaCantidad;
        actualizarCarrito();
      }
    });
  });

  // Eliminar producto
  document.querySelectorAll(".eliminar").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      carrito.splice(index, 1);
      actualizarCarrito();
    });
  });
}

// -------------------------
// BOTÓN "COMPRAR"
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  actualizarCarrito();

  const comprarBtn = document.getElementById("comprarBtn");

  comprarBtn.addEventListener("click", () => {
    const ID_Cliente = parseInt(localStorage.getItem("ID_Cliente"), 10);

    const productos = carrito.map(p => ({
      ID_Producto: p.iD_Producto,
      Cantidad: p.cantidad,
      Precio_Unitario: p.precio_Venta
    }));

    const pedido = { ID_Cliente, productos };

    localStorage.setItem("pedido_en_proceso", JSON.stringify(pedido));

    window.location.href = "pago.html";
  });
});
