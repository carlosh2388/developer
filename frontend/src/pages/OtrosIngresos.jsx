import { useState } from "react";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";
import { loadInventoryDocument, saveInventory } from "../services/operations";
import OperationRecordsModal, { inventoryColumns } from "../components/OperationRecordsModal";
import OperationPanel from "../components/OperationPanel";

const types = [
  ["Vacunas", "VA"], ["Medicamentos", "MD"], ["Aditivos", "AD"],
  ["Insumos", "IN"], ["Materiales", "ME"], ["Alimentos", "AL"],
];

export default function OtrosIngresos() {
  const { productosPorTipo, opciones } = useOperationalCatalogs(["productos", "proveedores"]);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [proveedor, setProveedor] = useState("");
  const [filas, setFilas] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const edit = async (row) => { try { const data = await loadInventoryDocument(row.id); setEditingId(row.id); setFecha(String(data.document.movement_date).slice(0, 10)); setProveedor(data.document.supplier_code || ""); setFilas(data.rows.map((item) => ({ ...item, tipo: item.tipo === "Alimento" ? "Alimentos" : item.tipo }))); } catch (error) { alert(error.message); } };

  const add = (tipo) => setFilas((current) => [...current, { id: crypto.randomUUID(), tipo, item: "", cantidad: "" }]);
  const change = (id, field, value) => setFilas((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
  const remove = (id) => setFilas((current) => current.filter((row) => row.id !== id));
  const optionsFor = (tipo) => productosPorTipo([types.find(([label]) => label === tipo)?.[1]]);

  async function save(event) {
    event.preventDefault(); setSaving(true);
    try {
      await saveInventory({ id: editingId, fecha, proveedor, rows: filas, movementType: "INPUT", module: "OTHER" });
      alert(editingId ? "Ingreso actualizado correctamente" : "Ingreso guardado correctamente"); setFilas([]); setProveedor(""); setFecha(new Date().toISOString().split("T")[0]); setEditingId(null);
    } catch (error) { alert(error.message); }
    finally { setSaving(false); }
  }

  const input = { padding: 8, border: "1px solid #ccc", borderRadius: 5, width: "100%", boxSizing: "border-box" };
  return <OperationPanel maxWidth={1000}><OperationRecordsModal title="Otros ingresos" path="/inventario/documentos" annulPath={(row) => `/inventario/documentos/${row.id}/anular`} dateField="movement_date" columns={inventoryColumns} rowFilter={(row) => row.movement_type === "INPUT" && row.module_code === "OTHER"} onEdit={edit}/><form onSubmit={save} style={{ maxWidth: 1000, margin: "0 auto", padding: 20, fontFamily: "Arial" }}>
    <h2>Otros ingresos</h2>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
      <label>Fecha<input required type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={input}/></label>
      <label>Proveedor<select value={proveedor} onChange={(e) => setProveedor(e.target.value)} style={input}>
        <option value="">Seleccione</option>{opciones("proveedores").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select></label>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "18px 0" }}>
      {types.map(([label]) => <button key={label} type="button" onClick={() => add(label)}>+ {label}</button>)}
    </div>
    {filas.map((row) => <div key={row.id} style={{ display: "grid", gridTemplateColumns: "180px 1fr 160px 44px", gap: 10, marginBottom: 10 }}>
      <input value={row.tipo} readOnly style={input}/>
      <select required value={row.item} onChange={(e) => change(row.id, "item", e.target.value)} style={input}>
        <option value="">Seleccione</option>{optionsFor(row.tipo).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <input required min="0.0001" step="0.0001" type="number" value={row.cantidad} onChange={(e) => change(row.id, "cantidad", e.target.value)} placeholder="Cantidad" style={input}/>
      <button type="button" onClick={() => remove(row.id)}>×</button>
    </div>)}
    <button disabled={saving || !filas.length}>{saving ? "Guardando…" : "Guardar"}</button>
  </form></OperationPanel>;
}
