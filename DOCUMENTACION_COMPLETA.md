# 📋 DOCUMENTACIÓN COMPLETA DEL PROYECTO ORDENEXPRESS

## 📁 ESTRUCTURA GENERAL DEL PROYECTO

```
OrdenExpress/
├── server.js                    # Servidor principal Express.js
├── package.json                 # Dependencias Node.js
├── .env.example                  # Ejemplo de variables de entorno
├── db/
│   ├── config.js                # Configuración de base de datos
│   └── script_base_datos.sql   # Script SQL Server
├── routes/
│   ├── cliente.js               # Rutas de clientes
│   ├── producto.js             # Rutas de productos
│   ├── pedido.js               # Rutas de pedidos
│   └── reportes.js            # Rutas de reportes
├── OrdenExpressAPI/            # Proyecto .NET (API)
│   ├── Controllers/
│   ├── Models/
│   ├── Data/
│   └── ...
└── Services/
    ├── FileService.cs
    └── IFileService.cs
```

---

## 📄 CÓDIGOS COMPLETOS

### 1. server.js (Servidor Principal)

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

const pedidoRoutes = require('./routes/pedido');
app.use('/pedido', pedidoRoutes);

const reportesRoutes = require('./routes/reportes');
app.use('/reportes', reportesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
```

---

### 2. db/config.js (Configuración de Base de Datos)

```javascript
const sql = require('mssql');

const dbConfig = {
  user: 'sa',
  password: 'tu_contraseña',
  server: 'localhost',
  database: 'OrdenExpress',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

const db = dbConfig;

module.exports = db;
```

---

### 3. routes/cliente.js (Gestión de Clientes)

```javascript
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const db = require('../db/config');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

// Configuración de multer para foto de perfil
const storagePerfil = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'perfil'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const uploadPerfil = multer({ storage: storagePerfil });

/* =========================
   REGISTRO DE CLIENTE (CON BCRYPT)
========================= */
router.post('/', async (req, res) => {
  const { nombre, apellidoP, apellidoM, usuario, telefono, email, contrasena } = req.body;

  if (!contrasena) {
    return res.status(400).json({ message: 'La contraseña es requerida' });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

    const pool = await sql.connect(db);
    await pool.request()
      .input('Nombre', sql.VarChar, nombre)
      .input('Apellido_Paterno', sql.VarChar, apellidoP)
      .input('Apellido_Materno', sql.VarChar, apellidoM)
      .input('Usuario', sql.VarChar, usuario)
      .input('Telefono', sql.VarChar, telefono)
      .input('Correo_E', sql.VarChar, email)
      .input('Contraseña', sql.VarChar, hashedPassword)
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
   LOGIN (CON BCRYPT)
========================= */
router.post('/login', async (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
  }

  try {
    const pool = await sql.connect(db);
    const result = await pool.request()
      .input('Usuario', sql.VarChar, usuario)
      .query(`
        SELECT * FROM Cliente
        WHERE Usuario = @Usuario
      `);

    if (result.recordset.length > 0) {
      const cliente = result.recordset[0];
      const passwordMatch = await bcrypt.compare(contrasena, cliente.Contraseña);
      const isLegacyPassword = cliente.Contraseña === contrasena;
      
      if (passwordMatch || isLegacyPassword) {
        res.json({
          message: 'Inicio de sesión exitoso',
          ID_Cliente: cliente.ID_Cliente,
          Foto_Perfil: cliente.Foto_Perfil || ''
        });
      } else {
        res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      }
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

### 4. routes/pedido.js (Gestión de Pedidos)

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

/* =========================
   CAMBIAR ESTADO DEL PEDIDO (COCINERO)
========================= */
router.put('/estado/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { Estado } = req.body;

  const estadosValidos = ['Pendiente', 'En Preparación', 'Listo', 'Entregado', 'Cancelado'];

  if (isNaN(id) || !Estado) {
    return res.status(400).json({ message: 'ID o estado inválido' });
  }

  if (!estadosValidos.includes(Estado)) {
    return res.status(400).json({ message: 'Estado no válido. Estados: ' + estadosValidos.join(', ') });
  }

  try {
    const pool = await sql.connect(db);
    await pool.request()
      .input('ID_Pedido', sql.Int, id)
      .input('Estado', sql.VarChar(50), Estado)
      .query(`
        UPDATE Pedido
        SET Estado = @Estado
        WHERE ID_Pedido = @ID_Pedido
      `);
    res.json({ message: `Estado actualizado a: ${Estado}` });
  } catch (err) {
    console.error('Error al cambiar estado:', err);
    res.status(500).json({ message: 'Error al cambiar estado del pedido' });
  }
});

/* =========================
   OBTENER PEDIDOS POR CLIENTE
========================= */
router.get('/cliente/:idCliente', async (req, res) => {
  const idCliente = parseInt(req.params.idCliente);

  if (isNaN(idCliente)) {
    return res.status(400).json({ message: 'ID de cliente inválido' });
  }

  try {
    const pool = await sql.connect(db);
    const result = await pool.request()
      .input('ID_Cliente', sql.Int, idCliente)
      .query(`
        SELECT p.ID_Pedido, p.Fecha, p.Estado, p.Total,
               dp.ID_Producto, dp.Cantidad, dp.Total as Subtotal,
               pr.Nombre_P
        FROM Pedido p
        LEFT JOIN Detalle_Pedido dp ON p.ID_Pedido = dp.ID_Pedido
        LEFT JOIN Producto pr ON dp.ID_Producto = pr.ID_Producto
        WHERE p.ID_Cliente = @ID_Cliente
        ORDER BY p.Fecha DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener pedidos del cliente:', err);
    res.status(500).json({ message: 'Error al obtener pedidos' });
  }
});

/* =========================
   OBTENER TODOS LOS PEDIDOS (PARA COCINA/ADMIN)
========================= */
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(db);
    const result = await pool.request().query(`
      SELECT p.ID_Pedido, p.ID_Cliente, p.Fecha, p.Estado, p.Total,
             c.Nombre as NombreCliente, c.Telefono
      FROM Pedido p
      LEFT JOIN Cliente c ON p.ID_Cliente = c.ID_Cliente
      ORDER BY p.Fecha DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    res.status(500).json({ message: 'Error al obtener pedidos' });
  }
});

module.exports = router;
```

---

### 5. routes/producto.js (Gestión de Productos)

```javascript
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const db = require('../db/config');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'fotos'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// POST /producto - Agregar producto
router.post('/', upload.single('Imagen'), async (req, res) => {
  const {
    Nombre_P, Clasificacion, Descripcion,
    Cantidad_Disponible, Cantidad_Min, Cantidad_Max,
    Costo_Base, Porcentaje_Gan
  } = req.body;

  const Imagen = req.file ? req.file.filename : null;
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
        INSERT INTO Producto (Nombre_P, Clasificacion, Descripcion,
          Cantidad_Disponible, Cantidad_Min, Cantidad_Max,
          Costo_Base, Precio_Venta, Porcentaje_Gan, Imagen)
        VALUES (@Nombre_P, @Clasificacion, @Descripcion,
          @Cantidad_Disponible, @Cantidad_Min, @Cantidad_Max,
          @Costo_Base, @Precio_Venta, @Porcentaje_Gan, @Imagen)
      `);

    res.json({ message: 'Producto agregado correctamente' });
  } catch (err) {
    console.error('Error al agregar producto:', err);
    res.status(500).json({ message: 'Error al agregar producto' });
  }
});

// Obtener todos los productos
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

// Obtener productos para inventario
router.get('/inventario', async (req, res) => {
  try {
    const pool = await sql.connect(db);
    const result = await pool.request().query(`
      SELECT ID_Producto, Nombre_P, Descripcion, Cantidad_Disponible, Cantidad_Min, Cantidad_Max
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

// Obtener menú
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

// Obtener producto por ID
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

// Modificar producto
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { Nombre_P, Descripcion, Cantidad_Min, Cantidad_Max, Costo_Base, Porcentaje_Gan } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

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
          Nombre_P = @Nombre_P, Descripcion = @Descripcion,
          Cantidad_Min = @Cantidad_Min, Cantidad_Max = @Cantidad_Max,
          Costo_Base = @Costo_Base, Porcentaje_Gan = @Porcentaje_Gan,
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

### 6. routes/reportes.js (Reportes de Ventas)

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
        SELECT p.ID_Pedido, p.Fecha, p.Estado, p.Total, c.Nombre as Cliente, c.Telefono
        FROM Pedido p
        LEFT JOIN Cliente c ON p.ID_Cliente = c.ID_Cliente
        WHERE CAST(p.Fecha AS DATE) = @Fecha
        ORDER BY p.Fecha DESC
      `);

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
      SELECT DATEPART(WEEKDAY, p.Fecha) as DiaSemana,
             DATENAME(WEEKDAY, p.Fecha) as NombreDia,
             COUNT(*) as CantidadPedidos,
             SUM(p.Total) as TotalVentas
      FROM Pedido p
      WHERE p.Fecha >= DATEADD(DAY, -7, GETDATE())
      GROUP BY DATEPART(WEEKDAY, p.Fecha), DATENAME(WEEKDAY, p.Fecha)
      ORDER BY DATEPART(WEEKDAY, p.Fecha)
    `);

    const totalSemana = result.recordset.reduce((sum, dia) => sum + parseFloat(dia.TotalVentas || 0), 0);

    res.json({ periodo: 'Últimos 7 días', detalles: result.recordset, totalVentas: totalSemana });
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
        SELECT DAY(p.Fecha) as Dia, COUNT(*) as CantidadPedidos, SUM(p.Total) as TotalVentas
        FROM Pedido p
        WHERE MONTH(p.Fecha) = @Mes AND YEAR(p.Fecha) = @Año
        GROUP BY DAY(p.Fecha)
        ORDER BY DAY(p.Fecha)
      `);

    const totalMes = result.recordset.reduce((sum, dia) => sum + parseFloat(dia.TotalVentas || 0), 0);

    res.json({
      mes: mesActual, año: añoActual,
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
        SELECT TOP (@Top) pr.ID_Producto, pr.Nombre_P, pr.Clasificacion,
               SUM(dp.Cantidad) as CantidadVendida, SUM(dp.Total) as Ingresos
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

    const totalHistorico = await pool.request().query('SELECT SUM(Total) as Total FROM Pedido');
    const ventasHoy = await pool.request().query('SELECT SUM(Total) as Total FROM Pedido WHERE CAST(Fecha AS DATE) = CAST(GETDATE() AS DATE)');
    const pedidosHoy = await pool.request().query('SELECT COUNT(*) as Total FROM Pedido WHERE CAST(Fecha AS DATE) = CAST(GETDATE() AS DATE)');
    const totalClientes = await pool.request().query('SELECT COUNT(*) as Total FROM Cliente');
    const totalProductos = await pool.request().query('SELECT COUNT(*) as Total FROM Producto');

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

## 🔌 ENDPOINTS RESUMEN

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/cliente` | Registrar cliente |
| POST | `/cliente/login` | Iniciar sesión |
| GET | `/cliente/carrusel` | Obtener imágenes para carrusel |
| PUT | `/cliente/foto/:id` | Actualizar foto de perfil |
| GET | `/cliente/:id` | Obtener cliente por ID |
| GET | `/producto` | Listar productos |
| POST | `/producto` | Agregar producto |
| GET | `/producto/menu` | Menú de productos |
| GET | `/producto/inventario` | Inventario |
| PUT | `/producto/entrada/:id` | Entrada de inventario |
| PUT | `/producto/:id` | Modificar producto |
| POST | `/pedido` | Registrar pedido |
| PUT | `/pedido/estado/:id` | Cambiar estado |
| GET | `/pedido/cliente/:idCliente` | Pedidos por cliente |
| GET | `/pedido` | Todos los pedidos |
| GET | `/reportes/ventas/diarias` | Ventas diarias |
| GET | `/reportes/ventas/semanales` | Ventas semanales |
| GET | `/reportes/ventas/mensuales` | Ventas mensuales |
| GET | `/reportes/productos/mas-vendidos` | Top productos |
| GET | `/reportes/ventas/resumen` | Resumen general |

---

## 🛠️ INSTALACIÓN

```bash
# 1. Instalar dependencias
npm install express cors msql multer bcrypt

# 2. Configurar base de datos
# Ejecutar db/script_base_datos.sql en SQL Server

# 3. Configurar credenciales
# Copiar .env.example a .env y configurar

# 4. Ejecutar servidor
npm start
```

El servidor estará corriendo en `http://localhost:3000`

