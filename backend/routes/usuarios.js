// Importar librerías
const express = require("express");
const router = express.Router();

const {
  obtenerUsuarios
} = require("../controllers/usuariosController");


/* =========================
   RUTA DE USUARIOS
========================= */
// GET /api/usuarios
router.get("/", obtenerUsuarios);

module.exports = router;







