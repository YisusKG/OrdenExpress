const express = require("express");
const router = express.Router();
const sql = require("mssql");
const multer = require("multer");
const bcrypt = require("bcrypt");
const { getPool, handleError } = require("./dbHelper");

const uploadPerfil = multer({ storage: multer.diskStorage({
  destination: (req, file, cb) => cb(null, "perfil"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
})});

router.post("/", async (req, res) => {
  const { nombre, apellidoP, apellidoM, usuario, telefono, email, contrasena } = req.body;
  if (!contrasena) return res.status(400).json({ message: "La contraseña es requerida" });
  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const pool = await getPool();
    await pool.request()
      .input("Nombre", sql.VarChar, nombre).input("Apellido_Paterno", sql.VarChar, apellidoP)
      .input("Apellido_Materno", sql.VarChar, apellidoM).input("Usuario", sql.VarChar, usuario)
      .input("Telefono", sql.VarChar, telefono).input("Correo_E", sql.VarChar, email)
      .input("Contraseña", sql.VarChar, hashedPassword)
      .query("INSERT INTO Cliente (Nombre,Apellido_Paterno,Apellido_Materno,Usuario,Telefono,Correo_E,Contraseña) VALUES (@Nombre,@Apellido_Paterno,@Apellido_Materno,@Usuario,@Telefono,@Correo_E,@Contraseña)");
    res.json({ message: "Cliente registrado correctamente" });
  } catch (err) { handleError(res, err, "Error al registrar cliente"); }
});

router.post("/login", async (req, res) => {
  const { usuario, contrasena } = req.body;
  if (!usuario || !contrasena) return res.status(400).json({ message: "Usuario y contraseña son requeridos" });
  try {
    const pool = await getPool();
    const result = await pool.request().input("Usuario", sql.VarChar, usuario).query("SELECT * FROM Cliente WHERE Usuario = @Usuario");
    if (result.recordset.length === 0) return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    const cliente = result.recordset[0];
    const match = await bcrypt.compare(contrasena, cliente.Contraseña) || cliente.Contraseña === contrasena;
    if (!match) return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    res.json({ message: "Inicio de sesión exitoso", ID_Cliente: cliente.ID_Cliente, Foto_Perfil: cliente.Foto_Perfil || "" });
  } catch (err) { handleError(res, err, "Error en login"); }
});

router.get("/carrusel", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT Nombre_P,Descripcion,Imagen FROM Producto WHERE Imagen IS NOT NULL");
    res.json(result.recordset);
  } catch (err) { handleError(res, err, "Error al obtener imágenes"); }
});

router.put("/foto/:id", uploadPerfil.single("foto"), async (req, res) => {
  const id = parseInt(req.params.id);
  const nombreArchivo = req.file ? req.file.filename : null;
  if (!nombreArchivo || isNaN(id)) return res.status(400).json({ message: "Datos inválidos" });
  try {
    const pool = await getPool();
    await pool.request().input("ID_Cliente", sql.Int, id).input("Foto_Perfil", sql.VarChar, nombreArchivo)
      .query("UPDATE Cliente SET Foto_Perfil = @Foto_Perfil WHERE ID_Cliente = @ID_Cliente");
    res.json({ message: "Foto de perfil actualizada correctamente" });
  } catch (err) { handleError(res, err, "Error al actualizar foto"); }
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
  try {
    const pool = await getPool();
    const result = await pool.request().input("ID_Cliente", sql.Int, id).query("SELECT * FROM Cliente WHERE ID_Cliente = @ID_Cliente");
    if (result.recordset.length === 0) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(result.recordset[0]);
  } catch (err) { handleError(res, err, "Error al obtener cliente"); }
});

module.exports = router;
