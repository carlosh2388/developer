import { useEffect, useMemo, useState } from "react";

const text = (value) => value == null ? "" : String(value);
const normalize = (value) => text(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim();

const statusLabels = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  POSTED: "Registrado",
  VOID: "Anulado",
  DRAFT: "Borrador",
};

const displayText = (column, row, rowIndex = 0) => {
  if (column.render) return text(column.render(row[column.key], row, rowIndex));
  if (column.key === "status") return statusLabels[row[column.key]] || text(row[column.key]);
  return text(row[column.key]);
};

const loteValue = (row) => text(row.code || row.flock_code || row.flockCode || row.flock_codes || row.flockCodes || row.lote);
const loteParts = (value) => {
  const match = text(value).trim().toUpperCase().match(/^([A-Z]+)[-\s]*0*([0-9]+)/);
  return match ? { prefix: match[1], number: Number(match[2]) } : { prefix: text(value).toUpperCase(), number: -1 };
};

const compareLoteDesc = (left, right) => {
  const leftValue = loteValue(left);
  const rightValue = loteValue(right);
  if (!leftValue && !rightValue) return 0;
  if (!leftValue) return 1;
  if (!rightValue) return -1;
  const leftParts = loteParts(leftValue);
  const rightParts = loteParts(rightValue);
  if (leftParts.prefix !== rightParts.prefix) return rightParts.prefix.localeCompare(leftParts.prefix, "es", { numeric: true });
  if (leftParts.number !== rightParts.number) return rightParts.number - leftParts.number;
  return rightValue.localeCompare(leftValue, "es", { numeric: true, sensitivity: "base" });
};

const isBrownNickRow = (row) => {
  const lot = loteValue(row).trim();
  if (/^BL/i.test(lot)) return true;
  return [row.egg_colors, row.color, row.product_descriptions, row.product_name, row.productName]
    .some((value) => normalize(value).includes("rojo"));
};
const brownNickRowStyle = { background: "#fdecec", boxShadow: "inset 4px 0 0 #e57373" };

export default function ConfigRecordsTable({
  title,
  rows,
  columns,
  loading,
  error,
  dateField,
  onEdit,
  onDeactivate,
  onActivate,
  deactivateLabel = "Dar de baja",
  activateLabel = "Activar",
  inactiveStatuses = ["INACTIVE"],
  nonEditableStatuses = [],
  buttonStyle,
  sortRows = compareLoteDesc,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const availableStatuses = useMemo(() => [...new Set(rows.map((row) => row.status).filter(Boolean))], [rows]);
  const filtered = useMemo(() => [...rows].filter((row) => {
    const query = normalize(search);
    if (query && !columns.some((column) => normalize(displayText(column, row)).includes(query))) return false;
    if (status && row.status !== status) return false;
    const date = dateField ? text(row[dateField]).slice(0, 10) : "";
    if (from && date && date < from) return false;
    if (to && date && date > to) return false;
    return columns.every((column) => {
      const value = normalize(filters[column.key]);
      return !value || normalize(displayText(column, row)).includes(value);
    });
  }).sort(sortRows), [rows, columns, search, status, from, to, filters, dateField, sortRows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleRows = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);
  const pageNumbers = useMemo(() => {
    const values = new Set([1, totalPages, page - 1, page, page + 1].filter((value) => value >= 1 && value <= totalPages));
    return [...values].sort((a, b) => a - b);
  }, [page, totalPages]);

  useEffect(() => { setPage(1); }, [search, status, from, to, filters, rows]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  const control = { padding: 8, border: "1px solid #ccd5d0", borderRadius: 5, minWidth: 150 };
  const actionsVisible = onEdit || onDeactivate || onActivate;

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
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar en todos los campos" style={{ ...control, flex: 1 }}/>
          <select value={status} onChange={(event) => setStatus(event.target.value)} style={control}><option value="">Todos los estados</option>{availableStatuses.map((value) => <option key={value} value={value}>{statusLabels[value] || value}</option>)}</select>
          {dateField && <><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} title="Fecha desde" style={control}/><input type="date" value={to} onChange={(event) => setTo(event.target.value)} title="Fecha hasta" style={control}/></>}
          <button type="button" onClick={() => { setSearch(""); setStatus(""); setFrom(""); setTo(""); setFilters({}); }}>Limpiar filtros</button>
        </div>
        {error && <p style={{ color: "#b42318" }}>{error}</p>}
        {loading ? <p>Cargando registros...</p> : <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{columns.map((column) => <th key={column.key} style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ccc" }}>{column.label}</th>)}{actionsVisible && <th>Acciones</th>}</tr>
              <tr>{columns.map((column) => <th key={column.key} style={{ padding: 4 }}><input value={filters[column.key] || ""} onChange={(event) => setFilters((current) => ({ ...current, [column.key]: event.target.value }))} placeholder={`Filtrar ${column.label}`} style={{ ...control, width: "100%", minWidth: 110, boxSizing: "border-box" }}/></th>)}{actionsVisible && <th/>}</tr>
            </thead>
            <tbody>{visibleRows.map((row, rowIndex) => {
              const realIndex = (page - 1) * pageSize + rowIndex;
              const inactive = inactiveStatuses.includes(row.status);
              const locked = nonEditableStatuses.includes(row.status);
              return <tr key={row.id || realIndex} style={isBrownNickRow(row) ? brownNickRowStyle : undefined}>
                {columns.map((column) => <td key={column.key} style={{ padding: 8, borderBottom: "1px solid #eee" }}>{displayText(column, row, realIndex)}</td>)}
                {actionsVisible && <td style={{ whiteSpace: "nowrap" }}>
                  {onEdit && !locked && <button type="button" onClick={() => { onEdit(row); setOpen(false); }} style={{ padding: "6px 10px", border: 0, borderRadius: 5, background: "#1976d2", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Editar</button>}{" "}
                  {onDeactivate && !inactive && <button type="button" onClick={() => onDeactivate(row)} style={{ padding: "6px 10px", border: 0, borderRadius: 5, background: "#c62828", color: "#fff", cursor: "pointer", fontWeight: 700 }}>{deactivateLabel}</button>}
                  {onActivate && inactive && !locked && <button type="button" onClick={() => onActivate(row)} style={{ padding: "6px 10px", border: 0, borderRadius: 5, background: "#1b8f4d", color: "#fff", cursor: "pointer", fontWeight: 700 }}>{activateLabel}</button>}
                  {locked && <span className="record-locked-status" title="El registro se conserva para auditoria y no puede modificarse">Sin acciones</span>}
                </td>}
              </tr>;
            })}</tbody>
          </table>
          {!filtered.length && <p>No hay registros que coincidan con los filtros.</p>}
          {!!filtered.length && <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <span>Mostrando {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, filtered.length)} de {filtered.length}</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={() => setPage(1)} disabled={page === 1}>Primera</button>
              <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>Anterior</button>
              {pageNumbers.map((value) => <button key={value} type="button" onClick={() => setPage(value)} disabled={value === page} style={value === page ? { fontWeight: 700, background: "#1976d2", color: "#fff" } : undefined}>{value}</button>)}
              <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>Siguiente</button>
              <button type="button" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Ultima</button>
            </div>
          </div>}
        </div>}
      </section>
    </div>}
  </>;
}
