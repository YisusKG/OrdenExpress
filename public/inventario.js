document.addEventListener("DOMContentLoaded", () => {
    const selectProducto = document.getElementById("producto");
    const cantidadInput = document.getElementById("cantidad");
    const form = document.getElementById("formEntrada");

    if (!localStorage.getItem("adminToken")) {
        alert("Sesión de admin requerida.");
        window.location.href = "login.html";
        return;
    }

    function getAdminHeaders() {
        return {
            "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
            "Content-Type": "application/json"
        };
    }

    async function fetchJson(url, options) {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }

    async function cargarProductos() {
        try {
            const productos = await fetchJson("http://localhost:5022/api/producto", { headers: getAdminHeaders() });
            selectProducto.innerHTML = "";
            productos.forEach(p => {
                const option = document.createElement("option");
                option.value = p.ID_Producto;
                option.textContent = p.Nombre_P;
                selectProducto.appendChild(option);
            });
        } catch (err) {
            alert("No se pudieron cargar los productos.");
        }
    }

    async function cargarInventario() {
        try {
            const tabla = document.querySelector("#tablaInventario tbody");
            tabla.innerHTML = "";
            const productos = await fetchJson("http://localhost:5022/api/producto/inventario", { headers: getAdminHeaders() });
            productos.forEach(p => agregarFilaInventario(tabla, p));
        } catch (err) {
            alert("No se pudo cargar el inventario.");
        }
    }

    function agregarFilaInventario(tabla, p) {
        const row = document.createElement("tr");
        const clase = obtenerClaseAlerta(p);
        row.innerHTML = `
            <td class="${clase}">${p.Nombre_P}</td>
            <td class="${clase}">${p.Descripcion}</td>
            <td class="${clase}">${p.Cantidad_Disponible}</td>
            <td>${p.Cantidad_Min ?? "N/A"}</td>
            <td>${p.Cantidad_Max ?? "N/A"}</td>
        `;
        tabla.appendChild(row);
    }

    function obtenerClaseAlerta(p) {
        if (p.Cantidad_Disponible < p.Cantidad_Min) return "alerta-min";
        if (p.Cantidad_Disponible > p.Cantidad_Max) return "alerta-max";
        return "";
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const ID_Producto = parseInt(selectProducto.value);
        const Cantidad = parseInt(cantidadInput.value);

        if (!ID_Producto || isNaN(Cantidad) || Cantidad <= 0) {
            alert("Selecciona un producto y una cantidad válida.");
            return;
        }
        await registrarEntrada(ID_Producto, Cantidad);
    });

    async function registrarEntrada(ID_Producto, Cantidad) {
        try {
            const data = await fetchJson(`http://localhost:5022/api/producto/entrada/${ID_Producto}`, {
                method: "PUT",
                headers: getAdminHeaders(),
                body: JSON.stringify(Cantidad)
            });
            alert(data.message || "Entrada de inventario registrada.");
            form.reset();
            await cargarInventario();
        } catch (err) {
            alert("Error al registrar entrada.");
        }
    }

    cargarProductos();
    cargarInventario();
});
