import ConfigRecordsTable from "./ConfigRecordsTable";
import { useCatalogList } from "../hooks/useCatalogList";
import { api } from "../services/api";

export default function OperationRecordsModal({ title, path, annulPath, columns, dateField, rowFilter, onEdit }) {
  const list = useCatalogList(path);
  const rows = rowFilter ? list.rows.filter(rowFilter) : list.rows;
  return <ConfigRecordsTable title={title} rows={rows} loading={list.loading} error={list.error} columns={columns} dateField={dateField} onEdit={onEdit}
    deactivateLabel="Anular" inactiveStatuses={["VOID"]} onDeactivate={annulPath ? async (row) => {
      if (!window.confirm("¿Deseas anular este registro? Esta acción conservará el documento para auditoría.")) return;
      try { await api(annulPath(row), { method: "PATCH" }); await list.reload(); }
      catch (error) { alert(error.message); }
    } : undefined}/>
}

export const inventoryColumns = [
  { key: "document_number", label: "Documento" },
  { key: "movement_date", label: "Fecha", render: (value) => String(value || "").slice(0, 10) },
  { key: "supplier_name", label: "Proveedor", render: (value, row) => value ? `${row.supplier_code || ""}${row.supplier_code ? " - " : ""}${value}` : "Sin proveedor" },
  { key: "products", label: "Productos", render: (value) => value || "Sin detalles" },
  { key: "line_count", label: "Detalles", render: (value) => value ?? 0 },
  { key: "total_quantity", label: "Cantidad total", render: (value) => Number(value || 0).toLocaleString("es-GT", { maximumFractionDigits: 4 }) },
  { key: "movement_type", label: "Movimiento", render: (value) => ({ INPUT: "Ingreso", OUTPUT: "Egreso", ADJUSTMENT_IN: "Ajuste entrada", ADJUSTMENT_OUT: "Ajuste salida" }[value] || value) },
  { key: "status", label: "Estado", render: (value) => ({ POSTED: "Registrado", VOID: "Anulado", DRAFT: "Borrador" }[value] || value) },
];
