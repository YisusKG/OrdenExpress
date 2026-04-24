# ESTRUCTURA COMPLETA DEL PROYECTO ORDENEXPRESS

## 📁 ESTRUCTURA DE CARPETAS

```
OrdenExpress/
├── db/
│   └── script_base_datos.sql
├── OrdenExpressAPI/
│   ├── Controllers/
│   │   ├── AdministradorController.cs
│   │   ├── ClienteController.cs
│   │   ├── PedidoController.cs
│   │   ├── ProductoController.cs
│   │   └── DTOs/
│   │       └── LoginDTO.cs
│   ├── Data/
│   │   └── AppDbContext.cs
│   ├── Models/
│   │   ├── Administrador.cs
│   │   ├── Cliente.cs
│   │   ├── Pedido.cs
│   │   ├── Producto.cs
│   │   └── DTOs/
│   │       └── PedidoDTO.cs
│   ├── Services/
│   │   ├── IFileService.cs
│   │   └── FileService.cs
│   └── wwwroot/
├── routes/
│   ├── cliente.js
│   ├── pedido.js
│   ├── producto.js
│   ├── reportes.js
│   └── pagos.js
├── Services/
│   ├── IFileService.cs
│   └── FileService.cs
├── public/
│   ├── css/
│   │   └── estilos.css
│   ├── js/
│   │   └── app.js
│   ├── index.html
│   ├── login.html
│   ├── registro.html
│   ├── menu.html
│   ├── carrito.html
│   └── cocina.html
├── server.js
└── package.json
```

---

## 📄 CÓDIGOS COMPLETOS DE CADA ARCHIVO

---

### 1. server.js (Backend Node.js - Puerto 3000)

```javascript
const express = require('express');
const cors = require('cors');
const clienteRoutes = require('./routes/cliente');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.use('/cliente', clienteRoutes);

const productoRoutes = require('./routes/producto');
app.use('/producto', productoRoutes);

app.use('/fotos', express.static('fotos'));

app.use('/perfil', express.static('perfil'));

// Servir archivos estáticos del Frontend (public)
app.use(express.static('public'));

const pedidoRoutes = require('./routes/pedido');
app.use('/pedido', pedidoRoutes);

// Rutas de reportes
const reportesRoutes = require('./routes/reportes');
app.use('/reportes', reportesRoutes);

// Rutas de pagos (Stripe)
const pagosRoutes = require('./routes/pagos');
app.use('/pagos', pagosRoutes);


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
```

---

### 2. routes/cliente.js

```javascript
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const db = require('../db/config');
const multer = require('multer');
const path = require('path');

// Configuración de multer para foto de perfil
const storagePerfil = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'perfil'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const uploadPerfil = multer({ storage: storagePerfil });

/* =========================
   REGISTRO DE CLIENTE
========================= */
router.post('/', async (req, res) => {
  const { nombre, apellidoP, apellidoM, usuario, telefono, email, contrasena } = req.body;

  try {
    const pool = await sql.connect(db);
    await pool.request()
      .input('Nombre', sql.VarChar, nombre)
      .input('Apellido_Paterno', sql.VarChar, apellidoP)
      .input('Apellido_Materno', sql.VarChar, apellidoM)
      .input('Usuario', sql.VarChar, usuario)
      .input('Telefono', sql.VarChar, telefono)
      .input('Correo_E', sql.VarChar, email)
      .input('Contraseña', sql.VarChar, contrasena)
      .query(`
        INSERT INTO Cliente (Nombre, Apellido_Paterno, Apellido_Materno, Usuario, Telefono, Correo_E, Contraseña)
        VALUES (@Nombre, @Apellido_Paterno, @Apellido_Materno, @Usuario, @Telefono, @Correo_E, @Contraseña)
      `);

    res.json({ message: 'Cliente registrado correctamente' });
  } catch (err) {
    console.error('Error al registrar cliente:', err);
    res.status(500).json({ message: 'Error al registrar cliente' });
  }
});

/* =========================
   LOGIN
========================= */
router.post('/login', async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const pool = await sql.connect(db);
    const result = await pool.request()
      .input('Usuario', sql.VarChar, usuario)
      .input('Contrasena', sql.VarChar, contrasena)
      .query(`
        SELECT * FROM Cliente
        WHERE Usuario = @Usuario AND Contraseña = @Contrasena
      `);

    if (result.recordset.length > 0) {
      const cliente = result.recordset[0];
      res.json({
        message: 'Inicio de sesión exitoso',
        ID_Cliente: cliente.ID_Cliente,
        Foto_Perfil: cliente.Foto_Perfil || ''
      });
    } else {
      res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error del servidor en login' });
  }
});

/* =========================
   CARRUSEL DE PRODUCTOS
========================= */
router.get('/carrusel', async (req, res) => {
  try {
    const pool = await sql.connect(db);
    const result = await pool.request().query(`
      SELECT Nombre_P, Descripcion, Imagen
      FROM Producto
      WHERE Imagen IS NOT NULL
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener imágenes para el carrusel:", err);
    res.status(500).json({ message: "Error al obtener imágenes" });
  }
});

/* =========================
   SUBIR FOTO DE PERFIL
========================= */
router.put('/foto/:id', uploadPerfil.single('foto'), async (req, res) => {
  const id = parseInt(req.params.id);
  const nombreArchivo = req.file ? req.file.filename : null;

  if (!nombreArchivo || isNaN(id)) {
    return res.status(400).json({ message: 'Datos inválidos' });
  }

  try {
    const pool = await sql.connect(db);
    await pool.request()
      .input('ID_Cliente', sql.Int, id)
      .input('Foto_Perfil', sql.VarChar, nombreArchivo)
      .query(`
        UPDATE Cliente
        SET Foto_Perfil = @Foto_Perfil
        WHERE ID_Cliente = @ID_Cliente
      `);
    res.json({ message: 'Foto de perfil actualizada correctamente' });
  } catch (err) {
    console.error('Error al actualizar foto de perfil:', err);
    res.status(500).json({ message: 'Error al actualizar foto de perfil' });
  }
});

/* =========================
   OBTENER CLIENTE POR ID
========================= */
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

  try {
    const pool = await sql.connect(db);
    const result = await pool.request()
      .input('ID_Cliente', sql.Int, id)
      .query('SELECT * FROM Cliente WHERE ID_Cliente = @ID_Cliente');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al obtener cliente:', err);
    res.status(500).json({ message: 'Error al obtener cliente' });
  }
});

module.exports = router;
```

---

### 3. routes/pedido.js

```javascript
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const db = require('../db/config');

// Registrar pedido completo
router.post('/', async (req, res) => {
  const { ID_Cliente, productos } = req.body;

  if (!ID_Cliente || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ message: 'Datos de pedido inválidos' });
  }

  try {
    const pool = await sql.connect(db);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const request = new sql.Request(transaction);
    const fecha = new Date();
    const estado = 'Pendiente';

    // Insertar pedido
    const insertPedido = await request
      .input('ID_Cliente', sql.Int, ID_Cliente)
      .input('Fecha', sql.Date, fecha)
      .input('Estado', sql.VarChar(50), estado)
      .query(`
        INSERT INTO Pedido (ID_Cliente, Fecha, Estado)
        OUTPUT INSERTED.ID_Pedido
        VALUES (@ID_Cliente, @Fecha, @Estado)
      `);

    const ID_Pedido = insertPedido.recordset[0].ID_Pedido;

    // Insertar detalle y actualizar inventario
    for (const prod of productos) {
      const subtotal = parseFloat(prod.Cantidad) * parseFloat(prod.Precio_Unitario);
      const total = subtotal;

      await new sql.Request(transaction)
        .input('ID_Pedido', sql.Int, ID_Pedido)
        .input('ID_Producto', sql.Int, prod.ID_Producto)
        .input('Cantidad', sql.Int, prod.Cantidad)
        .input('Total', sql.Decimal(10, 2), total)
        .query(`
          INSERT INTO Detalle_Pedido (ID_Pedido, ID_Producto, Cantidad, Total)
          VALUES (@ID_Pedido, @ID_Producto, @Cantidad, @Total)
        `);

      // Restar del inventario
      await new sql.Request(transaction)
        .input('ID_Producto', sql.Int, prod.ID_Producto)
        .input('Cantidad', sql.Int, prod.Cantidad)
        .query(`
          UPDATE Producto
          SET Cantidad_Disponible = Cantidad_Disponible - @Cantidad
          WHERE ID_Producto = @ID_Producto
        `);
    }

    await transaction.commit();
    res.json({ message: 'Pedido registrado correctamente', ID_Pedido });
  } catch (err) {
    console.error('Error al registrar pedido:', err);
    res.status(500).json({ message: 'Error al registrar pedido' });
  }
});


module.exports = router;
```

---

### 4. routes/producto.js

```javascript
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const db = require('../db/config');
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'fotos');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// POST /producto
router.post('/', upload.single('Imagen'), async (req, res) => {
  const {
    Nombre_P,
    Clasificacion,
    Descripcion,
    Cantidad_Disponible,
    Cantidad_Min,
    Cantidad_Max,
    Costo_Base,
    Porcentaje_Gan
  } = req.body;

  const Imagen = req.file ? req.file.filename : null;

  // Calcular precio de venta
  const porcentaje = parseFloat(Porcentaje_Gan || 0);
  const costoBase = parseFloat(Costo_Base);
  const precioVenta = costoBase + (costoBase * porcentaje / 100);

  try {
    const pool = await sql.connect(db);
    await pool.request()
      .input('Nombre_P', sql.VarChar, Nombre_P)
      .input('Clasificacion', sql.VarChar, Clasificacion)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('Cantidad_Disponible', sql.Int, Cantidad_Disponible)
      .input('Cantidad_Min', sql.Int, Cantidad_Min)
      .input('Cantidad_Max', sql.Int, Cantidad_Max)
      .input('Costo_Base', sql.Decimal(10, 2), costoBase)
      .input('Precio_Venta', sql.Decimal(10, 2), precioVenta)
      .input('Porcentaje_Gan', sql.Int, porcentaje)
      .input('Imagen', sql.VarChar, Imagen)
      .query(`
        INSERT INTO Producto (
          Nombre_P, Clasificacion, Descripcion,
          Cantidad_Disponible, Cantidad_Min, Cantidad_Max,
          Costo_Base, Precio_Venta, Porcentaje_Gan, Imagen
        )
        VALUES (
          @Nombre_P, @Clasificacion, @Descripcion,
          @Cantidad_Disponible, @Cantidad_Min, @Cantidad_Max,
          @Costo_Base, @Precio_Venta, @Porcentaje_Gan, @Imagen
        )
      `);

    res.json({ message: 'Producto agregado correctamente con imagen y porcentaje de ganancia' });
  } catch (err) {
    console.error('Error al agregar producto:', err);
    res.status(500).json({ message: 'Error al agregar producto' });
  }
});


// Obtener todos los productos para llenar el select
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(db);
    const result = await pool.request().query('SELECT ID_Producto, Nombre_P FROM Producto');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// Obtener productos para tabla de inventario
router.get('/inventario', async (req, res) => {
  try {
    const pool = await sql.connect(db);
    const result = await pool.request().query(`
      SELECT 
        ID_Producto,
        Nombre_P,
        Descripcion,
        Cantidad_Disponible,
        Cantidad_Min,
        Cantidad_Max
      FROM Producto
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener inventario:', err);
    res.status(500).json({ message: 'Error al obtener inventario' });
  }
});


// Registrar entrada al inventario
router.put('/entrada/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { cantidad } = req.body;

  if (isNaN(id) || !cantidad || cantidad <= 0) {
    return res.status(400).json({ message: 'ID o cantidad inválida' });
  }

  try {
    const pool = await sql.connect(db);
    await pool.request()
      .input('ID_Producto', sql.Int, id)
      .input('Cantidad', sql.Int, cantidad)
      .query(`
        UPDATE Producto
        SET Cantidad_Disponible = Cantidad_Disponible + @Cantidad
        WHERE ID_Producto = @ID_Producto
      `);
    res.json({ message: 'Entrada de inventario registrada correctamente' });
  } catch (err) {
    console.error('Error al registrar entrada:', err);
    res.status(500).json({ message: 'Error al registrar entrada' });
  }
});

router.get('/menu', async (req, res) => {
  try {
    const pool = await sql.connect(db);
    const result = await pool.request().query(`
      SELECT ID_Producto, Nombre_P, Clasificacion, Precio_Venta, Imagen
      FROM Producto
      WHERE Imagen IS NOT NULL
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener productos del menú:", err);
    res.status(500).json({ message: "Error al obtener menú" });
  }
});

// ESTA RUTA DEBE IR AL FINAL
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const pool = await sql.connect(db);
    const result = await pool.request()
      .input('ID_Producto', sql.Int, id)
      .query('SELECT * FROM Producto WHERE ID_Producto = @ID_Producto');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al obtener producto por ID:', err);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const {
    Nombre_P,
    Descripcion,
    Cantidad_Min,
    Cantidad_Max,
    Costo_Base,
    Porcentaje_Gan
  } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  // Validaciones básicas
  if (!Nombre_P || isNaN(Costo_Base) || isNaN(Porcentaje_Gan)) {
    return res.status(400).json({ message: 'Datos incompletos o inválidos' });
  }

  try {
    const Precio_Venta = parseFloat(Costo_Base) + (parseFloat(Costo_Base) * parseInt(Porcentaje_Gan) / 100);

    const pool = await sql.connect(db);
    await pool.request()
      .input('ID_Producto', sql.Int, id)
      .input('Nombre_P', sql.VarChar, Nombre_P)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('Cantidad_Min', sql.Int, Cantidad_Min)
      .input('Cantidad_Max', sql.Int, Cantidad_Max)
      .input('Costo_Base', sql.Decimal(10, 2), Costo_Base)
      .input('Porcentaje_Gan', sql.Int, Porcentaje_Gan)
      .input('Precio_Venta', sql.Decimal(10, 2), Precio_Venta)
      .query(`
        UPDATE Producto SET
          Nombre_P = @Nombre_P,
          Descripcion = @Descripcion,
          Cantidad_Min = @Cantidad_Min,
          Cantidad_Max = @Cantidad_Max,
          Costo_Base = @Costo_Base,
          Porcentaje_Gan = @Porcentaje_Gan,
          Precio_Venta = @Precio_Venta
        WHERE ID_Producto = @ID_Producto
      `);

    res.json({ message: 'Producto modificado correctamente' });

  } catch (err) {
    console.error('Error al modificar producto:', err);
    res.status(500).json({ message: 'Error al modificar producto' });
  }
});


module.exports = router;
```

---

### 5. routes/reportes.js

```javascript
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const db = require('../db/config');

/* =========================
   REPORTE DE VENTAS DIARIAS
========================= */
router.get('/ventas/diarias', async (req, res) => {
  const { fecha } = req.query;
  const fechaBusqueda = fecha || new Date().toISOString().split('T')[0];

  try {
    const pool = await sql.connect(db);
    const result = await pool.request()
      .input('Fecha', sql.Date, fechaBusqueda)
      .query(`
        SELECT 
          p.ID_Pedido,
          p.Fecha,
          p.Estado,
          p.Total,
          c.Nombre as Cliente,
          c.Telefono
        FROM Pedido p
        LEFT JOIN Cliente c ON p.ID_Cliente = c.ID_Cliente
        WHERE CAST(p.Fecha AS DATE) = @Fecha
        ORDER BY p.Fecha DESC
      `);

    // Calcular total del día
    const totalDia = result.recordset.reduce((sum, pedido) => sum + parseFloat(pedido.Total || 0), 0);

    res.json({
      fecha: fechaBusqueda,
      pedidos: result.recordset,
      totalVentas: totalDia,
      cantidadPedidos: result.recordset.length
    });
  } catch (err) {
    console.error('Error en reporte diario:', err);
    res.status(500).json({ message: 'Error al obtener reporte diario' });
  }
});

/* =========================
   REPORTE DE VENTAS SEMANALES
========================= */
router.get('/ventas/semanales', async (req, res) => {
  try {
    const pool = await sql.connect(db);
    const result = await pool.request().query(`
      SELECT 
        DATEPART(WEEKDAY, p.Fecha) as DiaSemana,
        DATENAME(WEEKDAY, p.Fecha) as NombreDia,
        COUNT(*) as CantidadPedidos,
        SUM(p.Total) as TotalVentas
      FROM Pedido p
      WHERE p.Fecha >= DATEADD(DAY, -7, GETDATE())
      GROUP BY DATEPART(WEEKDAY, p.Fecha), DATENAME(WEEKDAY, p.Fecha)
      ORDER BY DATEPART(WEEKDAY, p.Fecha)
    `);

    const totalSemana = result.recordset.reduce((sum, dia) => sum + parseFloat(dia.TotalVentas || 0), 0);

    res.json({
      periodo: 'Últimos 7 días',
      detalles: result.recordset,
      totalVentas: totalSemana
    });
  } catch (err) {
    console.error('Error en reporte semanal:', err);
    res.status(500).json({ message: 'Error al obtener reporte semanal' });
  }
});

/* =========================
   REPORTE DE VENTAS MENSUALES
========================= */
router.get('/ventas/mensuales', async (req, res) => {
  const { mes, año } = req.query;
  const mesActual = mes || new Date().getMonth() + 1;
  const añoActual = año || new Date().getFullYear();

  try {
    const pool = await sql.connect(db);
    const result = await pool.request()
      .input('Mes', sql.Int, mesActual)
      .input('Año', sql.Int, añoActual)
      .query(`
        SELECT 
          DAY(p.Fecha) as Dia,
          COUNT(*) as CantidadPedidos,
          SUM(p.Total) as TotalVentas
        FROM Pedido p
        WHERE MONTH(p.Fecha) = @Mes AND YEAR(p.Fecha) = @Año
        GROUP BY DAY(p.Fecha)
        ORDER BY DAY(p.Fecha)
      `);

    const totalMes = result.recordset.reduce((sum, dia) => sum + parseFloat(dia.TotalVentas || 0), 0);

    res.json({
      mes: mesActual,
      año: añoActual,
      detalles: result.recordset,
      totalVentas: totalMes,
      cantidadPedidos: result.recordset.reduce((sum, dia) => sum + dia.CantidadPedidos, 0)
    });
  } catch (err) {
    console.error('Error en reporte mensual:', err);
    res.status(500).json({ message: 'Error al obtener reporte mensual' });
  }
});

/* =========================
   PRODUCTOS MÁS VENDIDOS
========================= */
router.get('/productos/mas-vendidos', async (req, res) => {
  const { limite } = req.query;
  const top = limite || 10;

  try {
    const pool = await sql.connect(db);
    const result = await pool.request()
      .input('Top', sql.Int, top)
      .query(`
        SELECT TOP (@Top)
          pr.ID_Producto,
          pr.Nombre_P,
          pr.Clasificacion,
          SUM(dp.Cantidad) as CantidadVendida,
          SUM(dp.Total) as Ingresos
        FROM Detalle_Pedido dp
        INNER JOIN Producto pr ON dp.ID_Producto = pr.ID_Producto
        GROUP BY pr.ID_Producto, pr.Nombre_P, pr.Clasificacion
        ORDER BY CantidadVendida DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error en productos más vendidos:', err);
    res.status(500).json({ message: 'Error al obtener productos más vendidos' });
  }
});

/* =========================
   RESUMEN GENERAL DE VENTAS
========================= */
router.get('/ventas/resumen', async (req, res) => {
  try {
    const pool = await sql.connect(db);

    // Total de ventas histórico
    const totalHistorico = await pool.request().query(`
      SELECT SUM(Total) as Total FROM Pedido
    `);

    // Ventas de hoy
    const ventasHoy = await pool.request().query(`
      SELECT SUM(Total) as Total FROM Pedido 
      WHERE CAST(Fecha AS DATE) = CAST(GETDATE() AS DATE)
    `);

    // Pedidos de hoy
    const pedidosHoy = await pool.request().query(`
      SELECT COUNT(*) as Total FROM Pedido 
      WHERE CAST(Fecha AS DATE) = CAST(GETDATE() AS DATE)
    `);

    // Total de clientes
    const totalClientes = await pool.request().query(`
      SELECT COUNT(*) as Total FROM Cliente
    `);

    // Total de productos
    const totalProductos = await pool.request().query(`
      SELECT COUNT(*) as Total FROM Producto
    `);

    res.json({
      ventasTotales: totalHistorico.recordset[0].Total || 0,
      ventasHoy: ventasHoy.recordset[0].Total || 0,
      pedidosHoy: pedidosHoy.recordset[0].Total || 0,
      totalClientes: totalClientes.recordset[0].Total || 0,
      totalProductos: totalProductos.recordset[0].Total || 0
    });
  } catch (err) {
    console.error('Error en resumen:', err);
    res.status(500).json({ message: 'Error al obtener resumen' });
  }
});

module.exports = router;
```

---

### 6. routes/pagos.js

```javascript
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const db = require('../db/config');

// Verificar si Stripe está configurado
let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch (e) {
  console.log('⚠️ Stripe no configurado. Los pagos serán en efectivo.');
}

/* =========================
   CREAR SESIÓN DE PAGO (STRIPE CHECKOUT)
========================= */
router.post('/crear-sesion-pago', async (req, res) => {
  const { productos, idPedido } = req.body;

  if (!stripe) {
    return res.status(503).json({ 
      message: 'Pagos con tarjeta no disponibles. Use efectivo en tienda.',
      modoPago: 'efectivo'
    });
  }

  if (!productos || productos.length === 0) {
    return res.status(400).json({ message: 'No hay productos en el carrito' });
  }

  try {
    const lineItems = productos.map(p => ({
      price_data: {
        currency: 'mxn',
        product_data: { 
          name: p.Nombre_P || p.nombre,
          description: p.Descripcion || ''
        },
        unit_amount: Math.round((p.Precio_Venta || p.precio) * 100),
      },
      quantity: p.Cantidad || p.cantidad,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pago-exitoso?id=${idPedido}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/carrito`,
      metadata: {
        idPedido: idPedido?.toString() || ''
      }
    });

    res.json({ 
      id: session.id, 
      url: session.url,
      modoPago: 'stripe'
    });
  } catch (err) {
    console.error('Error al crear sesión de pago:', err);
    res.status(500).json({ message: 'Error al procesar pago con tarjeta' });
  }
});

/* =========================
   WEBHOOK DE STRIPE
========================= */
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  if (!stripe) {
    return res.status(503).send();
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Error en webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const idPedido = session.metadata?.idPedido;

    if (idPedido) {
      try {
        const pool = await sql.connect(db);
        await pool.request()
          .input('ID_Pedido', sql.Int, idPedido)
          .input('MetodoPago', sql.VarChar, 'Tarjeta')
          .query(`
            UPDATE Pedido 
            SET Metodo_Pago = @MetodoPago,
                Estado = 'Pagado'
            WHERE ID_Pedido = @ID_Pedido
          `);
        console.log(`✅ Pago confirmado para pedido ${idPedido}`);
      } catch (err) {
        console.error('Error al actualizar pago:', err);
      }
    }
  }

  res.json({ received: true });
});

/* =========================
   CONFIRMAR PAGO EN EFECTIVO
========================= */
router.post('/pago-efectivo', async (req, res) => {
  const { idPedido } = req.body;

  if (!idPedido) {
    return res.status(400).json({ message: 'ID de pedido requerido' });
  }

  try {
    const pool = await sql.connect(db);
    await pool.request()
      .input('ID_Pedido', sql.Int, idPedido)
      .input('MetodoPago', sql.VarChar, 'Efectivo')
      .query(`
        UPDATE Pedido 
        SET Metodo_Pago = @MetodoPago
        WHERE ID_Pedido = @ID_Pedido
      `);

    res.json({ message: 'Pago en efectivo registrado. Pague al recibir su pedido.' });
  } catch (err) {
    console.error('Error al registrar pago en efectivo:', err);
    res.status(500).json({ message: 'Error al procesar pago' });
  }
});

/* =========================
   OBTENER MÉTODOS DE PAGO DISPONIBLES
========================= */
router.get('/metodos', async (req, res) => {
  const metodos = [];
  
  if (stripe && process.env.STRIPE_SECRET_KEY) {
    metodos.push({ 
      id: 'tarjeta', 
      nombre: 'Pago con Tarjeta',
      icono: '💳'
    });
  }
  
  metodos.push({ 
    id: 'efectivo', 
    nombre: 'Pago en Efectivo',
    icono: '💵'
  });

  res.json({ metodos });
});

module.exports = router;
```

---

## 📦 BACKEND .NET (OrdenExpressAPI)

### 7. OrdenExpressAPI/Models/Cliente.cs

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrdenExpressAPI.Models
{
    [Table("Cliente")]
    public class Cliente
    {
        [Key]
        public int ID_Cliente { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Apellido_Paterno { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Apellido_Materno { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Correo_E { get; set; } = string.Empty;

        [Required]
        [Phone]
        [StringLength(20)]
        public string Telefono { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Usuario { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string Contraseña { get; set; } = string.Empty;

        public string? Foto_Perfil { get; set; }

        public ICollection<Pedido>? Pedidos { get; set; }
    }
}
```

---

### 8. OrdenExpressAPI/Models/Pedido.cs

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrdenExpressAPI.Models
{
    [Table("Pedido")]
    public class Pedido
    {
        [Key]
        public int ID_Pedido { get; set; }

        [Required]
        public int ID_Cliente { get; set; }

        [ForeignKey("ID_Cliente")]
        public Cliente? Cliente { get; set; }

        [Required]
        public DateTime Fecha { get; set; } = DateTime.Now;

        [Required]
        [StringLength(50)]
        public string Estado { get; set; } = "Pendiente";

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }

        [StringLength(50)]
        public string Metodo_Pago { get; set; } = "Efectivo";

        public ICollection<Detalle_Pedido>? Detalles { get; set; }
    }

    [Table("Detalle_Pedido")]
    public class Detalle_Pedido
    {
        [Key]
        public int ID_Detalle { get; set; }

        [Required]
        public int ID_Pedido { get; set; }

        [ForeignKey("ID_Pedido")]
        public Pedido? Pedido { get; set; }

        [Required]
        public int ID_Producto { get; set; }

        [ForeignKey("ID_Producto")]
        public Producto? Producto { get; set; }

        [Required]
        public int Cantidad { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }
    }
}
```

---

### 9. OrdenExpressAPI/Models/Producto.cs

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrdenExpressAPI.Models
{
    [Table("Producto")]
    public class Producto
    {
        [Key]
        public int ID_Producto { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre_P { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Clasificacion { get; set; }

        [Required]
        [StringLength(500)]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        public int Cantidad_Disponible { get; set; }

        public int? Cantidad_Min { get; set; }
        public int? Cantidad_Max { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Costo_Base { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Precio_Venta { get; set; }

        public string? Imagen { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? Porcentaje_Gan { get; set; }
    }
}
```

---

### 10. OrdenExpressAPI/Models/Administrador.cs

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrdenExpressAPI.Models
{
    [Table("Administrador")]
    public class Administrador
    {
        [Key]
        public int ID_Administrador { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre_A { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Apellido_PaternoA { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Apellido_MaternoA { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Correo_E { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Usuario { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string Contraseña { get; set; } = string.Empty;
    }
}
```

---

### 11. OrdenExpressAPI/Models/DTOs/LoginDTO.cs

```csharp
using System.ComponentModel.DataAnnotations;

namespace OrdenExpressAPI.Models.DTOs
{
    public class LoginDTO
    {
        [Required]
        public string Usuario { get; set; }

        [Required]
        public string Contraseña { get; set; }

        /// <summary>
        /// Contraseña asociada al usuario.
        /// </summary>
        /// <value>Cadena de texto obligatoria.</value>
        [Required]
        public string Contraseña { get; set; }
    }
}
```

---

### 16. Services/FileService.cs

```csharp
using Microsoft.AspNetCore.Http;

namespace OrdenExpressAPI.Services
{
    /// <summary>
    /// Servicio encargado de la gestión y almacenamiento de archivos en el servidor.
    /// </summary>
    /// <remarks>
    /// Implementa la interfaz IFileService.
    /// Permite guardar archivos dentro del directorio wwwroot
    /// organizándolos en carpetas específicas.
    /// </remarks>
    public class FileService : IFileService
    {

        /// <summary>
        /// Guarda un archivo en la carpeta especificada dentro del servidor.
        /// </summary>
        /// <param name="file">Archivo recibido desde el cliente.</param>
        /// <param name="folderName">Nombre de la carpeta donde será almacenado.</param>
        /// <returns>
        /// Retorna el nombre generado del archivo si la operación es exitosa.
        /// Retorna null si el archivo es inválido.
        /// </returns>
        public async Task<string> SaveFileAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0)
                return null;

            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", folderName);

            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var fullPath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return fileName;
        }
    }
}
```

---

### 17. Services/IFileService.cs

```csharp
using Microsoft.AspNetCore.Http;

namespace OrdenExpressAPI.Services
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file, string folderName);
    }
}
```

---

## 📋 Resumen del Proyecto

El proyecto **OrdenExpress** es una aplicación de pedidos con dos partes:

1. **Backend Node.js/Express** (Puerto 3000):
   - API RESTful para clientes, productos y pedidos
   - Usa SQL Server como base de datos
   - Manejo de imágenes con Multer

2. **Backend .NET Core API**:
   - Controladores para Cliente, Administrador, Pedido y Producto
   - Entity Framework Core para acceso a datos
   - Servicio de manejo de archivos

### Tecnologías utilizadas:
- **Frontend**: (No incluida en los archivos mostrados)
- **Backend Node.js**: Express, mssql, multer, cors
- **Backend .NET**: ASP.NET Core, Entity Framework Core
- **Base de datos**: SQL Server

---

*Documento generado automáticamente para el proyecto OrdenExpress*

