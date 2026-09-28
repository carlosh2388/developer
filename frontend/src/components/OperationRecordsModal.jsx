import { useMemo } from "react";
import ConfigRecordsTable from "./ConfigRecordsTable";
import { useCatalogList } from "../hooks/useCatalogList";
import { api } from "../services/api";
import { confirmAction } from "../services/notifications";

const productNames = (value) => String(value || "").split(", ")
  .map((item) => item.replace(/^[A-Z]{2}\d+\s*-\s*/i, ""))
  .filter(Boolean)
  .join(", ");

export default function OperationRecordsModal({ title, path, annulPath, columns, dateField, rowFilter, onEdit, sortRows, buttonStyle }) {
  const list = useCatalogList(path);
  const rows = useMemo(() => rowFilter ? list.rows.filter(rowFilter) : list.rows, [list.rows, rowFilter]);
  return <ConfigRecordsTable title={title} rows={rows} loading={list.loading} error={list.error} columns={columns} dateField={dateField} onEdit={onEdit}
    deactivateLabel="Anular" inactiveStatuses={["VOID"]} nonEditableStatuses={["VOID"]} onDeactivate={annulPath ? async (row) => {
      if (!(await confirmAction("¿Deseas anular este registro? Permanecerá visible para auditoría, pero ya no podrá editarse.", { title: "Anular registro", confirmLabel: "Sí, anular" }))) return;
      try { await api(annulPath(row), { method: "PATCH" }); await list.reload(); alert("Registro anulado correctamente."); }
      catch (error) { alert(error.message); }
    } : undefined} sortRows={sortRows || compareDocumentDesc} buttonStyle={buttonStyle}/>
}

export const compareDocumentDesc = (left, right) => {
  const leftDoc = String(left.displayNumber || left.document_number || left.movement_number || left.record_number || left.shipment_number || left.id || "");
  const rightDoc = String(right.displayNumber || right.document_number || right.movement_number || right.record_number || right.shipment_number || right.id || "");
  const byDocument = rightDoc.localeCompare(leftDoc, "es", { numeric: true, sensitivity: "base" });
  if (byDocument) return byDocument;
  return String(right.created_at || right.id || "").localeCompare(String(left.created_at || left.id || ""), "es", { numeric: true, sensitivity: "base" });
};

export const compareMovementDesc = (left, right) => {
  const leftMovement = String(left.movement_number || "");
  const rightMovement = String(right.movement_number || "");
  const byMovement = rightMovement.localeCompare(leftMovement, "es", { numeric: true, sensitivity: "base" });
  if (byMovement) return byMovement;
  return String(right.created_at || right.id || "").localeCompare(String(left.created_at || left.id || ""), "es", { numeric: true, sensitivity: "base" });
};

export const inventoryColumns = [
  { key: "document_number", label: "Documento" },
  { key: "movement_date", label: "Fecha", render: (value) => String(value || "").slice(0, 10) },
  { key: "supplier_name", label: "Proveedor", render: (value) => value || "Sin proveedor" },
  { key: "products", label: "Productos", render: (value) => productNames(value) || "Sin detalles" },
  { key: "line_count", label: "Detalles", render: (value) => value ?? 0 },
  { key: "total_quantity", label: "Cantidad total", render: (value) => Number(value || 0).toLocaleString("es-GT", { maximumFractionDigits: 2 }) },
  { key: "movement_type", label: "Movimiento", render: (value) => ({ INPUT: "Ingreso", OUTPUT: "Egreso", ADJUSTMENT_IN: "Ajuste entrada", ADJUSTMENT_OUT: "Ajuste salida" }[value] || value) },
  { key: "status", label: "Estado", render: (value) => ({ POSTED: "Registrado", VOID: "Anulado", DRAFT: "Borrador" }[value] || value) },
];
