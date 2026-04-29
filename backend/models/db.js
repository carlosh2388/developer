// Importar librería
const { Pool } = require("pg");

// Crear conexión
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "avicola",
  password: "123456",
  port: 5432,
});

// Exportar conexión
module.exports = pool;