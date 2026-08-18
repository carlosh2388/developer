const db = require("../config/database");
const HttpError = require("../utils/httpError");

function organizationId(req) {
  if (!req.user.organizationId) throw new HttpError(403, "Esta operación requiere un usuario de cliente.", "CLIENT_ORGANIZATION_REQUIRED");
  return req.user.organizationId;
}

function required(value, name) {
  if (value === undefined || value === null || value === "") throw new HttpError(400, `El campo ${name} es obligatorio.`, "VALIDATION_ERROR");
  return value;
}

function positive(value, name) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new HttpError(400, `${name} debe ser mayor que cero.`, "VALIDATION_ERROR");
  return number;
}

async function transaction(work) {
  const client = await db.connect();
  try { await client.query("BEGIN"); const result = await work(client); await client.query("COMMIT"); return result; }
  catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}

const entityLookup = {
  suppliers: ["code", "name"], warehouses: ["code", "name"], products: ["code", "name"],
  houses: ["code", "name"], flocks: ["code"], customers: ["code", "commercial_name"],
  vehicles: ["plate"], personnel: ["code", "full_name"], production_stages: ["code", "name"],
};

async function resolveTenantId(client, table, orgId, value, fieldName, optional = false) {
  if (value === undefined || value === null || value === "") {
    if (optional) return null;
    throw new HttpError(400, `El campo ${fieldName} es obligatorio.`, "VALIDATION_ERROR");
  }
  const columns = entityLookup[table];
  if (!columns) throw new Error(`Catálogo no permitido: ${table}`);
  const comparisons = ["id::text=$2", ...columns.map((column) => `LOWER(${column})=LOWER($2)`)];
  const { rows } = await client.query(
    `SELECT id FROM ${table} WHERE organization_id=$1 AND (${comparisons.join(" OR ")}) LIMIT 1`, [orgId, String(value).trim()]
  );
  if (!rows[0]) throw new HttpError(400, `No se encontró ${fieldName} dentro del cliente actual.`, "INVALID_REFERENCE");
  return rows[0].id;
}

async function resolveGradeId(client, value) {
  required(value, "clasificacion");
  const { rows } = await client.query(
    "SELECT id FROM egg_quality_grades WHERE id::text=$1 OR LOWER(code)=LOWER($1) OR LOWER(label)=LOWER($1) LIMIT 1", [String(value).trim()]
  );
  if (!rows[0]) throw new HttpError(400, "La clasificación de huevo no existe.", "INVALID_REFERENCE");
  return rows[0].id;
}

function positiveInteger(value, name) {
  const number = positive(value, name);
  if (!Number.isInteger(number)) throw new HttpError(400, `${name} debe ser un número entero.`, "VALIDATION_ERROR");
  return number;
}

function positiveQuantity(value, name, allowTwoDecimals = false) {
  if (!allowTwoDecimals) return positiveInteger(value, name);
  const number = positive(value, name);
  if (Math.abs(number * 100 - Math.round(number * 100)) > 0.000001) {
    throw new HttpError(400, `${name} debe tener como máximo dos decimales.`, "VALIDATION_ERROR");
  }
  return number;
}

function money(value, name) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number < 0 || Math.abs(number * 100 - Math.round(number * 100)) > 0.000001) {
    throw new HttpError(400, `${name} debe tener como máximo dos decimales.`, "VALIDATION_ERROR");
  }
  return number;
}

const incomingInventoryTypes = new Set(["INPUT", "ADJUSTMENT_IN"]);

async function prepareInventoryDetails(client, orgId, details, allowTwoDecimals = false) {
  const prepared = [];
  for (const detail of details) {
    const productId = await resolveTenantId(client, "products", orgId,
      detail.productoId || detail.producto || detail.item || detail.alimento || detail.material || detail.vacuna, "producto");
    prepared.push({ ...detail, _productId: productId, _quantity: positiveQuantity(detail.cantidad, "cantidad", allowTwoDecimals), _unitCost: money(detail.costoUnitario, "precio") });
  }
  return prepared;
}

async function validateProjectedInventory(client, orgId, details, movementType, excludedDocumentId = null) {
  const currentProducts = excludedDocumentId ? await client.query(
    "SELECT DISTINCT product_id FROM inventory_document_lines WHERE document_id=$1 AND organization_id=$2",
    [excludedDocumentId, orgId]
  ) : { rows: [] };
  const productIds = [...new Set([...details.map((detail) => detail._productId), ...currentProducts.rows.map((row) => row.product_id)])].sort();
  if (!productIds.length) return;
  for (const productId of productIds) await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${orgId}:INVENTORY:${productId}`]);

  const { rows } = await client.query(
    `SELECT p.id,p.code,p.name,p.opening_stock + COALESCE(SUM(
       CASE WHEN d.movement_type IN ('INPUT','ADJUSTMENT_IN') THEN l.quantity ELSE -l.quantity END
     ) FILTER (WHERE d.status='POSTED' AND ($3::uuid IS NULL OR d.id<>$3::uuid)),0) available
     FROM products p
     LEFT JOIN inventory_document_lines l ON l.product_id=p.id AND l.organization_id=p.organization_id
     LEFT JOIN inventory_documents d ON d.id=l.document_id AND d.organization_id=l.organization_id
     WHERE p.organization_id=$1 AND p.id=ANY($2::uuid[])
     GROUP BY p.id ORDER BY p.code`, [orgId, productIds, excludedDocumentId]
  );
  const requested = new Map();
  const sign = incomingInventoryTypes.has(movementType) ? 1 : -1;
  details.forEach((detail) => requested.set(detail._productId, (requested.get(detail._productId) || 0) + sign * detail._quantity));
  for (const product of rows) {
    const projected = Number(product.available || 0) + (requested.get(product.id) || 0);
    if (projected < -0.0001) throw new HttpError(409,
      `Existencia insuficiente para ${product.name}. Disponible: ${Number(product.available || 0).toFixed(4)}.`, "INSUFFICIENT_STOCK");
  }
}

async function listDocuments(req, res, next, table, dateColumn) {
  try {
    const { rows } = await db.query(`SELECT * FROM ${table} WHERE organization_id=$1 ORDER BY ${dateColumn} DESC, created_at DESC`, [organizationId(req)]);
    res.json(rows);
  } catch (error) { next(error); }
}

async function listarInventario(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT d.*,s.code supplier_code,s.name supplier_name,
              COUNT(l.id)::INTEGER line_count,COALESCE(SUM(l.quantity),0) total_quantity,
              COALESCE(SUM(l.quantity * l.unit_cost),0) total_amount,
              COALESCE(STRING_AGG(p.code || ' - ' || p.name, ', ' ORDER BY l.line_number),'') products
       FROM inventory_documents d
       LEFT JOIN suppliers s ON s.id=d.supplier_id AND s.organization_id=d.organization_id
       LEFT JOIN inventory_document_lines l ON l.document_id=d.id AND l.organization_id=d.organization_id
       LEFT JOIN products p ON p.id=l.product_id AND p.organization_id=d.organization_id
       WHERE d.organization_id=$1
       GROUP BY d.id,s.code,s.name
       ORDER BY d.movement_date DESC,d.created_at DESC`, [organizationId(req)]
    );
    res.json(rows);
  } catch (error) { next(error); }
}

async function obtenerInventario(req, res, next) {
  try {
    const orgId = organizationId(req);
    const header = await db.query(
      `SELECT d.*,s.code supplier_code,s.name supplier_name FROM inventory_documents d
       LEFT JOIN suppliers s ON s.id=d.supplier_id AND s.organization_id=d.organization_id
       WHERE d.id=$1 AND d.organization_id=$2`, [req.params.id, orgId]
    );
    if (!header.rows[0]) throw new HttpError(404, "El documento no existe.", "NOT_FOUND");
    const details = await db.query(
      `SELECT l.*,p.code product_code,p.name product_name,COALESCE(json_agg(json_build_object(
         'id',a.id,'house_id',a.house_id,'house_code',h.code,'quantity',a.quantity) ORDER BY a.id) FILTER (WHERE a.id IS NOT NULL),'[]') allocations
       FROM inventory_document_lines l
       JOIN products p ON p.id=l.product_id AND p.organization_id=l.organization_id
       LEFT JOIN inventory_line_allocations a ON a.line_id=l.id AND a.organization_id=l.organization_id
       LEFT JOIN houses h ON h.id=a.house_id AND h.organization_id=a.organization_id
       WHERE l.document_id=$1 AND l.organization_id=$2 GROUP BY l.id,p.id ORDER BY l.line_number`, [req.params.id, orgId]
    );
    res.json({ ...header.rows[0], detalles: details.rows });
  } catch (error) { next(error); }
}

async function actualizarInventario(req, res, next) {
  try {
    const orgId = organizationId(req); const body = req.body || {};
    const detalles = Array.isArray(body.detalles) ? body.detalles : [];
    if (!detalles.length) throw new HttpError(400, "Agrega al menos un detalle.", "VALIDATION_ERROR");
    if (body.tipoMovimiento === "INPUT" && body.modulo === "FOOD" && !(body.proveedorId || body.proveedor)) throw new HttpError(400, "Selecciona el proveedor del ingreso de alimento.", "VALIDATION_ERROR");
    const result = await transaction(async (client) => {
      const current = await client.query("SELECT * FROM inventory_documents WHERE id=$1 AND organization_id=$2 FOR UPDATE", [req.params.id, orgId]);
      if (!current.rows[0]) throw new HttpError(404, "El documento no existe.", "NOT_FOUND");
      if (current.rows[0].status === "VOID") throw new HttpError(409, "Un documento anulado no puede editarse.", "VOID_DOCUMENT");
      const movementType = required(body.tipoMovimiento,"tipoMovimiento");
      const allowTwoDecimals = movementType === "OUTPUT" && body.modulo === "FOOD";
      const preparedDetails = await prepareInventoryDetails(client, orgId, detalles, allowTwoDecimals);
      await validateProjectedInventory(client, orgId, preparedDetails, movementType, req.params.id);
      const supplierId = await resolveTenantId(client, "suppliers", orgId, body.proveedorId || body.proveedor, "proveedor", true);
      const sourceWarehouseId = await resolveTenantId(client, "warehouses", orgId, body.bodegaOrigenId || body.bodegaOrigen, "bodega de origen", true);
      const destinationWarehouseId = await resolveTenantId(client, "warehouses", orgId, body.bodegaDestinoId || body.bodegaDestino, "bodega de destino", true);
      const header = await client.query(
        `UPDATE inventory_documents SET movement_type=$1,module_code=$2,movement_date=$3,supplier_id=$4,source_warehouse_id=$5,
         destination_warehouse_id=$6,notes=$7,updated_by=$8,updated_at=NOW() WHERE id=$9 AND organization_id=$10 RETURNING *`,
        [movementType,required(body.modulo,"modulo"),required(body.fecha,"fecha"),supplierId,
          sourceWarehouseId,destinationWarehouseId,body.observaciones || null,req.user.id,req.params.id,orgId]
      );
      await client.query("DELETE FROM inventory_document_lines WHERE document_id=$1 AND organization_id=$2", [req.params.id, orgId]);
      const inserted = [];
      for (let index=0; index<preparedDetails.length; index+=1) {
        const detail=preparedDetails[index];
        const productId=detail._productId;
        const parent=Number.isInteger(detail.detallePadreIndice) ? inserted[detail.detallePadreIndice]?.id : null;
        const line=await client.query(`INSERT INTO inventory_document_lines(organization_id,document_id,parent_line_id,product_id,line_role,quantity,unit_cost,justification,line_number)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,[orgId,req.params.id,parent,productId,detail.rol || "PRIMARY",detail._quantity,detail._unitCost,detail.justificacion || null,index+1]);
        inserted.push(line.rows[0]);
        let distributed=0;
        for (const allocation of detail.distribuciones || []) { const quantity=positiveQuantity(allocation.cantidad,"cantidad distribuida",allowTwoDecimals); const houseId=await resolveTenantId(client,"houses",orgId,allocation.galeraId || allocation.galera,"galera"); distributed+=quantity; await client.query("INSERT INTO inventory_line_allocations(organization_id,line_id,house_id,quantity) VALUES($1,$2,$3,$4)",[orgId,line.rows[0].id,houseId,quantity]); }
        if ((detail.distribuciones || []).length && Math.abs(distributed-Number(detail.cantidad))>0.0001) throw new HttpError(400,`La distribución de la línea ${index+1} no coincide con su cantidad.`,"ALLOCATION_MISMATCH");
      }
      return { ...header.rows[0], detalles: inserted };
    });
    res.json(result);
  } catch (error) { next(error); }
}

async function crearInventario(req, res, next) {
  try {
    const orgId = organizationId(req);
    const body = req.body || {};
    const detalles = Array.isArray(body.detalles) ? body.detalles : [];
    if (!detalles.length) throw new HttpError(400, "Agrega al menos un detalle.", "VALIDATION_ERROR");
    if (body.tipoMovimiento === "INPUT" && body.modulo === "FOOD" && !(body.proveedorId || body.proveedor)) {
      throw new HttpError(400, "Selecciona el proveedor del ingreso de alimento.", "VALIDATION_ERROR");
    }
    const result = await transaction(async (client) => {
      const movementType = required(body.tipoMovimiento, "tipoMovimiento");
      const allowTwoDecimals = movementType === "OUTPUT" && body.modulo === "FOOD";
      const preparedDetails = await prepareInventoryDetails(client, orgId, detalles, allowTwoDecimals);
      await validateProjectedInventory(client, orgId, preparedDetails, movementType);
      const supplierId = await resolveTenantId(client, "suppliers", orgId, body.proveedorId || body.proveedor, "proveedor", true);
      const sourceWarehouseId = await resolveTenantId(client, "warehouses", orgId, body.bodegaOrigenId || body.bodegaOrigen, "bodega de origen", true);
      const destinationWarehouseId = await resolveTenantId(client, "warehouses", orgId, body.bodegaDestinoId || body.bodegaDestino, "bodega de destino", true);
      const header = await client.query(
        `INSERT INTO inventory_documents(organization_id,movement_type,module_code,movement_date,supplier_id,source_warehouse_id,destination_warehouse_id,notes,created_by)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [orgId, movementType, required(body.modulo, "modulo"), required(body.fecha, "fecha"),
          supplierId, sourceWarehouseId, destinationWarehouseId, body.observaciones || null, req.user.id]
      );
      const inserted = [];
      for (let index = 0; index < preparedDetails.length; index += 1) {
        const detail = preparedDetails[index];
        const productId = detail._productId;
        const parent = Number.isInteger(detail.detallePadreIndice) ? inserted[detail.detallePadreIndice]?.id : null;
        const line = await client.query(
          `INSERT INTO inventory_document_lines(organization_id,document_id,parent_line_id,product_id,line_role,quantity,unit_cost,justification,line_number)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
          [orgId, header.rows[0].id, parent, productId, detail.rol || "PRIMARY",
            detail._quantity, detail._unitCost, detail.justificacion || null, index + 1]
        );
        inserted.push(line.rows[0]);
        let distributed = 0;
        for (const allocation of detail.distribuciones || []) {
          const quantity = positiveQuantity(allocation.cantidad, "cantidad distribuida", allowTwoDecimals);
          const houseId = await resolveTenantId(client, "houses", orgId, allocation.galeraId || allocation.galera, "galera");
          distributed += quantity;
          await client.query(
            "INSERT INTO inventory_line_allocations(organization_id,line_id,house_id,quantity) VALUES($1,$2,$3,$4)",
            [orgId, line.rows[0].id, houseId, quantity]
          );
        }
        if ((detail.distribuciones || []).length && Math.abs(distributed - Number(detail.cantidad)) > 0.0001) {
          throw new HttpError(400, `La distribución de la línea ${index + 1} no coincide con su cantidad.`, "ALLOCATION_MISMATCH");
        }
      }
      return { ...header.rows[0], detalles: inserted };
    });
    res.status(201).json(result);
  } catch (error) { next(error); }
}

async function anularInventario(req, res, next) {
  try {
    const orgId = organizationId(req);
    const result = await transaction(async (client) => {
      const current = await client.query("SELECT * FROM inventory_documents WHERE id=$1 AND organization_id=$2 FOR UPDATE", [req.params.id, orgId]);
      if (!current.rows[0] || current.rows[0].status === "VOID") throw new HttpError(404, "El documento no existe o ya fue anulado.", "NOT_FOUND");
      await validateProjectedInventory(client, orgId, [], current.rows[0].movement_type, req.params.id);
      const { rows } = await client.query(
        `UPDATE inventory_documents SET status='VOID',voided_by=$1,voided_at=NOW()
         WHERE id=$2 AND organization_id=$3 RETURNING *`, [req.user.id, req.params.id, orgId]
      );
      return rows[0];
    });
    res.json(result);
  } catch (error) { next(error); }
}

const voidableDocuments = {
  huevos: { table: "egg_movements", active: "POSTED" },
  reproductores: { table: "bird_exit_documents", active: "POSTED" },
  "peso-aves": { table: "bird_weight_controls", active: "ACTIVE" },
  "peso-huevos": { table: "egg_weight_controls", active: "ACTIVE" },
};

async function anularOperacion(req, res, next) {
  try {
    const config = voidableDocuments[req.params.tipo];
    if (!config) throw new HttpError(404, "El tipo de operación no existe.", "NOT_FOUND");
    const { rows } = await db.query(
      `UPDATE ${config.table} SET status='VOID',voided_by=$1,voided_at=NOW()
       WHERE id=$2 AND organization_id=$3 AND status=$4 RETURNING *`,
      [req.user.id, req.params.id, organizationId(req), config.active]
    );
    if (!rows[0]) throw new HttpError(404, "El registro no existe o ya fue anulado.", "NOT_FOUND");
    res.json(rows[0]);
  } catch (error) { next(error); }
}

async function listarHuevos(req, res, next) {
  try {
    const { rows } = await db.query(`SELECT m.*,
      COALESCE(STRING_AGG(DISTINCT f.code, ', '),'') AS flock_codes,
      COALESCE(STRING_AGG(DISTINCT g.label, ', '),'') AS grade_labels,
      COALESCE(STRING_AGG(DISTINCT pc.full_name, ', ') FILTER (WHERE pc.full_name IS NOT NULL),'') AS collector_names,
      COALESCE(STRING_AGG(DISTINCT pf.full_name, ', ') FILTER (WHERE pf.full_name IS NOT NULL),'') AS classifier_names,
      COUNT(l.id)::INTEGER AS line_count,
      COALESCE(SUM(l.boxes_trays_336 * 336 + l.boxes_cartons_360 * 360 + l.trays_84 * 84 + l.cartons_30 * 30 + l.loose_units),0)::BIGINT AS total_units
      FROM egg_movements m
      LEFT JOIN egg_movement_lines l ON l.movement_id=m.id AND l.organization_id=m.organization_id
      LEFT JOIN flocks f ON f.id=l.flock_id AND f.organization_id=l.organization_id
      LEFT JOIN egg_quality_grades g ON g.id=l.quality_grade_id
      LEFT JOIN personnel pc ON pc.id=l.collector_id
      LEFT JOIN personnel pf ON pf.id=l.classifier_id
      WHERE m.organization_id=$1
      GROUP BY m.id ORDER BY m.movement_date DESC,m.created_at DESC`, [organizationId(req)]);
    res.json(rows);
  } catch (error) { next(error); }
}

async function obtenerHuevos(req, res, next) {
  try { const orgId=organizationId(req); const header=await db.query(`SELECT m.*,sw.code source_warehouse_code,dw.code destination_warehouse_code,
      v.plate vehicle_plate,p.full_name driver_name FROM egg_movements m
      LEFT JOIN warehouses sw ON sw.id=m.source_warehouse_id LEFT JOIN warehouses dw ON dw.id=m.destination_warehouse_id
      LEFT JOIN vehicles v ON v.id=m.vehicle_id LEFT JOIN personnel p ON p.id=m.driver_id
      WHERE m.id=$1 AND m.organization_id=$2`,[req.params.id,orgId]);
    if(!header.rows[0]) throw new HttpError(404,"El movimiento no existe.","NOT_FOUND");
    const details=await db.query(`SELECT l.*,f.code flock_code,g.code grade_code,pc.full_name collector_name,pf.full_name classifier_name
      FROM egg_movement_lines l JOIN flocks f ON f.id=l.flock_id JOIN egg_quality_grades g ON g.id=l.quality_grade_id
      LEFT JOIN personnel pc ON pc.id=l.collector_id LEFT JOIN personnel pf ON pf.id=l.classifier_id
      WHERE l.movement_id=$1 AND l.organization_id=$2 ORDER BY l.line_number`,[req.params.id,orgId]); res.json({...header.rows[0],detalles:details.rows});
  } catch(error){next(error);} }

async function siguienteEnvioHuevos(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT COALESCE(MAX(substring(shipment_number FROM 3)::integer),0) last_number
       FROM egg_movements
       WHERE organization_id=$1 AND movement_type='OUTPUT' AND shipment_number ~ '^EN[0-9]+$'`,
      [organizationId(req)]
    );
    const nextNumber = Number(rows[0].last_number || 0) + 1;
    if (nextNumber > 999) throw new HttpError(409, "Se alcanzó el límite de números de envío EN999.", "SHIPMENT_LIMIT_REACHED");
    res.json({ shipmentNumber: `EN${String(nextNumber).padStart(3, "0")}` });
  } catch (error) { next(error); }
}

async function crearMovimientoHuevos(req, res, next) {
  try {
    const orgId = organizationId(req);
    const body = req.body || {};
    const detalles = Array.isArray(body.detalles) ? body.detalles : [];
    if (!detalles.length) throw new HttpError(400, "Agrega al menos un detalle de huevos.", "VALIDATION_ERROR");
    const result = await transaction(async (client) => {
      const sourceWarehouseId = await resolveTenantId(client, "warehouses", orgId, body.bodegaOrigenId || body.bodegaOrigen, "bodega de origen", true);
      const destinationWarehouseId = await resolveTenantId(client, "warehouses", orgId, body.bodegaDestinoId || body.bodegaDestino, "bodega de destino", true);
      const customerId = await resolveTenantId(client, "customers", orgId, body.clienteId || body.cliente, "cliente", true);
      const vehicleId = await resolveTenantId(client, "vehicles", orgId, body.vehiculoId || body.placa, "vehículo", true);
      const driverId = await resolveTenantId(client, "personnel", orgId, body.pilotoId || body.piloto, "piloto", true);
      let header;
      if (req.params.id) {
        const current=await client.query("SELECT status FROM egg_movements WHERE id=$1 AND organization_id=$2 FOR UPDATE",[req.params.id,orgId]);
        if(!current.rows[0]) throw new HttpError(404,"El movimiento no existe.","NOT_FOUND"); if(current.rows[0].status==="VOID") throw new HttpError(409,"Un movimiento anulado no puede editarse.","VOID_DOCUMENT");
        header=await client.query(`UPDATE egg_movements SET movement_type=$1,movement_date=$2,movement_time=$3,production_date=$4,source_warehouse_id=$5,destination_warehouse_id=$6,destination_type=$7,destination_name=$8,customer_id=$9,vehicle_id=$10,driver_id=$11,notes=$12,updated_by=$13,updated_at=NOW() WHERE id=$14 AND organization_id=$15 RETURNING *`,
          [required(body.tipoMovimiento,"tipoMovimiento"),required(body.fecha,"fecha"),body.hora||null,body.fechaProduccion||null,sourceWarehouseId,destinationWarehouseId,body.tipoDestino||null,body.nombreDestino||null,customerId,vehicleId,driverId,body.observaciones||null,req.user.id,req.params.id,orgId]);
        await client.query("DELETE FROM egg_movement_lines WHERE movement_id=$1 AND organization_id=$2",[req.params.id,orgId]);
      } else {
        let shipmentNumber = null;
        if (body.tipoMovimiento === "OUTPUT") {
          await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${orgId}:EGG-SHIPMENT`]);
          const sequence = await client.query(
            `SELECT COALESCE(MAX(substring(shipment_number FROM 3)::integer),0) + 1 next_number
             FROM egg_movements WHERE organization_id=$1 AND movement_type='OUTPUT' AND shipment_number ~ '^EN[0-9]+$'`, [orgId]
          );
          const nextNumber = Number(sequence.rows[0].next_number);
          if (nextNumber > 999) throw new HttpError(409, "Se alcanzó el límite de números de envío EN999.", "SHIPMENT_LIMIT_REACHED");
          shipmentNumber = `EN${String(nextNumber).padStart(3, "0")}`;
        }
        header = await client.query(
        `INSERT INTO egg_movements(organization_id,movement_type,movement_date,movement_time,production_date,source_warehouse_id,destination_warehouse_id,destination_type,destination_name,customer_id,vehicle_id,driver_id,notes,shipment_number,created_by)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
        [orgId, required(body.tipoMovimiento, "tipoMovimiento"), required(body.fecha, "fecha"), body.hora || null,
          body.fechaProduccion || null, sourceWarehouseId, destinationWarehouseId, body.tipoDestino || null,
          body.nombreDestino || null, customerId, vehicleId, driverId,
          body.observaciones || null, shipmentNumber, req.user.id]
      );
      }
      const lines = [];
      for (let index = 0; index < detalles.length; index += 1) {
        const d = detalles[index];
        const flockId = await resolveTenantId(client, "flocks", orgId, d.loteId || d.lote, "lote");
        const gradeId = await resolveGradeId(client, d.clasificacionId || d.clasificacion || d.calidad);
        const collectorId = await resolveTenantId(client, "personnel", orgId, d.recolectorId || d.recolector, "recolector", true);
        const classifierId = await resolveTenantId(client, "personnel", orgId, d.clasificadorId || d.clasificador, "clasificador", true);
        const values = [d.cajasBandejas336, d.cajasCartones360, d.bandejas84, d.cartones30, d.unidades].map((v) => Number(v || 0));
        if (values.some((v) => !Number.isInteger(v) || v < 0) || values.every((v) => v === 0)) {
          throw new HttpError(400, `El detalle ${index + 1} debe contener cantidades enteras positivas.`, "VALIDATION_ERROR");
        }
        const requestedUnits = values[0] * 336 + values[1] * 360 + values[2] * 84 + values[3] * 30 + values[4];
        let existingUnits = Number(d.existencia || 0);
        if (body.tipoMovimiento === "OUTPUT") {
          await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${orgId}:${flockId}:${gradeId}`]);
          const balance = await client.query(`SELECT COALESCE(SUM(CASE WHEN m.movement_type='INPUT' THEN l.total_units ELSE -l.total_units END)
            FILTER (WHERE m.status='POSTED' AND ($4::uuid IS NULL OR m.id<>$4::uuid)),0)::BIGINT AS available_units
            FROM egg_movement_lines l JOIN egg_movements m ON m.id=l.movement_id AND m.organization_id=l.organization_id
            WHERE l.organization_id=$1 AND l.flock_id=$2 AND l.quality_grade_id=$3`, [orgId, flockId, gradeId, req.params.id || null]);
          existingUnits = Number(balance.rows[0].available_units || 0);
          if (requestedUnits > existingUnits) throw new HttpError(409, `La salida del detalle ${index + 1} supera la existencia disponible (${existingUnits}).`, "INSUFFICIENT_EGG_STOCK");
        }
        const line = await client.query(
          `INSERT INTO egg_movement_lines(organization_id,movement_id,flock_id,quality_grade_id,collector_id,classifier_id,existing_units,boxes_trays_336,boxes_cartons_360,trays_84,cartons_30,loose_units,total_weight_grams,line_number)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
          [orgId, header.rows[0].id, flockId, gradeId,
            collectorId, classifierId, existingUnits, ...values,
            d.pesoTotalGramos || null, index + 1]
        );
        lines.push(line.rows[0]);
      }
      return { ...header.rows[0], detalles: lines };
    });
    res.status(req.params.id ? 200 : 201).json(result);
  } catch (error) { next(error); }
}

async function listarClasificacionesHuevos(req, res, next) {
  try {
    const { rows } = await db.query("SELECT * FROM egg_quality_grades WHERE is_active=TRUE ORDER BY egg_class,sort_order");
    res.json(rows);
  } catch (error) { next(error); }
}

async function listarExistenciasHuevos(req, res, next) {
  try {
    const orgId = organizationId(req);
    const lote = required(req.query.lote, "lote");
    const { rows: flocks } = await db.query(
      "SELECT id FROM flocks WHERE organization_id=$1 AND (id::text=$2 OR LOWER(code)=LOWER($2)) LIMIT 1",
      [orgId, String(lote).trim()]
    );
    if (!flocks[0]) throw new HttpError(404, "El lote seleccionado no existe.", "INVALID_REFERENCE");
    const { rows } = await db.query(`SELECT g.code AS grade_code,g.label,
      COALESCE(SUM(CASE WHEN m.movement_type='INPUT' THEN l.total_units ELSE -l.total_units END)
        FILTER (WHERE m.status='POSTED'),0)::BIGINT AS available_units
      FROM egg_quality_grades g
      LEFT JOIN egg_movement_lines l ON l.quality_grade_id=g.id AND l.organization_id=$1 AND l.flock_id=$2
      LEFT JOIN egg_movements m ON m.id=l.movement_id AND m.organization_id=l.organization_id
      WHERE g.is_active=TRUE GROUP BY g.id ORDER BY g.egg_class,g.sort_order`, [orgId, flocks[0].id]);
    res.json(rows);
  } catch (error) { next(error); }
}

async function listarEgresosAves(req, res, next) {
  try {
    const { rows } = await db.query(`SELECT d.*,
      COALESCE(STRING_AGG(DISTINCT f.code, ', '),'') flock_codes,
      COALESCE(STRING_AGG(DISTINCT CASE l.reason_code WHEN 'SEXING_ERROR' THEN 'Error de sexado' WHEN 'MORTALITY' THEN 'Mortandad'
        WHEN 'SELECTION' THEN 'Selección' WHEN 'SALE' THEN 'Venta' ELSE l.reason_code END, ', '),'') reason_names,
      COALESCE(SUM(l.female_count),0)::integer total_females,COALESCE(SUM(l.male_count),0)::integer total_males,
      COALESCE(SUM(l.female_count+l.male_count),0)::integer total_birds,
      COALESCE(STRING_AGG(DISTINCT l.observation, ' · ') FILTER (WHERE NULLIF(TRIM(l.observation),'') IS NOT NULL),'') observations,
      COUNT(l.id)::integer line_count
      FROM bird_exit_documents d LEFT JOIN bird_exit_lines l ON l.document_id=d.id AND l.organization_id=d.organization_id
      LEFT JOIN flocks f ON f.id=l.flock_id AND f.organization_id=l.organization_id
      WHERE d.organization_id=$1 GROUP BY d.id ORDER BY d.movement_date DESC,d.created_at DESC`, [organizationId(req)]);
    res.json(rows);
  } catch (error) { next(error); }
}

async function obtenerEgresoAves(req,res,next){try{const orgId=organizationId(req);const h=await db.query("SELECT * FROM bird_exit_documents WHERE id=$1 AND organization_id=$2",[req.params.id,orgId]);if(!h.rows[0])throw new HttpError(404,"El egreso no existe.","NOT_FOUND");const d=await db.query("SELECT l.*,f.code flock_code FROM bird_exit_lines l JOIN flocks f ON f.id=l.flock_id WHERE l.document_id=$1 AND l.organization_id=$2 ORDER BY l.line_number",[req.params.id,orgId]);res.json({...h.rows[0],detalles:d.rows});}catch(e){next(e);}}

async function crearEgresoAves(req, res, next) {
  try {
    const orgId = organizationId(req);
    const body = req.body || {};
    const detalles = Array.isArray(body.detalles) ? body.detalles : [];
    if (!detalles.length) throw new HttpError(400, "Agrega al menos un detalle.", "VALIDATION_ERROR");
    const result = await transaction(async (client) => {
      let header;
      if(req.params.id){const current=await client.query("SELECT status FROM bird_exit_documents WHERE id=$1 AND organization_id=$2 FOR UPDATE",[req.params.id,orgId]);if(!current.rows[0])throw new HttpError(404,"El egreso no existe.","NOT_FOUND");if(current.rows[0].status==="VOID")throw new HttpError(409,"Un egreso anulado no puede editarse.","VOID_DOCUMENT");header=await client.query("UPDATE bird_exit_documents SET movement_date=$1,shipment_number=$2,updated_by=$3,updated_at=NOW() WHERE id=$4 AND organization_id=$5 RETURNING *",[required(body.fecha,"fecha"),body.numeroEnvio||null,req.user.id,req.params.id,orgId]);await client.query("DELETE FROM bird_exit_lines WHERE document_id=$1 AND organization_id=$2",[req.params.id,orgId]);}else header = await client.query(
        "INSERT INTO bird_exit_documents(organization_id,movement_date,shipment_number,created_by) VALUES($1,$2,$3,$4) RETURNING *",
        [orgId, required(body.fecha, "fecha"), body.numeroEnvio || null, req.user.id]
      );
      const lines = [];
      for (let index = 0; index < detalles.length; index += 1) {
        const d = detalles[index];
        const flockId = await resolveTenantId(client, "flocks", orgId, d.loteId || d.lote, "lote");
        const females = Number(d.hembras || 0); const males = Number(d.machos || 0);
        if (!Number.isInteger(females) || !Number.isInteger(males) || females < 0 || males < 0 || females + males <= 0) {
          throw new HttpError(400, `Cantidades inválidas en el detalle ${index + 1}.`, "VALIDATION_ERROR");
        }
        const line = await client.query(
          `INSERT INTO bird_exit_lines(organization_id,document_id,flock_id,reason_code,female_count,male_count,observation,line_number)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
          [orgId, header.rows[0].id, flockId, required(d.motivo, "motivo"), females, males, d.observacion || null, index + 1]
        );
        lines.push(line.rows[0]);
      }
      return { ...header.rows[0], detalles: lines };
    });
    res.status(req.params.id ? 200 : 201).json(result);
  } catch (error) { next(error); }
}

async function listarPesoAves(req, res, next) {
  try {
    const { rows } = await db.query(`SELECT c.*,f.code AS flock_code,s.name AS stage_name
      FROM bird_weight_controls c
      JOIN flocks f ON f.id=c.flock_id AND f.organization_id=c.organization_id
      LEFT JOIN production_stages s ON s.id=c.stage_id AND s.organization_id=c.organization_id
      WHERE c.organization_id=$1 ORDER BY c.control_date DESC,c.created_at DESC`, [organizationId(req)]);
    res.json(rows);
  } catch (error) { next(error); }
}

async function obtenerPesoAves(req, res, next) {
  try {
    const orgId = organizationId(req);
    const header = await db.query(`SELECT c.*,f.code flock_code,s.code stage_code
      FROM bird_weight_controls c JOIN flocks f ON f.id=c.flock_id
      LEFT JOIN production_stages s ON s.id=c.stage_id
      WHERE c.id=$1 AND c.organization_id=$2`, [req.params.id, orgId]);
    if (!header.rows[0]) throw new HttpError(404, "El control no existe.", "NOT_FOUND");
    const samples = await db.query("SELECT * FROM bird_weight_samples WHERE control_id=$1 AND organization_id=$2 ORDER BY sample_number", [req.params.id, orgId]);
    res.json({ ...header.rows[0], muestras: samples.rows });
  } catch (error) { next(error); }
}

async function crearPesoAves(req, res, next) {
  try {
    const orgId = organizationId(req); const body = req.body || {}; const muestras = body.muestras || [];
    if (!muestras.length) throw new HttpError(400, "Agrega las muestras de peso.", "VALIDATION_ERROR");
    const result = await transaction(async (client) => {
      const flockId = await resolveTenantId(client, "flocks", orgId, body.loteId || body.lote, "lote");
      const stageId = await resolveTenantId(client, "production_stages", orgId, body.etapaId || body.etapa, "etapa", true);
      let header;
      if (req.params.id) {
        const current = await client.query("SELECT status FROM bird_weight_controls WHERE id=$1 AND organization_id=$2 FOR UPDATE", [req.params.id, orgId]);
        if (!current.rows[0]) throw new HttpError(404, "El control no existe.", "NOT_FOUND");
        if (current.rows[0].status === "VOID") throw new HttpError(409, "Un control anulado no puede editarse.", "VOID_DOCUMENT");
        header = await client.query(`UPDATE bird_weight_controls SET flock_id=$1,stage_id=$2,control_date=$3,week_number=$4,sample_size=$5,
          female_average_grams=$6,male_average_grams=$7,overall_average_grams=$8,female_uniformity=$9,male_uniformity=$10,overall_uniformity=$11,
          updated_by=$12,updated_at=NOW() WHERE id=$13 AND organization_id=$14 RETURNING *`,
        [flockId, stageId, required(body.fecha, "fecha"), positive(body.semana, "semana"), muestras.length,
          body.promedioHembras || null, body.promedioMachos || null, body.promedioGeneral || null,
          body.uniformidadHembras || null, body.uniformidadMachos || null, body.uniformidadGeneral || null,
          req.user.id, req.params.id, orgId]);
        await client.query("DELETE FROM bird_weight_samples WHERE control_id=$1 AND organization_id=$2", [req.params.id, orgId]);
      } else header = await client.query(
        `INSERT INTO bird_weight_controls(organization_id,flock_id,stage_id,control_date,week_number,sample_size,female_average_grams,male_average_grams,overall_average_grams,female_uniformity,male_uniformity,overall_uniformity,created_by)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
        [orgId, flockId, stageId, required(body.fecha, "fecha"), positive(body.semana, "semana"),
          muestras.length, body.promedioHembras || null, body.promedioMachos || null, body.promedioGeneral || null,
          body.uniformidadHembras || null, body.uniformidadMachos || null, body.uniformidadGeneral || null, req.user.id]
      );
      for (let index = 0; index < muestras.length; index += 1) {
        const sample = muestras[index];
        await client.query(
          "INSERT INTO bird_weight_samples(organization_id,control_id,sex,sample_number,weight_grams) VALUES($1,$2,$3,$4,$5)",
          [orgId, header.rows[0].id, required(sample.sexo, "sexo"), index + 1, positive(sample.pesoGramos, "pesoGramos")]
        );
      }
      return header.rows[0];
    });
    res.status(req.params.id ? 200 : 201).json(result);
  } catch (error) { next(error); }
}

async function listarPesoHuevos(req, res, next) {
  try {
    const { rows } = await db.query(`SELECT c.*,f.code AS flock_code
      FROM egg_weight_controls c
      JOIN flocks f ON f.id=c.flock_id AND f.organization_id=c.organization_id
      WHERE c.organization_id=$1 ORDER BY c.control_date DESC,c.created_at DESC`, [organizationId(req)]);
    res.json(rows);
  } catch (error) { next(error); }
}

async function obtenerPesoHuevos(req, res, next) {
  try {
    const orgId = organizationId(req);
    const header = await db.query(`SELECT c.*,f.code flock_code FROM egg_weight_controls c
      JOIN flocks f ON f.id=c.flock_id WHERE c.id=$1 AND c.organization_id=$2`, [req.params.id, orgId]);
    if (!header.rows[0]) throw new HttpError(404, "El control no existe.", "NOT_FOUND");
    const samples = await db.query("SELECT * FROM egg_weight_samples WHERE control_id=$1 AND organization_id=$2 ORDER BY sample_number", [req.params.id, orgId]);
    res.json({ ...header.rows[0], muestras: samples.rows });
  } catch (error) { next(error); }
}

async function crearPesoHuevos(req, res, next) {
  try {
    const orgId = organizationId(req); const body = req.body || {}; const muestras = body.muestras || [];
    if (!muestras.length) throw new HttpError(400, "Agrega las muestras de peso.", "VALIDATION_ERROR");
    const result = await transaction(async (client) => {
      const flockId = await resolveTenantId(client, "flocks", orgId, body.loteId || body.lote, "lote");
      let header;
      if (req.params.id) {
        const current = await client.query("SELECT status FROM egg_weight_controls WHERE id=$1 AND organization_id=$2 FOR UPDATE", [req.params.id, orgId]);
        if (!current.rows[0]) throw new HttpError(404, "El control no existe.", "NOT_FOUND");
        if (current.rows[0].status === "VOID") throw new HttpError(409, "Un control anulado no puede editarse.", "VOID_DOCUMENT");
        header = await client.query(`UPDATE egg_weight_controls SET flock_id=$1,control_date=$2,week_number=$3,sample_size=$4,
          average_weight_grams=$5,uniformity_percentage=$6,updated_by=$7,updated_at=NOW()
          WHERE id=$8 AND organization_id=$9 RETURNING *`,
        [flockId, required(body.fecha, "fecha"), positive(body.semana, "semana"), muestras.length,
          body.pesoPromedio || null, body.uniformidad || null, req.user.id, req.params.id, orgId]);
        await client.query("DELETE FROM egg_weight_samples WHERE control_id=$1 AND organization_id=$2", [req.params.id, orgId]);
      } else header = await client.query(
        `INSERT INTO egg_weight_controls(organization_id,flock_id,control_date,week_number,sample_size,average_weight_grams,uniformity_percentage,created_by)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [orgId, flockId, required(body.fecha, "fecha"), positive(body.semana, "semana"), muestras.length,
          body.pesoPromedio || null, body.uniformidad || null, req.user.id]
      );
      for (let index = 0; index < muestras.length; index += 1) {
        const sample = muestras[index];
        await client.query(
          `INSERT INTO egg_weight_samples(organization_id,control_id,sample_number,gross_box_weight_grams,packaging_type,packaging_weight_grams,unit_weight_grams)
           VALUES($1,$2,$3,$4,$5,$6,$7)`,
          [orgId, header.rows[0].id, index + 1, positive(sample.pesoCaja, "pesoCaja"), required(sample.tipoEmpaque, "tipoEmpaque"),
            Number(sample.pesoEmpaque || 0), positive(sample.pesoUnitario, "pesoUnitario")]
        );
      }
      return header.rows[0];
    });
    res.status(req.params.id ? 200 : 201).json(result);
  } catch (error) { next(error); }
}

module.exports = {
  listarInventario, obtenerInventario, crearInventario, actualizarInventario, anularInventario,
  anularOperacion,
  listarHuevos, obtenerHuevos, crearMovimientoHuevos, listarClasificacionesHuevos, listarExistenciasHuevos, siguienteEnvioHuevos,
  listarEgresosAves, obtenerEgresoAves, crearEgresoAves,
  listarPesoAves, obtenerPesoAves, crearPesoAves,
  listarPesoHuevos, obtenerPesoHuevos, crearPesoHuevos,
};
