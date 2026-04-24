const express = require("express");
const router = express.Router();
const sql = require("mssql");
const { getPool, handleError } = require("./dbHelper");

const ESTADOS_VALIDOS = ["Pendiente", "En Preparación", "Listo", "Entregado", "Cancelado"];

router.post("/", async (req, res) => {
  const { ID_Cliente, productos } = req.body;
  if (!ID_Cliente || !Array.isArray(productos) || productos.length === 0)
    return res.status(400).json({ message: "Datos de pedido inválidos" });
  try {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    const ID_Pedido = await insertarPedido(transaction, ID_Cliente);
    const stockOk = await insertarDetalles(transaction, pool, ID_Pedido, productos, res);
    if (!stockOk) return;
    await transaction.commit();
    res.json({ message: "Pedido registrado correctamente", ID_Pedido });
  } catch (err) { handleError(res, err, "Error al registrar pedido"); }
});

async function insertarPedido(transaction, ID_Cliente) {
  const result = await new sql.Request(transaction)
    .input("ID_Cliente", sql.Int, ID_Cliente).input("Fecha", sql.Date, new Date()).input("Estado", sql.VarChar(50), "Pendiente")
    .query("INSERT INTO Pedido (ID_Cliente,Fecha,Estado) OUTPUT INSERTED.ID_Pedido VALUES (@ID_Cliente,@Fecha,@Estado)");
  return result.recordset[0].ID_Pedido;
}

async function insertarDetalles(transaction, pool, ID_Pedido, productos, res) {
  for (const prod of productos) {
    const stock = await new sql.Request(pool).input("ID_Producto", sql.Int, prod.ID_Producto)
      .query("SELECT Cantidad_Disponible FROM Producto WHERE ID_Producto = @ID_Producto");
    if ((stock.recordset[0]?.Cantidad_Disponible ?? 0) < prod.Cantidad) {
      await transaction.rollback();
      res.status(400).json({ message: `Stock insuficiente para producto ${prod.ID_Producto}` });
      return false;
    }
    await new sql.Request(transaction)
      .input("ID_Pedido", sql.Int, ID_Pedido).input("ID_Producto", sql.Int, prod.ID_Producto)
      .input("Cantidad", sql.Int, prod.Cantidad).input("Total", sql.Decimal(10, 2), prod.Cantidad * prod.Precio_Unitario)
      .query("INSERT INTO Detalle_Pedido (ID_Pedido,ID_Producto,Cantidad,Total) VALUES (@ID_Pedido,@ID_Producto,@Cantidad,@Total)");
    await new sql.Request(transaction)
      .input("ID_Producto", sql.Int, prod.ID_Producto).input("Cantidad", sql.Int, prod.Cantidad)
      .query("UPDATE Producto SET Cantidad_Disponible = Cantidad_Disponible - @Cantidad WHERE ID_Producto = @ID_Producto");
  }
  return true;
}

router.put("/estado/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { Estado } = req.body;
  if (isNaN(id) || !Estado) return res.status(400).json({ message: "ID o estado inválido" });
  if (!ESTADOS_VALIDOS.includes(Estado)) return res.status(400).json({ message: "Estado no válido. Estados: " + ESTADOS_VALIDOS.join(", ") });
  try {
    const pool = await getPool();
    await pool.request().input("ID_Pedido", sql.Int, id).input("Estado", sql.VarChar(50), Estado)
      .query("UPDATE Pedido SET Estado = @Estado WHERE ID_Pedido = @ID_Pedido");
    res.json({ message: `Estado actualizado a: ${Estado}` });
  } catch (err) { handleError(res, err, "Error al cambiar estado"); }
});

router.get("/cliente/:idCliente", async (req, res) => {
  const idCliente = parseInt(req.params.idCliente);
  if (isNaN(idCliente)) return res.status(400).json({ message: "ID de cliente inválido" });
  try {
    const pool = await getPool();
    const result = await pool.request().input("ID_Cliente", sql.Int, idCliente)
      .query("SELECT p.ID_Pedido,p.Fecha,p.Estado,p.Total,dp.ID_Producto,dp.Cantidad,dp.Total as Subtotal,pr.Nombre_P FROM Pedido p LEFT JOIN Detalle_Pedido dp ON p.ID_Pedido=dp.ID_Pedido LEFT JOIN Producto pr ON dp.ID_Producto=pr.ID_Producto WHERE p.ID_Cliente=@ID_Cliente ORDER BY p.Fecha DESC");
    res.json(result.recordset);
  } catch (err) { handleError(res, err, "Error al obtener pedidos"); }
});

router.get("/", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query("SELECT p.ID_Pedido,p.ID_Cliente,p.Fecha,p.Estado,p.Total,c.Nombre as NombreCliente,c.Telefono FROM Pedido p LEFT JOIN Cliente c ON p.ID_Cliente=c.ID_Cliente ORDER BY p.Fecha DESC");
    res.json(result.recordset);
  } catch (err) { handleError(res, err, "Error al obtener pedidos"); }
});

module.exports = router;
