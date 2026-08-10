const test = require("node:test");
const assert = require("node:assert/strict");

const databaseUrl = process.env.TEST_DATABASE_URL;

test("API operativa crea catálogos y un ingreso de inventario", { skip: !databaseUrl }, async (t) => {
  process.env.DATABASE_URL = databaseUrl;
  process.env.JWT_SECRET = "integration-test-secret-with-at-least-32-characters";
  process.env.LICENSE_ENFORCEMENT = "false";
  process.env.CORS_ORIGINS = "http://localhost";

  const crypto = require("node:crypto");
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");
  const db = require("../config/database");
  const app = require("../app");

  const organization = await db.query("INSERT INTO organizations(name,status) VALUES('Prueba API','ACTIVE') RETURNING id");
  const role = await db.query("SELECT id FROM roles WHERE code='ADMINISTRATOR'");
  const passwordHash = await bcrypt.hash("Prueba123!", 4);
  const user = await db.query(
    `INSERT INTO users(organization_id,role_id,full_name,username,password_hash,status,user_scope)
     VALUES($1,$2,'Administrador prueba','admin.api',$3,'ACTIVE','CLIENT') RETURNING id,token_version`,
    [organization.rows[0].id, role.rows[0].id, passwordHash]
  );
  const sessionId = crypto.randomUUID();
  const token = jwt.sign({ sub: user.rows[0].id, ver: user.rows[0].token_version, sid: sessionId }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const decoded = jwt.decode(token);
  await db.query(
    "INSERT INTO active_user_sessions(user_id,token_id,expires_at) VALUES($1,$2,to_timestamp($3))",
    [user.rows[0].id, sessionId, decoded.exp]
  );

  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(async () => { await new Promise((resolve) => server.close(resolve)); await db.end(); });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const request = async (path, options = {}) => {
    const response = await fetch(`${base}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
    });
    const body = await response.json().catch(() => ({}));
    assert.ok(response.ok, `${response.status}: ${JSON.stringify(body)}`);
    return body;
  };

  const location = await request("/localidades", { method: "POST", body: JSON.stringify({ codigo: "LOC-TEST", nombre: "Granja prueba" }) });
  const supplier = await request("/proveedores", { method: "POST", body: JSON.stringify({ codigo: "PRO-TEST", nombre: "Proveedor prueba" }) });
  const suppliers = await request("/proveedores");
  assert.equal(suppliers[0].id, supplier.id);
  assert.equal(suppliers[0].code, "PRO-TEST");
  assert.equal(suppliers[0].name, "Proveedor prueba");
  const warehouse = await request("/bodegas", { method: "POST", body: JSON.stringify({ localidadId: location.id, codigo: "BOD-TEST", nombre: "Bodega prueba" }) });
  const product = await request("/productos", {
    method: "POST",
    body: JSON.stringify({ codigo: "AL-TEST", tipoProducto: "AL", nombre: "Alimento prueba", unidad: "QUINTAL" }),
  });
  const additive = await request("/productos", {
    method: "POST",
    body: JSON.stringify({ codigo: "AD-TEST", tipoProducto: "AD", nombre: "Aditivo prueba", unidad: "KILOGRAM" }),
  });
  const document = await request("/inventario/documentos", {
    method: "POST",
    body: JSON.stringify({
      tipoMovimiento: "INPUT", modulo: "FOOD", fecha: "2026-08-04", proveedorId: supplier.id, bodegaDestinoId: warehouse.id,
      detalles: [
        { productoId: product.id, rol: "BASE_FOOD", cantidad: 10, costoUnitario: 100 },
        { productoId: additive.id, rol: "ADDITIVE", cantidad: 0.5, detallePadreIndice: 0 },
      ],
    }),
  });

  assert.equal(document.movement_type, "INPUT");
  assert.equal(document.detalles.length, 2);
  assert.equal(document.detalles[1].parent_line_id, document.detalles[0].id);
  const updatedDocument = await request(`/inventario/documentos/${document.id}`, {
    method: "PUT",
    body: JSON.stringify({ tipoMovimiento: "INPUT", modulo: "FOOD", fecha: "2026-08-05", proveedorId: supplier.id,
      bodegaDestinoId: warehouse.id, detalles: [{ productoId: product.id, rol: "BASE_FOOD", cantidad: 20 }] }),
  });
  assert.equal(updatedDocument.id, document.id);
  assert.equal(updatedDocument.detalles.length, 1);
  assert.ok(updatedDocument.updated_at);
  const documents = await request("/inventario/documentos");
  assert.equal(documents.length, 1);
});
