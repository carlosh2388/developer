import { useEffect, useMemo, useState } from "react";

const text = (value) => value == null ? "" : String(value);
const statusLabels = { ACTIVE: "Activo", INACTIVE: "Inactivo", POSTED: "Registrado", VOID: "Anulado", DRAFT: "Borrador" };
const displayText = (column, row) => column.key === "status"
  ? (statusLabels[row[column.key]] || text(row[column.key]))
  : text(row[column.key]);

export default function ConfigRecordsTable({ title, rows, columns, loading, error, dateField, onEdit, onDeactivate, deactivateLabel = "Dar de baja", inactiveStatuses = ["INACTIVE"], nonEditableStatuses = [], buttonStyle }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filters, setFilters] = useState({});
  const availableStatuses = useMemo(() => [...new Set(rows.map((row) => row.status).filter(Boolean))], [rows]);
  const filtered = useMemo(() => rows.filter((row) => {
    const query = search.trim().toLowerCase();
    if (query && !columns.some((column) => displayText(column, row).toLowerCase().includes(query))) return false;
    if (status && row.status !== status) return false;
    const date = dateField ? text(row[dateField]).slice(0, 10) : "";
    if (from && date && date < from) return false;
    if (to && date && date > to) return false;
    return columns.every((column) => !filters[column.key] || displayText(column, row).toLowerCase().includes(filters[column.key].toLowerCase()));
  }), [rows, columns, search, status, from, to, filters, dateField]);
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", close); };
  }, [open]);
  const control = { padding: 8, border: "1px solid #ccd5d0", borderRadius: 5, minWidth: 150 };
  return <>
    <button type="button" onClick={() => setOpen(true)} style={{ position: "absolute", top: 20, right: 20, padding: "9px 16px", border: 0, borderRadius: 6, background: "#1976d2", color: "white", cursor: "pointer", fontWeight: 600, ...buttonStyle }}>Buscar registros</button>
    {open && <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <section className="records-dialog" role="dialog" aria-modal="true" aria-label={title} onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }} style={{ position: "relative", width: "min(1400px, 96vw)", maxHeight: "90vh", overflow: "auto", background: "#fff", borderRadius: 12, padding: 22, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 15, paddingRight: 48 }}><h3>{title} ({filtered.length} de {rows.length})</h3></div>
    <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar ventana" title="Cerrar" style={{ position: "absolute", top: 8, right: 10, width: 48, height: 48, border: 0, background: "transparent", cursor: "pointer", padding: 0 }}>
      <span aria-hidden="true" style={{ position: "absolute", left: 8, top: 21, width: 34, height: 5, borderRadius: 4, background: "#e31b23", transform: "rotate(45deg)" }}/>
      <span aria-hidden="true" style={{ position: "absolute", left: 8, top: 21, width: 34, height: 5, borderRadius: 4, background: "#e31b23", transform: "rotate(-45deg)" }}/>
    </button>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar en todos los campos" style={{ ...control, flex: 1 }}/>
      <select value={status} onChange={(e) => setStatus(e.target.value)} style={control}><option value="">Todos los estados</option>{availableStatuses.map((value) => <option key={value} value={value}>{statusLabels[value] || value}</option>)}</select>
      {dateField && <><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} title="Fecha desde" style={control}/><input type="date" value={to} onChange={(e) => setTo(e.target.value)} title="Fecha hasta" style={control}/></>}
      <button type="button" onClick={() => { setSearch(""); setStatus(""); setFrom(""); setTo(""); setFilters({}); }}>Limpiar filtros</button>
    </div>
    {error && <p style={{ color: "#b42318" }}>{error}</p>}{loading ? <p>Cargando registros…</p> : <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{columns.map((column) => <th key={column.key} style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ccc" }}>{column.label}</th>)}{(onEdit || onDeactivate) && <th>Acciones</th>}</tr><tr>{columns.map((column) => <th key={column.key} style={{ padding: 4 }}><input value={filters[column.key] || ""} onChange={(e) => setFilters((current) => ({ ...current, [column.key]: e.target.value }))} placeholder={`Filtrar ${column.label}`} style={{ ...control, width: "100%", minWidth: 110, boxSizing: "border-box" }}/></th>)}{(onEdit || onDeactivate) && <th/>}</tr></thead>
      <tbody>{filtered.map((row) => { const inactive = inactiveStatuses.includes(row.status); const locked = nonEditableStatuses.includes(row.status); return <tr key={row.id}>{columns.map((column) => <td key={column.key} style={{ padding: 8, borderBottom: "1px solid #eee" }}>{column.render ? column.render(row[column.key], row) : displayText(column, row)}</td>)}{(onEdit || onDeactivate) && <td style={{ whiteSpace: "nowrap" }}>{onEdit && !locked && <button type="button" onClick={() => { onEdit(row); setOpen(false); }} style={{ padding: "6px 10px", border: 0, borderRadius: 5, background: "#1976d2", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Editar</button>} {onDeactivate && !inactive && <button type="button" onClick={() => onDeactivate(row)} style={{ padding: "6px 10px", border: 0, borderRadius: 5, background: "#c62828", color: "#fff", cursor: "pointer", fontWeight: 700 }}>{deactivateLabel}</button>}{locked && <span className="record-locked-status" title="El registro se conserva para auditoría y no puede modificarse">🔒 Sin acciones</span>}</td>}</tr>; })}</tbody></table>
      {!filtered.length && <p>No hay registros que coincidan con los filtros.</p>}
    </div>}
    </section></div>}
  </>;
}
