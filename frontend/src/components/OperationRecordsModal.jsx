import ConfigRecordsTable from "./ConfigRecordsTable";
import { useCatalogList } from "../hooks/useCatalogList";
import { api } from "../services/api";
import { confirmAction } from "../services/notifications";

const productNames = (value) => String(value || "").split(", ")
  .map((item) => item.replace(/^[A-Z]{2}\d+\s*-\s*/i, ""))
  .filter(Boolean)
  .join(", ");

export default function OperationRecordsModal({ title, path, annulPath, columns, dateField, rowFilter, onEdit }) {
  const list = useCatalogList(path);
  const rows = rowFilter ? list.rows.filter(rowFilter) : list.rows;
  return <ConfigRecordsTable title={title} rows={rows} loading={list.loading} error={list.error} columns={columns} dateField={dateField} onEdit={onEdit}
    deactivateLabel="Anular" inactiveStatuses={["VOID"]} nonEditableStatuses={["VOID"]} onDeactivate={annulPath ? async (row) => {
      if (!(await confirmAction("¿Deseas anular este registro? Permanecerá visible para auditoría, pero ya no podrá editarse.", { title: "Anular registro", confirmLabel: "Sí, anular" }))) return;
      try { await api(annulPath(row), { method: "PATCH" }); await list.reload(); alert("Registro anulado correctamente."); }
      catch (error) { alert(error.message); }
    } : undefined}/>
}

export const inventoryColumns = [
  { key: "document_number", label: "Documento" },
  { key: "movement_date", label: "Fecha", render: (value) => String(value || "").slice(0, 10) },
  { key: "supplier_name", label: "Proveedor", render: (value) => value || "Sin proveedor" },
  { key: "products", label: "Productos", render: (value) => productNames(value) || "Sin detalles" },
  { key: "line_count", label: "Detalles", render: (value) => value ?? 0 },
  { key: "total_quantity", label: "Cantidad total", render: (value) => Number(value || 0).toLocaleString("es-GT", { maximumFractionDigits: 0 }) },
  { key: "movement_type", label: "Movimiento", render: (value) => ({ INPUT: "Ingreso", OUTPUT: "Egreso", ADJUSTMENT_IN: "Ajuste entrada", ADJUSTMENT_OUT: "Ajuste salida" }[value] || value) },
  { key: "status", label: "Estado", render: (value) => ({ POSTED: "Registrado", VOID: "Anulado", DRAFT: "Borrador" }[value] || value) },
];
