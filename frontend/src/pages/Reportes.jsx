import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const productionColumns = [
  ["lote", "LOTE"], ["fecha", "FECHA"], ["edad_semana", "EDAD SEM."],
  ["inventario_hembras", "HEMBRAS SALDO"], ["mortalidad_hembras", "HEMBRAS MORT."],
  ["inventario_machos", "MACHOS SALDO"], ["mortalidad_machos", "MACHOS MORT."],
  ["alimento_gramos_ave", "ALIMENTO GR./AVE"], ["huevo_incubable", "# HUEVO INCUBABLE"],
  ["huevo_comercial", "# HUEVO COMERCIAL"], ["porcentaje_postura", "% POSTURA"],
  ["porcentaje_incubable", "% HUEVO INCUBABLE"], ["porcentaje_comercial", "% HUEVO COMERCIAL"],
  ["porcentaje_nido", "% HUEVO NIDO"], ["porcentaje_piso", "% HUEVO PISO"],
  ["porcentaje_pequeno", "% HUEVO PEQUENO"], ["porcentaje_sucio", "% HUEVO SUCIO"],
  ["porcentaje_quebrado", "% HUEVO QUEBRADO"], ["porcentaje_palido", "% HUEVO PALIDO"],
  ["porcentaje_sangre", "% HUEVO CON SANGRE"],
];

const productTypeLabels = {
  AD: "Aditivos", AL: "Alimentos", HC: "Huevos comerciales", HI: "Huevos incubables",
  IN: "Insumos", ME: "Material de empaque", MD: "Medicamentos", VA: "Vacunas",
};
const movementLabels = { INPUT: "Entrada", OUTPUT: "Salida", ADJUSTMENT_IN: "Ajuste entrada", ADJUSTMENT_OUT: "Ajuste salida" };
const kardexColumns = [
  ["fecha", "FECHA"], ["documento", "DOCUMENTO"], ["tipo_producto", "PRODUCTO"], ["product_code", "CODIGO"],
  ["product_name", "DETALLE"], ["unit_code", "UNIDAD"], ["tipo_movimiento", "MOVIMIENTO"],
  ["entrada", "ENTRADA"], ["salida", "SALIDA"], ["saldo", "SALDO"], ["costo_unitario", "COSTO UNIT."], ["justificacion", "JUSTIFICACION"],
];

const today = new Date().toISOString().slice(0, 10);
const firstDay = `${today.slice(0, 8)}01`;
const logoUrl = new URL("/igag-logo.jpeg", window.location.origin).href;
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const displayProduction = (key, value) => key === "fecha" ? String(value || "").slice(0, 10) : key.startsWith("porcentaje_") ? `${Number(value || 0).toFixed(2)}%` : value;
const displayKardex = (key, value) => {
  if (key === "fecha") return String(value || "").slice(0, 10);
  if (key === "tipo_movimiento") return movementLabels[value] || value;
  if (["entrada", "salida", "saldo", "costo_unitario"].includes(key)) return Number(value || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value || "";
};

function tableHtml({ title, subtitle, rows, columns, display, printable = false }) {
  const headings = columns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join("");
  const body = rows.map((row) => `<tr>${columns.map(([key]) => `<td>${escapeHtml(display(key, row[key]))}</td>`).join("")}</tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    body{font:10px Arial;color:#111}.report-logo{display:block;width:330px;max-height:115px;object-fit:contain;margin:0 auto 8px}
    h1,h2,p{text-align:center;margin:4px}table{border-collapse:collapse;width:100%;margin-top:14px}
    th,td{border:1px solid #333;padding:4px;text-align:center}th{background:#d9ead3;font-weight:bold}
    ${printable ? "@page{size:A3 landscape;margin:8mm}" : ""}</style></head><body>
    <img class="report-logo" src="${escapeHtml(logoUrl)}" alt="IGAG">
    <h1>INDUSTRIA GENETICA AVICOLA DE GUATEMALA, S.A.</h1><h2>${escapeHtml(title)}</h2>
    <p>${escapeHtml(subtitle)}</p><table><thead><tr>${headings}</tr></thead><tbody>${body}</tbody></table></body></html>`;
}

export default function Reportes({ user }) {
  const [tab, setTab] = useState("produccion");
  const [lotes, setLotes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [seleccion, setSeleccion] = useState([]);
  const [tipoProducto, setTipoProducto] = useState("");
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [fechaInicio, setFechaInicio] = useState(firstDay);
  const [fechaFin, setFechaFin] = useState(today);
  const [productionRows, setProductionRows] = useState([]);
  const [kardexRows, setKardexRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = user?.role === "ADMINISTRATOR";

  useEffect(() => {
    Promise.all([api("/lotes"), api("/productos")])
      .then(([flocks, products]) => { setLotes(flocks); setProductos(products); })
      .catch((e) => setError(e.message));
  }, []);

  const productionQuery = useMemo(() => new URLSearchParams({
    fechaInicio, fechaFin, ...(seleccion.length ? { lotes: seleccion.join(",") } : {}),
  }).toString(), [fechaInicio, fechaFin, seleccion]);
  const productTypes = useMemo(() => [...new Set(productos.filter((item) => item.status !== "INACTIVE").map((item) => item.productType).filter(Boolean))]
    .map((code) => ({ code, label: productTypeLabels[code] || code })).sort((a, b) => a.label.localeCompare(b.label, "es")), [productos]);
  const productOptions = useMemo(() => productos
    .filter((item) => item.status !== "INACTIVE" && (!tipoProducto || item.productType === tipoProducto))
    .sort((a, b) => String(a.name || a.code).localeCompare(String(b.name || b.code), "es", { sensitivity: "base", numeric: true })), [productos, tipoProducto]);
  const kardexQuery = useMemo(() => new URLSearchParams({
    fechaInicio, fechaFin,
    ...(tipoProducto ? { tipo: tipoProducto } : {}),
    ...(productosSeleccionados.length ? { productos: productosSeleccionados.join(",") } : {}),
  }).toString(), [fechaInicio, fechaFin, tipoProducto, productosSeleccionados]);
  const typeLabel = productTypes.find((item) => item.code === tipoProducto)?.label || "Todos";

  async function generarProduccion() {
    try { setLoading(true); setError(""); setProductionRows((await api(`/reportes/produccion?${productionQuery}`)).registros); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  async function generarKardex() {
    try { setLoading(true); setError(""); setKardexRows((await api(`/reportes/kardex-productos?${kardexQuery}`)).registros); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  function exportDocument({ rows, title, subtitle, columns, display, filename, printable = false }) {
    if (printable) {
      const popup = window.open("", "_blank");
      if (!popup) return setError("Permite las ventanas emergentes para generar el PDF.");
      popup.document.write(tableHtml({ title, subtitle, rows, columns, display, printable: true }));
      popup.document.close(); popup.focus(); setTimeout(() => popup.print(), 500);
      return;
    }
    const blob = new Blob(["\ufeff", tableHtml({ title, subtitle, rows, columns, display })], { type: "application/vnd.ms-excel;charset=utf-8" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = filename; link.click(); URL.revokeObjectURL(link.href);
  }

  const productionSubtitle = `Del ${fechaInicio} al ${fechaFin} - Lotes: ${seleccion.length ? seleccion.join(", ") : "Todos"}`;
  const kardexSubtitle = `Del ${fechaInicio} al ${fechaFin} - Productos: ${typeLabel} - Detalle: ${productosSeleccionados.length ? productosSeleccionados.join(", ") : "Todos"}`;

  return <div className="page-shell"><section className="report-panel">
    <div className="report-screen-header"><img src="/igag-logo.jpeg" alt="Industria Genetica Avicola de Guatemala"/><div><p className="eyebrow">REPORTES</p><h1>{tab === "produccion" ? "Produccion por granja" : "Kardex de Productos"}</h1><p>{tab === "produccion" ? "Produccion, inventario, mortalidad y clasificacion de huevos." : "Movimientos, entradas, salidas y saldos por producto."}</p></div></div>
    <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
      <button type="button" className="primary-button" style={{ opacity: tab === "produccion" ? 1 : 0.65 }} onClick={() => setTab("produccion")}>Produccion por granja</button>
      <button type="button" className="primary-button" style={{ opacity: tab === "kardex" ? 1 : 0.65 }} onClick={() => setTab("kardex")}>Kardex de Productos</button>
    </div>

    {tab === "produccion" ? <>
      <div className="report-filters"><label>Fecha inicio<input type="date" value={fechaInicio} max={fechaFin} onChange={(e) => setFechaInicio(e.target.value)}/></label><label>Fecha fin<input type="date" value={fechaFin} min={fechaInicio} onChange={(e) => setFechaFin(e.target.value)}/></label><label>Lotes (Ctrl para seleccionar varios)<select multiple value={seleccion} onChange={(e) => setSeleccion([...e.target.selectedOptions].map((option) => option.value))}>{lotes.map((lote) => <option key={lote.id} value={lote.code}>{lote.code}</option>)}</select></label><button className="primary-button" onClick={generarProduccion} disabled={loading}>{loading ? "Generando..." : "Generar reporte"}</button></div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="report-actions"><button onClick={() => exportDocument({ rows: productionRows, title: "REPORTE DE PRODUCCION - GRANJA", subtitle: productionSubtitle, columns: productionColumns, display: displayProduction, printable: true })} disabled={!productionRows.length}>Generar PDF</button>{isAdmin && <button onClick={() => exportDocument({ rows: productionRows, title: "REPORTE DE PRODUCCION - GRANJA", subtitle: productionSubtitle, columns: productionColumns, display: displayProduction, filename: `reporte-produccion-${fechaInicio}-${fechaFin}.xls` })} disabled={!productionRows.length}>Exportar Excel</button>}<span>{productionRows.length} registro(s)</span></div>
      <div className="report-table-wrap"><table className="report-table"><thead><tr>{productionColumns.map(([key, label]) => <th key={key}>{label}</th>)}</tr></thead><tbody>{productionRows.map((row, index) => <tr key={`${row.lote}-${row.fecha}-${index}`}>{productionColumns.map(([key]) => <td key={key}>{displayProduction(key, row[key])}</td>)}</tr>)}{!productionRows.length && <tr><td colSpan={productionColumns.length}>Selecciona los filtros y genera el reporte.</td></tr>}</tbody></table></div>
    </> : <>
      <div className="report-filters"><label>Fecha inicio<input type="date" value={fechaInicio} max={fechaFin} onChange={(e) => setFechaInicio(e.target.value)}/></label><label>Fecha fin<input type="date" value={fechaFin} min={fechaInicio} onChange={(e) => setFechaFin(e.target.value)}/></label><label>Productos<select value={tipoProducto} onChange={(e) => { setTipoProducto(e.target.value); setProductosSeleccionados([]); }}><option value="">Todos</option>{productTypes.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label><label>Detalle (Ctrl para seleccionar varios)<select multiple value={productosSeleccionados} onChange={(e) => setProductosSeleccionados([...e.target.selectedOptions].map((option) => option.value))}>{productOptions.map((item) => <option key={item.id} value={item.code}>{item.code} - {item.name}{item.unitLabel || item.unitCode ? ` (${item.unitLabel || item.unitCode})` : ""}</option>)}</select></label><button className="primary-button" onClick={generarKardex} disabled={loading}>{loading ? "Generando..." : "Generar reporte"}</button></div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="report-actions"><button onClick={() => exportDocument({ rows: kardexRows, title: "REPORTE DE KARDEX DE PRODUCTOS", subtitle: kardexSubtitle, columns: kardexColumns, display: displayKardex, printable: true })} disabled={!kardexRows.length}>Generar PDF</button>{isAdmin && <button onClick={() => exportDocument({ rows: kardexRows, title: "REPORTE DE KARDEX DE PRODUCTOS", subtitle: kardexSubtitle, columns: kardexColumns, display: displayKardex, filename: `kardex-productos-${fechaInicio}-${fechaFin}.xls` })} disabled={!kardexRows.length}>Exportar Excel</button>}<span>{kardexRows.length} registro(s)</span></div>
      <div className="report-table-wrap"><table className="report-table"><thead><tr>{kardexColumns.map(([key, label]) => <th key={key}>{label}</th>)}</tr></thead><tbody>{kardexRows.map((row, index) => <tr key={`${row.product_code}-${row.fecha}-${row.documento}-${index}`}>{kardexColumns.map(([key]) => <td key={key}>{displayKardex(key, row[key])}</td>)}</tr>)}{!kardexRows.length && <tr><td colSpan={kardexColumns.length}>Selecciona los filtros y genera el reporte.</td></tr>}</tbody></table></div>
    </>}
  </section></div>;
}
