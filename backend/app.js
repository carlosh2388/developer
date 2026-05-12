// Importar librerías
const express = require("express");
const cors = require("cors");

const usuariosRoutes = require("./routes/usuarios");

// Crear app
const app = express();

// Permite conexión desde frontend
app.use(cors());

// Permite trabajar con JSON
app.use(express.json());


/* =========================
   RUTA DE USUARIOS
========================= */

// Rutas API
app.use("/api/usuarios", usuariosRoutes);

// Ruta base
app.get("/", (req, res) => {
  res.send("API funcionando");
});

/* =========================
   INICIAR SERVIDOR
========================= */
// Puerto
const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
