document.querySelector("#formLogin").addEventListener("submit", async (event) => {
    event.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const contraseña = document.getElementById("contraseña").value.trim();

    if (!usuario || !contraseña) {
        alert("Ingresa usuario y contraseña");
        return;
    }

    // Admin login via API
    if (usuario === "admin" && contraseña === "admin") {
        try {
            const res = await fetch("http://localhost:5022/api/auth/login-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Usuario: usuario, Contraseña: contraseña })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("adminToken", data.token);
                localStorage.setItem("adminId", data.id);
                window.location.href = "admin.html";
            } else {
                alert("Credenciales admin incorrectas");
            }
        } catch (error) {
            console.error("Error admin login:", error);
            alert("Error al conectar con servidor admin");
        }
        return;
    }

    // Cliente login via API
    try {
        const res = await fetch("http://localhost:5022/api/auth/login-cliente", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Usuario: usuario, Contraseña: contraseña })
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("clienteToken", data.token);
            localStorage.setItem("ID_Cliente", data.id);
            window.location.href = "cliente.html";
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el servidor");
    }
});

