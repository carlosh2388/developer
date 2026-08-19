require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const db = require("./config/database");
const { notFound, errorHandler } = require("./middleware/errorHandler");

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  console.error("Faltan DATABASE_URL o JWT_SECRET. Copia .env.example como .env y configura sus valores.");
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1);
const origins = (process.env.CORS_ORIGINS || "http://localhost:3001,http://localhost:5173").split(",");
app.use(helmet());
app.use(cors({ origin: origins, credentials: false }));
app.use(express.json({ limit: "100kb" }));
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }));
app.use("/api/license/activate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }));

app.get("/api/health", async (_req, res, next) => {
  try { await db.query("SELECT 1"); res.json({ status: "ok", service: "AVINEXT API" }); }
  catch (error) { next(error); }
});

app.use("/api/license", require("./routes/license"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/platform", require("./routes/platform"));
app.use("/api", require("./routes/catalogos"));
app.use("/api", require("./routes/operaciones"));
app.use("/api/reportes", require("./routes/reportes"));
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 3000);
async function startServer() {
  try {
    await db.query("SELECT 1");
    app.listen(PORT, "0.0.0.0", (error) => {
      if (error) {
        console.error(`No fue posible iniciar la API en el puerto ${PORT}:`, error.message);
        process.exit(1);
      }
      console.log(`API AVINEXT disponible en http://localhost:${PORT}`);
    });
  } catch (error) {
    if (error.code === "28P01") {
      console.error("No fue posible autenticar el usuario de PostgreSQL. Revisa DATABASE_URL en backend/.env.");
    } else if (error.code === "3D000") {
      console.error("La base de datos indicada en DATABASE_URL no existe.");
    } else {
      console.error("No fue posible conectar con PostgreSQL:", error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) startServer();

module.exports = app;
