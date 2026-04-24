document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formAgregar");

    const costoInput = document.getElementById("Costo_Base");
    const porcentajeInput = document.getElementById("Porcentaje_Gan");
    const precioVentaInput = document.getElementById("Precio_Venta");

    function calcularPrecioVenta() {
        const costo = parseFloat(costoInput.value);
        const porcentaje = parseFloat(porcentajeInput.value);

        if (!isNaN(costo) && !isNaN(porcentaje)) {
            const ganancia = (costo * porcentaje) / 100;
            precioVentaInput.value = (costo + ganancia).toFixed(2);
        } else {
            precioVentaInput.value = "";
        }
    }

    costoInput.addEventListener("input", calcularPrecioVenta);
    porcentajeInput.addEventListener("input", calcularPrecioVenta);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        console.log("📌 Datos enviados al backend:");
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }

        try {
            const response = await fetch("http://localhost:5022/api/producto/agregar", {
                method: "POST",
                body: formData
            });


            const texto = await response.text();
            console.log("Respuesta del backend:", texto);

            if (!response.ok) {
                alert("Error al agregar producto");
                return;
            }

            alert("Producto agregado correctamente");
            form.reset();
            precioVentaInput.value = "";

        } catch (error) {
            console.error("❌ Error al agregar producto:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
});
