const db = require("../config/database");
const HttpError = require("../utils/httpError");

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

module.exports = { produccion };
