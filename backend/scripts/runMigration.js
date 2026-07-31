require("dotenv").config({ quiet: true });
const fs = require("fs");
const path = require("path");
const db = require("../config/database");

async function run() {
  const filename = process.argv[2];
  if (!filename) throw new Error("Indica el archivo de migración.");
  const fullPath = path.resolve(__dirname, "../database", filename);
  await db.query(fs.readFileSync(fullPath, "utf8"));
  console.log(`Migración aplicada: ${filename}`);
  await db.end();
}

run().catch(async error => {
  console.error(error.message);
  await db.end();
  process.exit(1);
});
