// Importar librerías
const express = require("express");
const cors = require("cors");

// Crear app
const app = express();

// Permite conexión desde frontend
app.use(cors());

// Permite trabajar con JSON
app.use(express.json());

/* =========================
   RUTA DE USUARIOS
========================= */
app.get("/api/usuarios", (req, res) => {

  // Datos de ejemplo (luego vendrán de DB)
  res.json([
    { nombre: "Admin", rol: "Administrador" },
    { nombre: "Juan", rol: "Operador" }
  ]);
});

/* =========================
   INICIAR SERVIDOR
========================= */
app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});