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

