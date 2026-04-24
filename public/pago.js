document.addEventListener("DOMContentLoaded", () => {
  const totalSpan = document.getElementById("totalPago");
  const confirmarBtn = document.getElementById("confirmarPago");

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const ID_Cliente = localStorage.getItem("ID_Cliente");

  // --- Calcular total ---
  let total = 0;
  carrito.forEach(p => {
    total += Number(p.cantidad) * Number(p.precio_Venta);
  });

  totalSpan.textContent = total.toFixed(2);


  // ----- CONFIRMAR PAGO -----
  confirmarBtn.addEventListener("click", async () => {

    // Validar método de pago
    const metodoSeleccionado = document.querySelector('input[name="metodo"]:checked');
    if (!metodoSeleccionado) {
      alert("Selecciona un método de pago.");
      return;
    }

    const metodo = metodoSeleccionado.value;

    // Validar sesión
    if (!ID_Cliente) {
      alert("Debes iniciar sesión.");
      window.location.href = "index.html";
      return;
    }

    // Validar carrito
    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    // --- Estructurar productos para el backend ---
    const productos = carrito.map(p => ({
      ID_Producto: p.iD_Producto,
      Cantidad: Number(p.cantidad),
      Precio_Unitario: Number(p.precio_Venta)
    }));


    try {
      const res = await fetch("http://localhost:5022/api/pedido/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ID_Cliente: Number(ID_Cliente),
          Metodo_Pago: metodo,
          Total: total,
          Productos: productos
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Pago realizado con éxito.");
        localStorage.removeItem("carrito");
        window.location.href = "cliente.html";
      } else {
        alert(data.message || "Error al procesar el pago.");
      }

    } catch (err) {
      console.error("❌ Error al confirmar pago:", err);
      alert("Hubo un error al procesar el pago.");
    }
  });
});
