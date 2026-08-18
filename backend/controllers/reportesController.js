const db = require("../config/database");
const HttpError = require("../utils/httpError");

async function inventoryAlerts(req, res, next) {
  try {
    if (!req.user.organizationId) throw new HttpError(403, "Esta operación requiere un usuario de cliente.", "CLIENT_ORGANIZATION_REQUIRED");
    const { rows } = await db.query(`WITH stock AS (
      SELECT p.id,p.code,p.name,p.unit_code,p.opening_stock,
        p.opening_stock + COALESCE(SUM(CASE WHEN d.movement_type IN ('INPUT','ADJUSTMENT_IN') THEN l.quantity ELSE -l.quantity END)
          FILTER (WHERE d.status='POSTED'),0) current_stock
      FROM products p LEFT JOIN inventory_document_lines l ON l.product_id=p.id AND l.organization_id=p.organization_id
      LEFT JOIN inventory_documents d ON d.id=l.document_id AND d.organization_id=l.organization_id
      WHERE p.organization_id=$1 AND p.status='ACTIVE' AND p.opening_stock>0 GROUP BY p.id
    ) SELECT id,code,name,unit_code,current_stock,opening_stock,
      ROUND(GREATEST(0,current_stock)/opening_stock*100,2) stock_percentage,
      CASE WHEN current_stock/opening_stock*100<=35 THEN 'CRITICAL' ELSE 'WARNING' END severity
      FROM stock WHERE current_stock/opening_stock*100<=50
      ORDER BY stock_percentage ASC,name ASC`, [req.user.organizationId]);
    res.json({ alerts: rows, critical: rows.filter((row) => row.severity === "CRITICAL").length, warning: rows.filter((row) => row.severity === "WARNING").length });
  } catch (error) { next(error); }
}

async function dashboard(req, res, next) {
  try {
    if (!req.user.organizationId) throw new HttpError(403, "Esta operación requiere un usuario de cliente.", "CLIENT_ORGANIZATION_REQUIRED");
    const orgId = req.user.organizationId;
    const range = ["24h", "7d", "15d", "30d"].includes(req.query.range) ? req.query.range : "7d";
    const dayCount = { "7d": 7, "15d": 15, "30d": 30 }[range];
    const trendQuery = range === "24h"
      ? `WITH periods AS (SELECT generate_series(date_trunc('hour',CURRENT_TIMESTAMP)-interval '23 hours',date_trunc('hour',CURRENT_TIMESTAMP),interval '1 hour') period), movements AS (
          SELECT date_trunc('hour',d.created_at) period,CASE WHEN d.movement_type IN ('INPUT','ADJUSTMENT_IN') THEN 'INPUT' ELSE 'OUTPUT' END direction,
            p.code,p.name,SUM(l.quantity) quantity
          FROM inventory_documents d JOIN inventory_document_lines l ON l.document_id=d.id AND l.organization_id=d.organization_id
          JOIN products p ON p.id=l.product_id AND p.organization_id=l.organization_id
          WHERE d.organization_id=$1 AND d.status='POSTED' AND d.created_at>=CURRENT_TIMESTAMP-interval '24 hours'
          GROUP BY date_trunc('hour',d.created_at),direction,p.code,p.name)
          SELECT periods.period,COALESCE(SUM(m.quantity) FILTER (WHERE m.direction='INPUT'),0) inputs,COALESCE(SUM(m.quantity) FILTER (WHERE m.direction='OUTPUT'),0) outputs,
            COALESCE(jsonb_agg(jsonb_build_object('code',m.code,'name',m.name,'quantity',m.quantity) ORDER BY m.name) FILTER (WHERE m.direction='INPUT'),'[]') input_products,
            COALESCE(jsonb_agg(jsonb_build_object('code',m.code,'name',m.name,'quantity',m.quantity) ORDER BY m.name) FILTER (WHERE m.direction='OUTPUT'),'[]') output_products
          FROM periods LEFT JOIN movements m ON m.period=periods.period GROUP BY periods.period ORDER BY periods.period`
      : `WITH periods AS (SELECT generate_series(CURRENT_DATE-${dayCount - 1},CURRENT_DATE,'1 day')::date period), movements AS (
          SELECT d.movement_date period,CASE WHEN d.movement_type IN ('INPUT','ADJUSTMENT_IN') THEN 'INPUT' ELSE 'OUTPUT' END direction,
            p.code,p.name,SUM(l.quantity) quantity
          FROM inventory_documents d JOIN inventory_document_lines l ON l.document_id=d.id AND l.organization_id=d.organization_id
          JOIN products p ON p.id=l.product_id AND p.organization_id=l.organization_id
          WHERE d.organization_id=$1 AND d.status='POSTED' AND d.movement_date>=CURRENT_DATE-${dayCount - 1}
          GROUP BY d.movement_date,direction,p.code,p.name)
          SELECT periods.period,COALESCE(SUM(m.quantity) FILTER (WHERE m.direction='INPUT'),0) inputs,COALESCE(SUM(m.quantity) FILTER (WHERE m.direction='OUTPUT'),0) outputs,
            COALESCE(jsonb_agg(jsonb_build_object('code',m.code,'name',m.name,'quantity',m.quantity) ORDER BY m.name) FILTER (WHERE m.direction='INPUT'),'[]') input_products,
            COALESCE(jsonb_agg(jsonb_build_object('code',m.code,'name',m.name,'quantity',m.quantity) ORDER BY m.name) FILTER (WHERE m.direction='OUTPUT'),'[]') output_products
          FROM periods LEFT JOIN movements m ON m.period=periods.period GROUP BY periods.period ORDER BY periods.period`;
    const [summary, byType, trend, lowStock, recent] = await Promise.all([
      db.query(`WITH stock AS (
        SELECT p.id,p.opening_stock + COALESCE(SUM(CASE WHEN d.movement_type IN ('INPUT','ADJUSTMENT_IN') THEN l.quantity ELSE -l.quantity END) FILTER (WHERE d.status='POSTED'),0) quantity
        FROM products p LEFT JOIN inventory_document_lines l ON l.product_id=p.id AND l.organization_id=p.organization_id
        LEFT JOIN inventory_documents d ON d.id=l.document_id AND d.organization_id=l.organization_id
        WHERE p.organization_id=$1 AND p.status='ACTIVE' GROUP BY p.id
      ), month_movements AS (
        SELECT COALESCE(SUM(l.quantity) FILTER (WHERE d.movement_type IN ('INPUT','ADJUSTMENT_IN')),0) inputs,
          COALESCE(SUM(l.quantity) FILTER (WHERE d.movement_type IN ('OUTPUT','ADJUSTMENT_OUT')),0) outputs
        FROM inventory_documents d JOIN inventory_document_lines l ON l.document_id=d.id AND l.organization_id=d.organization_id
        WHERE d.organization_id=$1 AND d.status='POSTED' AND d.movement_date>=date_trunc('month',CURRENT_DATE)
      ) SELECT COALESCE((SELECT SUM(quantity) FROM stock),0) current_stock,COALESCE((SELECT inputs FROM month_movements),0) month_inputs,
        COALESCE((SELECT outputs FROM month_movements),0) month_outputs,(SELECT COUNT(*) FROM stock)::integer active_products`, [orgId]),
      db.query(`SELECT p.product_type,CASE p.product_type WHEN 'AD' THEN 'Aditivos' WHEN 'AL' THEN 'Alimentos' WHEN 'HC' THEN 'Huevos comerciales'
          WHEN 'HI' THEN 'Huevos incubables' WHEN 'IN' THEN 'Insumos' WHEN 'ME' THEN 'Material de empaque' WHEN 'MD' THEN 'Medicamentos' WHEN 'VA' THEN 'Vacunas' ELSE p.product_type END label,
        COALESCE(SUM(p.opening_stock + COALESCE(m.quantity,0)),0) quantity FROM products p
        LEFT JOIN (SELECT l.product_id,SUM(CASE WHEN d.movement_type IN ('INPUT','ADJUSTMENT_IN') THEN l.quantity ELSE -l.quantity END) quantity
          FROM inventory_document_lines l JOIN inventory_documents d ON d.id=l.document_id AND d.organization_id=l.organization_id
          WHERE d.organization_id=$1 AND d.status='POSTED' GROUP BY l.product_id) m ON m.product_id=p.id
        WHERE p.organization_id=$1 AND p.status='ACTIVE' GROUP BY p.product_type ORDER BY label`, [orgId]),
      db.query(trendQuery, [orgId]),
      db.query(`SELECT p.code,p.name,p.unit_code unit,p.opening_stock + COALESCE(SUM(CASE WHEN d.movement_type IN ('INPUT','ADJUSTMENT_IN') THEN l.quantity ELSE -l.quantity END) FILTER (WHERE d.status='POSTED'),0) quantity
        FROM products p LEFT JOIN inventory_document_lines l ON l.product_id=p.id AND l.organization_id=p.organization_id
        LEFT JOIN inventory_documents d ON d.id=l.document_id AND d.organization_id=l.organization_id
        WHERE p.organization_id=$1 AND p.status='ACTIVE' GROUP BY p.id ORDER BY quantity ASC,p.name ASC LIMIT 5`, [orgId]),
      db.query(`SELECT d.id,d.movement_date,d.movement_type,d.module_code,COALESCE(SUM(l.quantity),0) quantity,
        COALESCE(STRING_AGG(DISTINCT p.name, ', '),'Sin productos') products FROM inventory_documents d
        LEFT JOIN inventory_document_lines l ON l.document_id=d.id AND l.organization_id=d.organization_id LEFT JOIN products p ON p.id=l.product_id
        WHERE d.organization_id=$1 AND d.status='POSTED' GROUP BY d.id ORDER BY d.movement_date DESC,d.created_at DESC LIMIT 6`, [orgId]),
    ]);
    res.json({ summary: summary.rows[0], byType: byType.rows, trend: trend.rows, trendRange: range, lowStock: lowStock.rows, recent: recent.rows });
  } catch (error) { next(error); }
}

function filtros(req) {
  const fechaInicio = String(req.query.fechaInicio || "");
  const fechaFin = String(req.query.fechaFin || "");
  const lotes = String(req.query.lotes || "").split(",").map((v) => v.trim()).filter(Boolean);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
    throw new HttpError(400, "Indica una fecha de inicio y una fecha final válidas.", "VALIDATION_ERROR");
  }
  const dias = (new Date(`${fechaFin}T00:00:00Z`) - new Date(`${fechaInicio}T00:00:00Z`)) / 86400000;
  if (dias < 0 || dias > 366) throw new HttpError(400, "El rango debe estar entre 1 y 367 días.", "INVALID_DATE_RANGE");
  return { fechaInicio, fechaFin, lotes };
}

async function produccion(req, res, next) {
  try {
    const { fechaInicio, fechaFin, lotes } = filtros(req);
    const esAdministrador = req.user.role === "ADMINISTRATOR";
    if (req.query.formato === "excel" && !esAdministrador) {
      throw new HttpError(403, "Solo el administrador puede exportar reportes en Excel.", "EXCEL_ADMIN_REQUIRED");
    }
    const { rows } = await db.query(`
      WITH selected_flocks AS (
        SELECT f.* FROM flocks f
        WHERE f.organization_id=$1 AND (cardinality($4::text[])=0 OR f.code=ANY($4::text[]))
      ), activity AS (
        SELECT f.id flock_id, d::date report_date FROM selected_flocks f
        CROSS JOIN generate_series($2::date,$3::date,'1 day') d
      ), exits_daily AS (
        SELECT l.flock_id,d.movement_date,
          SUM(l.female_count)::numeric female_exit,SUM(l.male_count)::numeric male_exit,
          SUM(l.female_count) FILTER(WHERE l.reason_code='MORTALITY')::numeric female_mortality,
          SUM(l.male_count) FILTER(WHERE l.reason_code='MORTALITY')::numeric male_mortality
        FROM bird_exit_documents d JOIN bird_exit_lines l ON l.document_id=d.id AND l.organization_id=d.organization_id
        WHERE d.organization_id=$1 AND d.status='POSTED' GROUP BY l.flock_id,d.movement_date
      ), egg_daily AS (
        SELECT l.flock_id,m.movement_date,
          SUM(l.total_units) FILTER(WHERE g.egg_class='INCUBABLE')::numeric incubable,
          SUM(l.total_units) FILTER(WHERE g.egg_class='COMMERCIAL')::numeric commercial,
          SUM(l.total_units) FILTER(WHERE g.source_type='NEST')::numeric nest,
          SUM(l.total_units) FILTER(WHERE g.source_type='FLOOR')::numeric floor,
          SUM(l.total_units) FILTER(WHERE g.code='COM_SMALL_NEST')::numeric small,
          SUM(l.total_units) FILTER(WHERE g.code IN ('COM_DIRTY_NEST','COM_DIRTY_FLOOR'))::numeric dirty,
          SUM(l.total_units) FILTER(WHERE g.code IN ('COM_BROKEN_NEST','COM_BROKEN_FLOOR'))::numeric broken,
          SUM(l.total_units) FILTER(WHERE g.code='COM_PALE_RED_NEST')::numeric pale,
          SUM(l.total_units) FILTER(WHERE g.code='COM_BLOOD_NEST')::numeric blood
        FROM egg_movements m JOIN egg_movement_lines l ON l.movement_id=m.id AND l.organization_id=m.organization_id
        JOIN egg_quality_grades g ON g.id=l.quality_grade_id
        WHERE m.organization_id=$1 AND m.movement_type='INPUT' AND m.status='POSTED'
        GROUP BY l.flock_id,m.movement_date
      ), food_daily AS (
        SELECT f.id flock_id,d.movement_date,SUM(a.quantity)::numeric food_qty
        FROM selected_flocks f JOIN inventory_line_allocations a ON a.house_id=f.house_id AND a.organization_id=f.organization_id
        JOIN inventory_document_lines l ON l.id=a.line_id AND l.organization_id=a.organization_id
        JOIN inventory_documents d ON d.id=l.document_id AND d.organization_id=l.organization_id
        WHERE d.movement_type='OUTPUT' AND d.module_code='FOOD' AND d.status='POSTED' AND l.line_role IN ('PRIMARY','BASE_FOOD')
        GROUP BY f.id,d.movement_date
      )
      SELECT f.code lote,a.report_date fecha,
        GREATEST(1,FLOOR((a.report_date-f.received_on)/7.0)+1)::int edad_semana,
        GREATEST(0,f.female_count-COALESCE((SELECT SUM(x.female_exit) FROM exits_daily x WHERE x.flock_id=f.id AND x.movement_date<=a.report_date),0)) inventario_hembras,
        COALESCE(e.female_mortality,0) mortalidad_hembras,
        GREATEST(0,f.male_count-COALESCE((SELECT SUM(x.male_exit) FROM exits_daily x WHERE x.flock_id=f.id AND x.movement_date<=a.report_date),0)) inventario_machos,
        COALESCE(e.male_mortality,0) mortalidad_machos,COALESCE(fd.food_qty,0) alimento_cantidad,
        COALESCE(ed.incubable,0) huevo_incubable,COALESCE(ed.commercial,0) huevo_comercial,
        COALESCE(ed.nest,0) huevo_nido,COALESCE(ed.floor,0) huevo_piso,COALESCE(ed.small,0) huevo_pequeno,
        COALESCE(ed.dirty,0) huevo_sucio,COALESCE(ed.broken,0) huevo_quebrado,COALESCE(ed.pale,0) huevo_palido,COALESCE(ed.blood,0) huevo_sangre
      FROM activity a JOIN selected_flocks f ON f.id=a.flock_id
      LEFT JOIN exits_daily e ON e.flock_id=f.id AND e.movement_date=a.report_date
      LEFT JOIN egg_daily ed ON ed.flock_id=f.id AND ed.movement_date=a.report_date
      LEFT JOIN food_daily fd ON fd.flock_id=f.id AND fd.movement_date=a.report_date
      WHERE COALESCE(e.female_exit,0)+COALESCE(e.male_exit,0)+COALESCE(fd.food_qty,0)+COALESCE(ed.incubable,0)+COALESCE(ed.commercial,0)>0
      ORDER BY f.code,a.report_date DESC`, [req.user.organizationId, fechaInicio, fechaFin, lotes]);
    const data = rows.map((r) => {
      const num = (v) => Number(v || 0); const total = num(r.huevo_incubable) + num(r.huevo_comercial);
      const aves = num(r.inventario_hembras) + num(r.inventario_machos); const pct = (v, base=total) => base ? +(num(v)*100/base).toFixed(2) : 0;
      return { ...r, alimento_gramos_ave: aves ? +(num(r.alimento_cantidad)*1000/aves).toFixed(2) : 0,
        porcentaje_postura:pct(total,r.inventario_hembras),porcentaje_incubable:pct(r.huevo_incubable),porcentaje_comercial:pct(r.huevo_comercial),
        porcentaje_nido:pct(r.huevo_nido),porcentaje_piso:pct(r.huevo_piso),porcentaje_pequeno:pct(r.huevo_pequeno),porcentaje_sucio:pct(r.huevo_sucio),
        porcentaje_quebrado:pct(r.huevo_quebrado),porcentaje_palido:pct(r.huevo_palido),porcentaje_sangre:pct(r.huevo_sangre) };
    });
    res.json({ filtros:{fechaInicio,fechaFin,lotes}, puedeExportarExcel:esAdministrador, registros:data });
  } catch (error) { next(error); }
}

module.exports = { produccion, dashboard, inventoryAlerts };
