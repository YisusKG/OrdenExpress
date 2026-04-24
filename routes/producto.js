const express = require("express");
const router = express.Router();
const sql = require("mssql");
const multer = require("multer");
const { getPool, handleError } = require("./dbHelper");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "fotos"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.post("/", upload.single("Imagen"), async (req, res) => {
  const { Nombre_P, Clasificacion, Descripcion, Cantidad_Disponible, Cantidad_Min, Cantidad_Max, Costo_Base, Porcentaje_Gan } = req.body;
  const Imagen = req.file ? req.file.filename : null;
  const porcentaje = parseFloat(Porcentaje_Gan || 0);
  const costoBase = parseFloat(Costo_Base);
  const precioVenta = costoBase + (costoBase * porcentaje / 100);
  try {
    const pool = await getPool();
    await pool.request()
      .input("Nombre_P", sql.VarChar, Nombre_P).input("Clasificacion", sql.VarChar, Clasificacion)
      .input("Descripcion", sql.VarChar, Descripcion).input("Cantidad_Disponible", sql.Int, Cantidad_Disponible)
      .input("Cantidad_Min", sql.Int, Cantidad_Min).input("Cantidad_Max", sql.Int, Cantidad_Max)
      .input("Costo_Base", sql.Decimal(10, 2), costoBase).input("Precio_Venta", sql.Decimal(10, 2), precioVenta)
      .input("Porcentaje_Gan", sql.Int, porcentaje).input("Imagen", sql.VarChar, Imagen)
      .query("INSERT INTO Producto (Nombre_P,Clasificacion,Descripcion,Cantidad_Disponible,Cantidad_Min,Cantidad_Max,Costo_Base,Precio_Venta,Porcentaje_Gan,Imagen) VALUES (@Nombre_P,@Clasificacion,@Descripcion,@Cantidad_Disponible,@Cantidad_Min,@Cantidad_Max,@Costo_Base,@Precio_Venta,@Porcentaje_Gan,@Imagen)");
    res.json({ message: "Producto agregado correctamente" });
  } catch (err) { handleError(res, err, "Error al agregar producto"); }
});

router.get("/", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT ID_Producto, Nombre_P FROM Producto");
    res.json(result.recordset);
  } catch (err) { handleError(res, err, "Error al obtener productos"); }
});

router.get("/inventario", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT ID_Producto,Nombre_P,Descripcion,Cantidad_Disponible,Cantidad_Min,Cantidad_Max FROM Producto");
    res.json(result.recordset);
  } catch (err) { handleError(res, err, "Error al obtener inventario"); }
});

router.get("/menu", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT ID_Producto,Nombre_P,Clasificacion,Precio_Venta,Imagen FROM Producto WHERE Imagen IS NOT NULL");
    res.json(result.recordset);
  } catch (err) { handleError(res, err, "Error al obtener menú"); }
});

router.put("/entrada/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { cantidad } = req.body;
  if (isNaN(id) || !cantidad || cantidad <= 0) return res.status(400).json({ message: "ID o cantidad inválida" });
  try {
    const pool = await getPool();
    await pool.request().input("ID_Producto", sql.Int, id).input("Cantidad", sql.Int, cantidad)
      .query("UPDATE Producto SET Cantidad_Disponible = Cantidad_Disponible + @Cantidad WHERE ID_Producto = @ID_Producto");
    res.json({ message: "Entrada de inventario registrada correctamente" });
  } catch (err) { handleError(res, err, "Error al registrar entrada"); }
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
  try {
    const pool = await getPool();
    const result = await pool.request().input("ID_Producto", sql.Int, id).query("SELECT * FROM Producto WHERE ID_Producto = @ID_Producto");
    if (result.recordset.length === 0) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(result.recordset[0]);
  } catch (err) { handleError(res, err, "Error al obtener producto"); }
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { Nombre_P, Descripcion, Cantidad_Min, Cantidad_Max, Costo_Base, Porcentaje_Gan } = req.body;
  if (isNaN(id) || !Nombre_P || isNaN(Costo_Base) || isNaN(Porcentaje_Gan)) return res.status(400).json({ message: "Datos incompletos o inválidos" });
  try {
    const Precio_Venta = parseFloat(Costo_Base) + (parseFloat(Costo_Base) * parseInt(Porcentaje_Gan) / 100);
    const pool = await getPool();
    await pool.request()
      .input("ID_Producto", sql.Int, id).input("Nombre_P", sql.VarChar, Nombre_P)
      .input("Descripcion", sql.VarChar, Descripcion).input("Cantidad_Min", sql.Int, Cantidad_Min)
      .input("Cantidad_Max", sql.Int, Cantidad_Max).input("Costo_Base", sql.Decimal(10, 2), Costo_Base)
      .input("Porcentaje_Gan", sql.Int, Porcentaje_Gan).input("Precio_Venta", sql.Decimal(10, 2), Precio_Venta)
      .query("UPDATE Producto SET Nombre_P=@Nombre_P,Descripcion=@Descripcion,Cantidad_Min=@Cantidad_Min,Cantidad_Max=@Cantidad_Max,Costo_Base=@Costo_Base,Porcentaje_Gan=@Porcentaje_Gan,Precio_Venta=@Precio_Venta WHERE ID_Producto=@ID_Producto");
    res.json({ message: "Producto modificado correctamente" });
  } catch (err) { handleError(res, err, "Error al modificar producto"); }
});

module.exports = router;
