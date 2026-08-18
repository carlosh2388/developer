const db = require("../config/database");
const HttpError = require("../utils/httpError");

const catalogos = {
  localidades: {
    table: "locations",
    orderBy: "code",
    hasUpdatedAt: true,
    required: ["code", "name"],
    fields: { codigo: "code", nombre: "name", fechaApertura: "opened_on", estado: "status", descripcion: "description" },
  },
  bodegas: {
    table: "warehouses",
    orderBy: "code",
    hasUpdatedAt: true,
    required: ["location_id", "code", "name"],
    fields: { localidadId: "location_id", codigo: "code", nombre: "name", fechaApertura: "opened_on", estado: "status", descripcion: "description" },
  },
  proveedores: {
    table: "suppliers",
    orderBy: "code",
    hasUpdatedAt: true,
    required: ["code", "name"],
    fields: { codigo: "code", nombre: "name", nit: "tax_id", direccion: "address", contacto: "contact_name", telefono: "phone", correo: "email", estado: "status" },
  },
  lineasAvicolas: {
    table: "poultry_lines",
    orderBy: "code",
    required: ["code", "name"],
    fields: { codigo: "code", nombre: "name", estado: "status" },
  },
  galeras: {
    table: "houses",
    orderBy: "code",
    hasUpdatedAt: true,
    required: ["code", "name"],
    fields: { localidadId: "location_id", codigo: "code", nombre: "name", estado: "status", descripcion: "description" },
  },
  vehiculos: {
    table: "vehicles",
    orderBy: "plate",
    required: ["plate"],
    fields: { placa: "plate", descripcion: "description", estado: "status" },
  },
  etapasProduccion: {
    table: "production_stages",
    orderBy: "code",
    required: ["code", "name"],
    fields: { codigo: "code", nombre: "name", estado: "status" },
  },
  productos: {
    table: "products",
    orderBy: "code",
    hasUpdatedAt: true,
    required: ["code", "product_type", "name", "unit_code"],
    fields: {
      codigo: "code", tipoProducto: "product_type", nombre: "name", unidad: "unit_code", estado: "status",
      precioVenta: "sale_price", costoEstandar: "standard_cost", existenciaInicial: "opening_stock",
      presentacion: "presentation", enfermedadObjetivo: "target_disease", dosis: "dosage", tipoVacuna: "vaccine_kind",
    },
  },
  lotes: {
    table: "flocks",
    orderBy: "code",
    hasUpdatedAt: true,
    required: ["code", "received_on", "poultry_line_id"],
    fields: {
      codigo: "code", fechaRecepcion: "received_on", lineaAvicolaId: "poultry_line_id", galeraId: "house_id",
      proveedorId: "supplier_id", paisOrigen: "origin_country", cantidadHembras: "female_count",
      cantidadMachos: "male_count", costoUnitario: "unit_cost", moneda: "currency_code", estado: "status",
    },
  },
};

function organizationId(req) {
  if (!req.user.organizationId) throw new HttpError(403, "Esta operación requiere un usuario de cliente.", "CLIENT_ORGANIZATION_REQUIRED");
  return req.user.organizationId;
}

function snakeToCamel(value) {
  return value.replace(/_([a-z])/g, (_m, letter) => letter.toUpperCase());
}

function serialize(row) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [snakeToCamel(key), value]));
}

function valuesFromBody(config, body) {
  const result = {};
  for (const [publicName, column] of Object.entries(config.fields)) {
    if (Object.prototype.hasOwnProperty.call(body, publicName)) result[column] = body[publicName];
  }
  const integerFields = new Set(["opening_stock", "female_count", "male_count"]);
  const moneyFields = new Set(["sale_price", "standard_cost", "unit_cost", "super_nick_box_price", "brown_nick_box_price"]);
  for (const [field, value] of Object.entries(result)) {
    if (integerFields.has(field) && (!Number.isInteger(Number(value)) || Number(value) < 0)) {
      throw new HttpError(400, `${field} debe ser un número entero.`, "VALIDATION_ERROR");
    }
    if (moneyFields.has(field) && (!Number.isFinite(Number(value)) || Number(value) < 0 || Math.abs(Number(value) * 100 - Math.round(Number(value) * 100)) > 0.000001)) {
      throw new HttpError(400, `${field} debe tener como máximo dos decimales.`, "VALIDATION_ERROR");
    }
  }
  return result;
}

function validateRequired(config, values) {
  const missing = config.required.filter((field) => values[field] === undefined || values[field] === null || values[field] === "");
  if (missing.length) throw new HttpError(400, `Faltan campos obligatorios: ${missing.join(", ")}.`, "VALIDATION_ERROR");
}

async function nextPrefixedCode(queryable, table, orgId, prefix) {
  const { rows } = await queryable.query(
    `SELECT COALESCE(MAX(substring(code FROM $2 || '([0-9]+)$')::integer),0) last_number
     FROM ${table} WHERE organization_id=$1 AND upper(code) ~ ('^' || $2 || '[0-9]+$')`,
    [orgId, prefix]
  );
  return `${prefix}${String(Number(rows[0].last_number || 0) + 1).padStart(2, "0")}`;
}

function siguienteCodigo(table, prefix) {
  return async (req, res, next) => {
    try { res.json({ code: await nextPrefixedCode(db, table, organizationId(req), prefix) }); }
    catch (error) { next(error); }
  };
}

async function crearProveedor(req, res, next) {
  const client = await db.connect();
  try {
    const orgId = organizationId(req);
    const values = valuesFromBody(catalogos.proveedores, req.body || {});
    delete values.code;
    validateRequired(catalogos.proveedores, { ...values, code: "AUTO" });
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${orgId}:PR`]);
    values.code = await nextPrefixedCode(client, "suppliers", orgId, "PR");
    values.created_by = req.user.id;
    const columns = ["organization_id", ...Object.keys(values)];
    const params = [orgId, ...Object.values(values)];
    const placeholders = params.map((_value, index) => `$${index + 1}`);
    const { rows } = await client.query(
      `INSERT INTO suppliers (${columns.join(",")}) VALUES (${placeholders.join(",")}) RETURNING *`, params
    );
    await client.query("COMMIT");
    res.status(201).json(serialize(rows[0]));
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

function twoDecimalValue(value, name) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number < 0 || Math.abs(number * 100 - Math.round(number * 100)) > 0.000001) {
    throw new HttpError(400, `${name} debe tener como máximo dos decimales.`, "VALIDATION_ERROR");
  }
  return number;
}

async function crearBodega(req, res, next) {
  const client = await db.connect();
  try {
    const orgId = organizationId(req);
    const values = valuesFromBody(catalogos.bodegas, req.body || {});
    delete values.code;
    validateRequired(catalogos.bodegas, { ...values, code: "AUTO" });
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${orgId}:BO`]);
    values.code = await nextPrefixedCode(client, "warehouses", orgId, "BO");
    values.created_by = req.user.id;
    const columns = ["organization_id", ...Object.keys(values)];
    const params = [orgId, ...Object.values(values)];
    const placeholders = params.map((_value, index) => `$${index + 1}`);
    const { rows } = await client.query(
      `INSERT INTO warehouses (${columns.join(",")}) VALUES (${placeholders.join(",")}) RETURNING *`, params
    );
    await client.query("COMMIT");
    res.status(201).json(serialize(rows[0]));
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

const productPrefixes = new Set(["AD", "AL", "HC", "HI", "IN", "ME", "MD", "VA"]);

async function siguienteProducto(req, res, next) {
  try {
    const type = String(req.query.tipo || "").trim().toUpperCase();
    if (!productPrefixes.has(type)) throw new HttpError(400, "El tipo de producto seleccionado no es válido.", "INVALID_PRODUCT_TYPE");
    res.json({ code: await nextPrefixedCode(db, "products", organizationId(req), type) });
  } catch (error) { next(error); }
}

async function crearProducto(req, res, next) {
  const client = await db.connect();
  try {
    const orgId = organizationId(req);
    const values = valuesFromBody(catalogos.productos, req.body || {});
    delete values.code;
    const type = String(values.product_type || "").trim().toUpperCase();
    if (!productPrefixes.has(type)) throw new HttpError(400, "El tipo de producto seleccionado no es válido.", "INVALID_PRODUCT_TYPE");
    values.product_type = type;
    validateRequired(catalogos.productos, { ...values, code: "AUTO" });
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${orgId}:PRODUCT:${type}`]);
    values.code = await nextPrefixedCode(client, "products", orgId, type);
    values.created_by = req.user.id;
    const columns = ["organization_id", ...Object.keys(values)];
    const params = [orgId, ...Object.values(values)];
    const placeholders = params.map((_value, index) => `$${index + 1}`);
    const { rows } = await client.query(
      `INSERT INTO products (${columns.join(",")}) VALUES (${placeholders.join(",")}) RETURNING *`, params
    );
    await client.query("COMMIT");
    res.status(201).json(serialize(rows[0]));
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

async function crearGalera(req, res, next) {
  const client = await db.connect();
  try {
    const orgId = organizationId(req);
    const values = valuesFromBody(catalogos.galeras, req.body || {});
    delete values.code;
    validateRequired(catalogos.galeras, { ...values, code: "AUTO" });
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${orgId}:GA`]);
    values.code = await nextPrefixedCode(client, "houses", orgId, "GA");
    const columns = ["organization_id", ...Object.keys(values)];
    const params = [orgId, ...Object.values(values)];
    const placeholders = params.map((_value, index) => `$${index + 1}`);
    const { rows } = await client.query(
      `INSERT INTO houses (${columns.join(",")}) VALUES (${placeholders.join(",")}) RETURNING *`, params
    );
    await client.query("COMMIT");
    res.status(201).json(serialize(rows[0]));
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

async function nextFlockCode(queryable, orgId, lineId) {
  const lineResult = await queryable.query(
    "SELECT id,code,name FROM poultry_lines WHERE id=$1 AND organization_id=$2 AND status='ACTIVE'",
    [lineId, orgId]
  );
  const line = lineResult.rows[0];
  if (!line) throw new HttpError(400, "La línea avícola seleccionada no existe o está inactiva.", "INVALID_POULTRY_LINE");
  const prefix = String(line.code || "").trim().toUpperCase();
  if (!prefix) throw new HttpError(400, "La línea avícola no tiene un identificador válido.", "INVALID_POULTRY_LINE_CODE");
  const result = await queryable.query(
    `SELECT COALESCE(MAX(CASE WHEN substring(code FROM length($2)+1) ~ '^[0-9]+$'
      THEN substring(code FROM length($2)+1)::integer END),0) AS last_number
     FROM flocks WHERE organization_id=$1 AND upper(code) LIKE $2 || '%'`,
    [orgId, prefix]
  );
  const nextNumber = Number(result.rows[0].last_number || 0) + 1;
  return { line, code: `${prefix}${String(nextNumber).padStart(2, "0")}`, nextNumber };
}

async function listarSiguientesLotes(req, res, next) {
  try {
    const orgId = organizationId(req);
    const { rows: lines } = await db.query(
      "SELECT id,code,name FROM poultry_lines WHERE organization_id=$1 AND status='ACTIVE' ORDER BY code",
      [orgId]
    );
    const options = [];
    for (const line of lines) {
      const nextCode = await nextFlockCode(db, orgId, line.id);
      options.push({ poultryLineId: line.id, lineCode: line.code, lineName: line.name, code: nextCode.code });
    }
    res.json(options);
  } catch (error) { next(error); }
}

async function crearLote(req, res, next) {
  const client = await db.connect();
  try {
    const orgId = organizationId(req);
    const values = valuesFromBody(catalogos.lotes, req.body || {});
    delete values.code;
    validateRequired(catalogos.lotes, { ...values, code: "AUTO" });
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${orgId}:${values.poultry_line_id}`]);
    const generated = await nextFlockCode(client, orgId, values.poultry_line_id);
    values.code = generated.code;
    values.created_by = req.user.id;
    const columns = ["organization_id", ...Object.keys(values)];
    const params = [orgId, ...Object.values(values)];
    const placeholders = params.map((_value, index) => `$${index + 1}`);
    const { rows } = await client.query(
      `INSERT INTO flocks (${columns.join(",")}) VALUES (${placeholders.join(",")}) RETURNING *`, params
    );
    await client.query("COMMIT");
    res.status(201).json(serialize(rows[0]));
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally { client.release(); }
}

async function actualizarLote(req, res, next) {
  try {
    const orgId = organizationId(req);
    const values = valuesFromBody(catalogos.lotes, req.body || {});
    if (!Object.keys(values).length) throw new HttpError(400, "No se enviaron campos para actualizar.", "VALIDATION_ERROR");

    const currentResult = await db.query(
      "SELECT * FROM flocks WHERE id=$1 AND organization_id=$2",
      [req.params.id, orgId]
    );
    const current = currentResult.rows[0];
    if (!current) throw new HttpError(404, "El registro solicitado no existe.", "NOT_FOUND");

    if (values.code !== undefined) {
      const lineId = values.poultry_line_id || current.poultry_line_id;
      const lineResult = await db.query(
        "SELECT code FROM poultry_lines WHERE id=$1 AND organization_id=$2",
        [lineId, orgId]
      );
      const line = lineResult.rows[0];
      if (!line) throw new HttpError(400, "La línea avícola del lote no existe.", "INVALID_POULTRY_LINE");
      const prefix = String(line.code || "").trim().toUpperCase();
      const suppliedCode = String(values.code || "").trim().toUpperCase();
      const suffix = suppliedCode.slice(prefix.length);
      if (!suppliedCode.startsWith(prefix) || !/^\d+$/.test(suffix)) {
        throw new HttpError(400, `El lote debe iniciar con ${prefix} y terminar con un correlativo numérico.`, "INVALID_FLOCK_CODE");
      }
      values.code = `${prefix}${suffix.padStart(2, "0")}`;
    }

    const params = Object.values(values);
    const assignments = Object.keys(values).map((column, index) => `${column}=$${index + 1}`);
    assignments.push("updated_at=NOW()");
    params.push(req.params.id, orgId);
    const { rows } = await db.query(
      `UPDATE flocks SET ${assignments.join(",")} WHERE id=$${params.length - 1} AND organization_id=$${params.length} RETURNING *`,
      params
    );
    res.json(serialize(rows[0]));
  } catch (error) { next(error); }
}

function catalogController(name) {
  const config = catalogos[name];
  return {
    async listar(req, res, next) {
      try {
        const orgId = organizationId(req);
        const query = config.table === "products"
          ? `SELECT p.*,COALESCE(p.opening_stock,0) + COALESCE(SUM(
               CASE WHEN d.movement_type IN ('INPUT','ADJUSTMENT_IN') THEN l.quantity ELSE -l.quantity END
             ) FILTER (WHERE d.status='POSTED'),0) AS current_stock
             FROM products p
             LEFT JOIN inventory_document_lines l ON l.product_id=p.id AND l.organization_id=p.organization_id
             LEFT JOIN inventory_documents d ON d.id=l.document_id AND d.organization_id=l.organization_id
             WHERE p.organization_id=$1 GROUP BY p.id ORDER BY p.code`
          : `SELECT * FROM ${config.table} WHERE organization_id=$1 ORDER BY ${config.orderBy}`;
        const { rows } = await db.query(query, [orgId]);
        res.json(rows.map(serialize));
      } catch (error) { next(error); }
    },
    async obtener(req, res, next) {
      try {
        const { rows } = await db.query(`SELECT * FROM ${config.table} WHERE id=$1 AND organization_id=$2`, [req.params.id, organizationId(req)]);
        if (!rows[0]) throw new HttpError(404, "El registro solicitado no existe.", "NOT_FOUND");
        res.json(serialize(rows[0]));
      } catch (error) { next(error); }
    },
    async crear(req, res, next) {
      try {
        const values = valuesFromBody(config, req.body || {});
        validateRequired(config, values);
        if (["locations", "warehouses", "suppliers", "products", "flocks"].includes(config.table)) values.created_by = req.user.id;
        const columns = ["organization_id", ...Object.keys(values)];
        const params = [organizationId(req), ...Object.values(values)];
        const placeholders = params.map((_v, index) => `$${index + 1}`);
        const { rows } = await db.query(`INSERT INTO ${config.table} (${columns.join(",")}) VALUES (${placeholders.join(",")}) RETURNING *`, params);
        res.status(201).json(serialize(rows[0]));
      } catch (error) { next(error); }
    },
    async actualizar(req, res, next) {
      try {
        const values = valuesFromBody(config, req.body || {});
        if (["warehouses", "suppliers", "products", "houses"].includes(config.table)) delete values.code;
        if (config.table === "products") { delete values.product_type; delete values.opening_stock; }
        if (!Object.keys(values).length) throw new HttpError(400, "No se enviaron campos para actualizar.", "VALIDATION_ERROR");
        const params = Object.values(values);
        const assignments = Object.keys(values).map((column, index) => `${column}=$${index + 1}`);
        if (config.hasUpdatedAt) assignments.push("updated_at=NOW()");
        params.push(req.params.id, organizationId(req));
        const { rows } = await db.query(
          `UPDATE ${config.table} SET ${assignments.join(",")} WHERE id=$${params.length - 1} AND organization_id=$${params.length} RETURNING *`, params
        );
        if (!rows[0]) throw new HttpError(404, "El registro solicitado no existe.", "NOT_FOUND");
        res.json(serialize(rows[0]));
      } catch (error) { next(error); }
    },
  };
}

async function listarValores(req, res, next) {
  try {
    const params = [];
    let where = "WHERE is_active=TRUE";
    if (req.query.catalogo) { params.push(String(req.query.catalogo).toUpperCase()); where += ` AND catalog_code=$${params.length}`; }
    const { rows } = await db.query(`SELECT catalog_code,value_code,label,sort_order,metadata FROM reference_values ${where} ORDER BY catalog_code,sort_order,label`, params);
    res.json(rows.map(serialize));
  } catch (error) { next(error); }
}

async function siguienteRegion(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT COALESCE(MAX(substring(value_code FROM '^RE([0-9]+)$')::integer), 0) AS last_number
       FROM reference_values WHERE catalog_code='CUSTOMER_REGION' AND value_code ~ '^RE[0-9]+$'`
    );
    res.json({ code: `RE${String(Number(rows[0].last_number || 0) + 1).padStart(2, "0")}` });
  } catch (error) { next(error); }
}

async function crearRegion(req, res, next) {
  const client = await db.connect();
  try {
    const label = String(req.body?.nombre || "").trim();
    if (!label) throw new HttpError(400, "El nombre de la región es obligatorio.", "VALIDATION_ERROR");
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["CUSTOMER_REGION:RE"]);
    const nextResult = await client.query(
      `SELECT COALESCE(MAX(substring(value_code FROM '^RE([0-9]+)$')::integer), 0) + 1 AS next_number
       FROM reference_values WHERE catalog_code='CUSTOMER_REGION' AND value_code ~ '^RE[0-9]+$'`
    );
    const nextNumber = Number(nextResult.rows[0].next_number);
    const code = `RE${String(nextNumber).padStart(2, "0")}`;
    const duplicate = await client.query(
      "SELECT 1 FROM reference_values WHERE catalog_code='CUSTOMER_REGION' AND lower(label)=lower($1)", [label]
    );
    if (duplicate.rows[0]) throw new HttpError(409, "Ya existe una región con ese nombre.", "DUPLICATE_REGION");
    const { rows } = await client.query(
      `INSERT INTO reference_values(catalog_code,value_code,label,sort_order,is_active)
       VALUES('CUSTOMER_REGION',$1,$2,$3,TRUE)
       RETURNING catalog_code,value_code,label,sort_order,metadata`,
      [code, label, nextNumber]
    );
    await client.query("COMMIT");
    res.status(201).json(serialize(rows[0]));
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

async function nextUnitNumber(queryable) {
  const { rows } = await queryable.query(
    `SELECT COALESCE(MAX(CASE WHEN COALESCE(metadata->>'externalId', value_code) ~ '^UM[0-9]+$'
       THEN substring(COALESCE(metadata->>'externalId', value_code) FROM '^UM([0-9]+)$')::integer END), 0) + 1 AS next_number
     FROM reference_values WHERE catalog_code='UNIT'`
  );
  return Number(rows[0].next_number);
}

async function siguienteUnidad(req, res, next) {
  try {
    const nextNumber = await nextUnitNumber(db);
    res.json({ code: `UM${String(nextNumber).padStart(2, "0")}` });
  } catch (error) { next(error); }
}

async function crearUnidad(req, res, next) {
  const client = await db.connect();
  try {
    const label = String(req.body?.nombre || "").trim();
    const abbreviation = String(req.body?.abreviatura || "").trim();
    if (!label || !abbreviation) throw new HttpError(400, "El nombre y la abreviatura son obligatorios.", "VALIDATION_ERROR");
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["REFERENCE_VALUE:UNIT"]);
    const duplicate = await client.query(
      `SELECT 1 FROM reference_values WHERE catalog_code='UNIT'
       AND (lower(label)=lower($1) OR lower(metadata->>'abbreviation')=lower($2))`, [label, abbreviation]
    );
    if (duplicate.rows[0]) throw new HttpError(409, "Ya existe una unidad con ese nombre o abreviatura.", "DUPLICATE_UNIT");
    const nextNumber = await nextUnitNumber(client);
    const code = `UM${String(nextNumber).padStart(2, "0")}`;
    const orderResult = await client.query(
      "SELECT COALESCE(MAX(sort_order),0)+1 AS next_order FROM reference_values WHERE catalog_code='UNIT'"
    );
    const { rows } = await client.query(
      `INSERT INTO reference_values(catalog_code,value_code,label,sort_order,metadata,is_active)
       VALUES('UNIT',$1,$2,$3,jsonb_build_object('externalId',$1,'abbreviation',$4),TRUE)
       RETURNING catalog_code,value_code,label,sort_order,metadata`,
      [code, label, Number(orderResult.rows[0].next_order), abbreviation]
    );
    await client.query("COMMIT");
    res.status(201).json(serialize(rows[0]));
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

async function listarPersonal(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT p.*,COALESCE(array_agg(pr.role_code) FILTER (WHERE pr.role_code IS NOT NULL),'{}') roles
       FROM personnel p LEFT JOIN personnel_roles pr ON pr.personnel_id=p.id
       WHERE p.organization_id=$1 GROUP BY p.id ORDER BY p.full_name`, [organizationId(req)]
    );
    res.json(rows.map(serialize));
  } catch (error) { next(error); }
}

async function guardarPersonal(req, res, next) {
  const client = await db.connect();
  try {
    const orgId = organizationId(req);
    const { nombreCompleto, estado = "ACTIVE", roles = [] } = req.body || {};
    if (!nombreCompleto) throw new HttpError(400, "El nombre del empleado es obligatorio.", "VALIDATION_ERROR");
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${orgId}:EM`]);
    const codigo = await nextPrefixedCode(client, "personnel", orgId, "EM");
    const { rows } = await client.query(
      `INSERT INTO personnel(organization_id,code,full_name,status) VALUES($1,$2,$3,$4) RETURNING *`,
      [orgId, codigo, nombreCompleto, estado]
    );
    for (const role of roles) await client.query("INSERT INTO personnel_roles(personnel_id,role_code) VALUES($1,$2)", [rows[0].id, role]);
    await client.query("COMMIT");
    res.status(201).json({ ...serialize(rows[0]), roles });
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

async function actualizarPersonal(req, res, next) {
  const client = await db.connect();
  try {
    const orgId = organizationId(req); const body = req.body || {};
    await client.query("BEGIN");
    const current = await client.query("SELECT * FROM personnel WHERE id=$1 AND organization_id=$2 FOR UPDATE", [req.params.id, orgId]);
    if (!current.rows[0]) throw new HttpError(404, "El registro solicitado no existe.", "NOT_FOUND");
    const row = current.rows[0];
    const updated = await client.query(
      `UPDATE personnel SET code=$1,full_name=$2,status=$3,updated_at=NOW() WHERE id=$4 AND organization_id=$5 RETURNING *`,
      [body.codigo ?? row.code, body.nombreCompleto ?? row.full_name, body.estado ?? row.status, req.params.id, orgId]
    );
    if (Array.isArray(body.roles)) {
      await client.query("DELETE FROM personnel_roles WHERE personnel_id=$1", [req.params.id]);
      for (const role of body.roles) await client.query("INSERT INTO personnel_roles(personnel_id,role_code) VALUES($1,$2)", [req.params.id, role]);
    }
    await client.query("UPDATE users SET full_name=$1,updated_at=NOW() WHERE organization_id=$2 AND personnel_id=$3", [updated.rows[0].full_name, orgId, req.params.id]);
    await client.query("COMMIT");
    res.json({ ...serialize(updated.rows[0]), roles: body.roles });
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

async function listarClientes(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT c.*,COALESCE(json_agg(a ORDER BY a.created_at) FILTER (WHERE a.id IS NOT NULL),'[]') addresses
       FROM customers c LEFT JOIN customer_addresses a ON a.customer_id=c.id AND a.organization_id=c.organization_id
       WHERE c.organization_id=$1 GROUP BY c.id ORDER BY c.code`, [organizationId(req)]
    );
    res.json(rows.map(serialize));
  } catch (error) { next(error); }
}

async function guardarCliente(req, res, next) {
  const client = await db.connect();
  try {
    const orgId = organizationId(req);
    const body = req.body || {};
    if (!body.nombreComercial) throw new HttpError(400, "El nombre comercial es obligatorio.", "VALIDATION_ERROR");
    const superNickPrice = twoDecimalValue(body.precioCajaSuperNick, "precio de caja Super Nick");
    const brownNickPrice = twoDecimalValue(body.precioCajaBrownNick, "precio de caja Brown Nick");
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${orgId}:CL`]);
    const code = await nextPrefixedCode(client, "customers", orgId, "CL");
    const { rows } = await client.query(
      `INSERT INTO customers(organization_id,code,commercial_name,contact_name,phone,email,region_code,category_code,super_nick_box_price,brown_nick_box_price,created_by)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [orgId, code, body.nombreComercial, body.contacto || null, body.telefono || null, body.correo || null,
        body.region || null, body.categoria || null, superNickPrice, brownNickPrice, req.user.id]
    );
    for (const address of body.ubicaciones || []) {
      await client.query(
        `INSERT INTO customer_addresses(organization_id,customer_id,tax_id,legal_name,fiscal_address,delivery_address)
         VALUES($1,$2,$3,$4,$5,$6)`,
        [orgId, rows[0].id, address.nit || null, address.razonSocial || null, address.direccionFiscal || null, address.direccionEntrega || null]
      );
    }
    await client.query("COMMIT");
    res.status(201).json(serialize(rows[0]));
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

async function actualizarCliente(req, res, next) {
  const client = await db.connect();
  try {
    const orgId = organizationId(req); const body = req.body || {};
    await client.query("BEGIN");
    const current = await client.query("SELECT * FROM customers WHERE id=$1 AND organization_id=$2 FOR UPDATE", [req.params.id, orgId]);
    if (!current.rows[0]) throw new HttpError(404, "El cliente solicitado no existe.", "NOT_FOUND");
    const row = current.rows[0];
    const superNickPrice = body.precioCajaSuperNick === undefined ? row.super_nick_box_price : twoDecimalValue(body.precioCajaSuperNick, "precio de caja Super Nick");
    const brownNickPrice = body.precioCajaBrownNick === undefined ? row.brown_nick_box_price : twoDecimalValue(body.precioCajaBrownNick, "precio de caja Brown Nick");
    const updated = await client.query(
      `UPDATE customers SET code=$1,commercial_name=$2,contact_name=$3,phone=$4,email=$5,region_code=$6,category_code=$7,
       super_nick_box_price=$8,brown_nick_box_price=$9,status=$10,updated_at=NOW()
       WHERE id=$11 AND organization_id=$12 RETURNING *`,
      [row.code, body.nombreComercial ?? row.commercial_name, body.contacto ?? row.contact_name,
        body.telefono ?? row.phone, body.correo ?? row.email, body.region ?? row.region_code, body.categoria ?? row.category_code,
        superNickPrice, brownNickPrice,
        body.estado ?? row.status, req.params.id, orgId]
    );
    if (Array.isArray(body.ubicaciones)) {
      await client.query("DELETE FROM customer_addresses WHERE customer_id=$1 AND organization_id=$2", [req.params.id, orgId]);
      for (const address of body.ubicaciones) {
        await client.query(
          `INSERT INTO customer_addresses(organization_id,customer_id,tax_id,legal_name,fiscal_address,delivery_address)
           VALUES($1,$2,$3,$4,$5,$6)`,
          [orgId, req.params.id, address.nit || null, address.razonSocial || null, address.direccionFiscal || null, address.direccionEntrega || null]
        );
      }
    }
    await client.query("COMMIT");
    res.json(serialize(updated.rows[0]));
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

module.exports = {
  catalogController, listarValores, siguienteRegion, crearRegion, siguienteUnidad, crearUnidad, listarPersonal, guardarPersonal, actualizarPersonal,
  listarClientes, guardarCliente, actualizarCliente,
  siguienteBodega: siguienteCodigo("warehouses", "BO"), crearBodega,
  siguienteCliente: siguienteCodigo("customers", "CL"), siguienteProveedor: siguienteCodigo("suppliers", "PR"), crearProveedor,
  siguienteProducto, crearProducto,
  crearGalera,
  listarSiguientesLotes, crearLote, actualizarLote,
  configs: catalogos,
};
