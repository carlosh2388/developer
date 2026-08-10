import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const columns = [
  ["lote", "LOTE"], ["fecha", "FECHA"], ["edad_semana", "EDAD SEM."],
  ["inventario_hembras", "HEMBRAS SALDO"], ["mortalidad_hembras", "HEMBRAS MORT."],
  ["inventario_machos", "MACHOS SALDO"], ["mortalidad_machos", "MACHOS MORT."],
  ["alimento_gramos_ave", "ALIMENTO GR./AVE"], ["huevo_incubable", "# HUEVO INCUBABLE"],
  ["huevo_comercial", "# HUEVO COMERCIAL"], ["porcentaje_postura", "% POSTURA"],
  ["porcentaje_incubable", "% HUEVO INCUBABLE"], ["porcentaje_comercial", "% HUEVO COMERCIAL"],
  ["porcentaje_nido", "% HUEVO NIDO"], ["porcentaje_piso", "% HUEVO PISO"],
  ["porcentaje_pequeno", "% HUEVO PEQUEÑO"], ["porcentaje_sucio", "% HUEVO SUCIO"],
  ["porcentaje_quebrado", "% HUEVO QUEBRADO"], ["porcentaje_palido", "% HUEVO PÁLIDO"],
  ["porcentaje_sangre", "% HUEVO CON SANGRE"],
];
const today = new Date().toISOString().slice(0, 10);
const firstDay = `${today.slice(0, 8)}01`;
const logoUrl = new URL("/igag-logo.jpeg", window.location.origin).href;
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const display = (key, value) => key === "fecha" ? String(value || "").slice(0, 10) : key.startsWith("porcentaje_") ? `${Number(value || 0).toFixed(2)}%` : value;

function reportHtml(rows, filters, printable = false) {
  const headings = columns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join("");
  const body = rows.map((row) => `<tr>${columns.map(([key]) => `<td>${escapeHtml(display(key, row[key]))}</td>`).join("")}</tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Reporte de producción</title><style>
    body{font:10px Arial;color:#111}.report-logo{display:block;width:330px;max-height:115px;object-fit:contain;margin:0 auto 8px}
    h1,h2,p{text-align:center;margin:4px}table{border-collapse:collapse;width:100%;margin-top:14px}
    th,td{border:1px solid #333;padding:4px;text-align:center}th{background:#d9ead3;font-weight:bold}
    ${printable ? "@page{size:A3 landscape;margin:8mm}" : ""}</style></head><body>
    <img class="report-logo" src="${escapeHtml(logoUrl)}" alt="IGAG">
    <h1>INDUSTRIA GENÉTICA AVÍCOLA DE GUATEMALA, S.A.</h1><h2>REPORTE DE PRODUCCIÓN - GRANJA</h2>
    <p>Del ${escapeHtml(filters.fechaInicio)} al ${escapeHtml(filters.fechaFin)} · Lotes: ${escapeHtml(filters.lotes.length ? filters.lotes.join(", ") : "Todos")}</p>
    <table><thead><tr>${headings}</tr></thead><tbody>${body}</tbody></table></body></html>`;
}

export default function Reportes({ user }) {
  const [lotes, setLotes] = useState([]);
  const [seleccion, setSeleccion] = useState([]);
  const [fechaInicio, setFechaInicio] = useState(firstDay);
  const [fechaFin, setFechaFin] = useState(today);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = user?.role === "ADMINISTRATOR";

  useEffect(() => { api("/lotes").then(setLotes).catch((e) => setError(e.message)); }, []);
  const query = useMemo(() => new URLSearchParams({ fechaInicio, fechaFin, ...(seleccion.length ? { lotes: seleccion.join(",") } : {}) }).toString(), [fechaInicio, fechaFin, seleccion]);

  async function generar() {
    try { setLoading(true); setError(""); setRows((await api(`/reportes/produccion?${query}`)).registros); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  async function excel() {
    try {
      await api(`/reportes/produccion?${query}&formato=excel`);
      const blob = new Blob(["\ufeff", reportHtml(rows, { fechaInicio, fechaFin, lotes: seleccion })], { type: "application/vnd.ms-excel;charset=utf-8" });
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `reporte-produccion-${fechaInicio}-${fechaFin}.xls`; link.click(); URL.revokeObjectURL(link.href);
    } catch (e) { setError(e.message); }
  }
  function pdf() {
    const popup = window.open("", "_blank");
    if (!popup) return setError("Permite las ventanas emergentes para generar el PDF.");
    popup.document.write(reportHtml(rows, { fechaInicio, fechaFin, lotes: seleccion }, true));
    popup.document.close(); popup.focus(); setTimeout(() => popup.print(), 500);
  }

  return <div className="page-shell"><section className="report-panel">
    <div className="report-screen-header"><img src="/igag-logo.jpeg" alt="Industria Genética Avícola de Guatemala"/><div><p className="eyebrow">REPORTES</p><h1>Producción por granja</h1><p>Producción, inventario, mortalidad y clasificación de huevos.</p></div></div>
    <div className="report-filters"><label>Fecha inicio<input type="date" value={fechaInicio} max={fechaFin} onChange={(e) => setFechaInicio(e.target.value)}/></label><label>Fecha fin<input type="date" value={fechaFin} min={fechaInicio} onChange={(e) => setFechaFin(e.target.value)}/></label><label>Lotes (Ctrl para seleccionar varios)<select multiple value={seleccion} onChange={(e) => setSeleccion([...e.target.selectedOptions].map((option) => option.value))}>{lotes.map((lote) => <option key={lote.id} value={lote.code}>{lote.code}</option>)}</select></label><button className="primary-button" onClick={generar} disabled={loading}>{loading ? "Generando…" : "Generar reporte"}</button></div>
    {error && <div className="alert alert-error">{error}</div>}
    <div className="report-actions"><button onClick={pdf} disabled={!rows.length}>Generar PDF</button>{isAdmin && <button onClick={excel} disabled={!rows.length}>Exportar Excel</button>}<span>{rows.length} registro(s)</span></div>
    <div className="report-table-wrap"><table className="report-table"><thead><tr>{columns.map(([key, label]) => <th key={key}>{label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.lote}-${row.fecha}-${index}`}>{columns.map(([key]) => <td key={key}>{display(key, row[key])}</td>)}</tr>)}{!rows.length && <tr><td colSpan={columns.length}>Selecciona los filtros y genera el reporte.</td></tr>}</tbody></table></div>
  </section></div>;
}
