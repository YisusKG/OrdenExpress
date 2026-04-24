let productos = [];
let slideIndex = 0;

async function cargarProductos() {
    try {
        const res = await fetch("http://localhost:5022/api/Producto/menu");

        if (!res.ok) throw new Error("No se pudo obtener los productos");

        productos = await res.json();

        // Filtrar solo productos con imagen
        productos = productos.filter(p => p.Imagen || p.imagen);

        if (productos.length === 0) return;

        mostrarSlide(slideIndex);
        crearPaginacion();
        configurarBotonComprar();

    } catch (err) {
        console.error("Error al cargar productos:", err);
    }
}

function mostrarSlide(index) {
    const producto = productos[index];
    const contenido = document.getElementById("carrusel-contenido");

    contenido.classList.add("fade-out");

    setTimeout(() => {
        document.getElementById("nombreProducto").textContent =
            producto.nombre_P || "Producto sin nombre";

        document.getElementById("descripcionProducto").textContent =
            producto.descripcion || "Sin descripción disponible";

        const imagen = producto.imagen || "default.jpg";
        document.getElementById("imagenProducto").src = `fotos/${imagen}`;

        contenido.classList.remove("fade-out");

        const puntos = document.querySelectorAll(".punto");
        puntos.forEach((p, i) => p.classList.toggle("activo", i === index));
    }, 300);
}

function cambiarSlide(dir) {
    slideIndex = (slideIndex + dir + productos.length) % productos.length;
    mostrarSlide(slideIndex);
}

function crearPaginacion() {
    const contenedor = document.getElementById("paginacion");
    contenedor.innerHTML = "";

    productos.forEach((_, i) => {
        const punto = document.createElement("span");
        punto.classList.add("punto");

        if (i === slideIndex) punto.classList.add("activo");

        punto.addEventListener("click", () => {
            slideIndex = i;
            mostrarSlide(slideIndex);
        });

        contenedor.appendChild(punto);
    });
}

/* ============================
   NUEVO: Botón Comprar
   Guarda el producto en localStorage
   ============================ */
function configurarBotonComprar() {
    const btn = document.getElementById("btnComprar");

    btn.addEventListener("click", () => {
        const producto = productos[slideIndex];

        // Guardar en carrito
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        carrito.push({
            id: producto.id_Producto,
            nombre: producto.nombre_P,
            imagen: producto.imagen,
            precio: producto.precio_Venta,
            cantidad: 1
        });

        localStorage.setItem("carrito", JSON.stringify(carrito));

        // Ir a carrito
        window.location.href = "carrito.html";
    });
}

// ---------------------------
// Cerrar sesión
// ---------------------------
function cerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "Index.html";
}

document.addEventListener("DOMContentLoaded", cargarProductos);
