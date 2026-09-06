import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { clientId, saveOperation } from "../services/operations";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";

const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
const warehouseClass = (warehouse) => {
  const name = normalize(`${warehouse?.code || ""} ${warehouse?.name || ""}`);
  if (name.includes("HUEVO COMERCIAL")) return "COMERCIAL";
  if (name.includes("HUEVO INCUBABLE")) return "INCUBABLE";
  return "";
};

const presentations = {
  cajasBandejas336: { label: "Caja de Bandejas 336", factor: 336, stockKey: "available_boxes_trays_336" },
  cajasCartones360: { label: "Caja de Cartones 360", factor: 360, stockKey: "available_boxes_cartons_360" },
  bandejas84: { label: "Bandeja 84", factor: 84, stockKey: "available_trays_84" },
  cartones30: { label: "Cartón 30", factor: 30, stockKey: "available_cartons_30" },
  unidades: { label: "Unidades", factor: 1, stockKey: "available_loose_units" },
};

const commercialPresentation = (code) => {
  if (code === "COM_XL_M_NEST") return ["cajasCartones360"];
  if (code === "COM_SMALL_NEST") return ["cartones30"];
  return ["unidades"];
};

const emptyRow = () => ({ id: clientId(), grade: "", presentation: "", quantity: "", reason: "", stock: 0 });

export default function EggAdjustmentForm({ date, movementType, onSaved }) {
  const { bodegas, localidades, opciones } = useOperationalCatalogs(["bodegas", "localidades", "lotes"]);
  const [classification, setClassification] = useState("");
  const [location, setLocation] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [flock, setFlock] = useState("");
  const [grades, setGrades] = useState([]);
  const [stock, setStock] = useState({});
  const [rows, setRows] = useState([emptyRow()]);

  useEffect(() => { api("/huevos/clasificaciones").then(setGrades).catch((e) => alert(e.message)); }, []);

  const locations = localidades.filter((item) => item.status !== "INACTIVE");
  const warehouses = bodegas.filter((item) => item.status !== "INACTIVE"
    && String(item.locationId) === String(location) && warehouseClass(item));
  const selectedWarehouse = bodegas.find((item) => String(item.code) === String(warehouse) || String(item.id) === String(warehouse));
  const effectiveClass = warehouseClass(selectedWarehouse) || classification;
  const classGrades = grades.filter((item) => item.egg_class === effectiveClass);

  useEffect(() => {
    if (!warehouse || !effectiveClass || (effectiveClass === "INCUBABLE" && !flock)) { setStock({}); return; }
    const query = new URLSearchParams({ clasificacion: effectiveClass, bodega: warehouse });
    if (effectiveClass === "INCUBABLE") query.set("lote", flock);
    api(`/huevos/existencias?${query}`).then((items) => setStock(Object.fromEntries(
      items.map((item) => [item.grade_code, item]))))
      .catch((e) => alert(e.message));
  }, [warehouse, effectiveClass, flock]);

  useEffect(() => {
    setRows([emptyRow()]); setStock({});
    if (effectiveClass === "COMERCIAL") setFlock("");
  }, [effectiveClass, warehouse]);

  const updateRow = (id, field, value) => setRows((current) => current.map((row) => {
    if (row.id !== id) return row;
    const next = { ...row, [field]: value };
    if (field === "grade") {
      const allowed = effectiveClass === "COMERCIAL" ? commercialPresentation(value) : Object.keys(presentations);
      next.presentation = allowed.length === 1 ? allowed[0] : "";
      next.stock = Number(stock[value]?.available_units || 0);
    }
    return next;
  }));

  const totalUnits = (row) => Number(row.quantity || 0) * (presentations[row.presentation]?.factor || 0);
  const save = async (event) => {
    event.preventDefault();
    if (!location || !warehouse || !effectiveClass) return alert("Selecciona clasificación, localidad y bodega.");
    if (effectiveClass === "INCUBABLE" && !flock) return alert("Selecciona el lote para huevo incubable.");
    if (rows.some((row) => !row.grade || !row.presentation || !/^\d+$/.test(row.quantity) || Number(row.quantity) <= 0 || !row.reason.trim())) {
      return alert("Completa tamaño, presentación, cantidad entera positiva y razón o justificación.");
    }
    if (movementType === "ADJUSTMENT_OUT" && rows.some((row) => totalUnits(row) > Number(stock[row.grade]?.available_units || 0))) {
      return alert("Una cantidad supera la existencia disponible.");
    }
    try {
      await saveOperation("/huevos/movimientos", {
        tipoMovimiento: movementType, fecha, localidad: location,
        bodegaOrigen: movementType === "ADJUSTMENT_OUT" ? warehouse : undefined,
        bodegaDestino: movementType === "ADJUSTMENT_IN" ? warehouse : undefined,
        observaciones: rows.map((row) => row.reason.trim()).filter(Boolean).join(" · "),
        detalles: rows.map((row) => ({
          lote: effectiveClass === "INCUBABLE" ? flock : undefined,
          clasificacion: row.grade, existencia: Number(stock[row.grade]?.available_units || 0),
          cajasBandejas336: row.presentation === "cajasBandejas336" ? Number(row.quantity) : 0,
          cajasCartones360: row.presentation === "cajasCartones360" ? Number(row.quantity) : 0,
          bandejas84: row.presentation === "bandejas84" ? Number(row.quantity) : 0,
          cartones30: row.presentation === "cartones30" ? Number(row.quantity) : 0,
          unidades: row.presentation === "unidades" ? Number(row.quantity) : 0,
          razon: row.reason,
        })),
      });
      alert("Ajuste de huevo registrado correctamente");
      setRows([emptyRow()]); setWarehouse(""); setLocation(""); setClassification(""); setFlock("");
      onSaved?.();
    } catch (error) { alert(error.message); }
  };

  const inputStyle = useMemo(() => ({ width: "100%", padding: "7px", border: "1px solid #ccc", borderRadius: "4px" }), []);
  return <form onSubmit={save}>
    <p style={{ padding: "10px", background: "#fff3cd", borderRadius: "5px" }}>
      Este tipo de ajustes es especial y diferente a los demás tipos, no se puede combinar
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(150px, 1fr))", gap: "10px", marginBottom: "16px" }}>
      <label>Clasificación<select style={inputStyle} value={classification} onChange={(e) => { setClassification(e.target.value); setWarehouse(""); }}>
        <option value="">Seleccione</option><option value="INCUBABLE">Incubable</option><option value="COMERCIAL">Comercial</option>
      </select></label>
      <label>Localidad<select style={inputStyle} value={location} onChange={(e) => { setLocation(e.target.value); setWarehouse(""); }}>
        <option value="">Seleccione</option>{locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></label>
      <label>Bodega<select style={inputStyle} value={warehouse} disabled={!location || !classification} onChange={(e) => setWarehouse(e.target.value)}>
        <option value="">Seleccione</option>{warehouses.filter((item) => warehouseClass(item) === classification).map((item) => <option key={item.id} value={item.code}>{item.name}</option>)}
      </select></label>
      {effectiveClass === "INCUBABLE" && <label># Lote<select style={inputStyle} value={flock} onChange={(e) => setFlock(e.target.value)}>
        <option value="">Seleccione</option>{opciones("lotes").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select></label>}
    </div>
    <table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr style={{ background: "#f1f5f9" }}>
      <th>Tamaño</th><th>Presentación</th><th>Existencia</th><th>Cantidad</th><th>Razón o Justificación</th><th>Acción</th>
    </tr></thead><tbody>{rows.map((row) => {
      const allowed = effectiveClass === "COMERCIAL" ? commercialPresentation(row.grade) : Object.keys(presentations);
      return <tr key={row.id}>
        <td><select style={inputStyle} value={row.grade} onChange={(e) => updateRow(row.id, "grade", e.target.value)}><option value="">Seleccione</option>{classGrades.map((item) => <option key={item.id} value={item.code}>{item.label}</option>)}</select></td>
        <td><select style={inputStyle} value={row.presentation} disabled={!row.grade} onChange={(e) => updateRow(row.id, "presentation", e.target.value)}><option value="">Seleccione</option>{allowed.map((key) => <option key={key} value={key}>{presentations[key].label} (Existencia: {Number(stock[row.grade]?.[presentations[key].stockKey] || 0)})</option>)}</select></td>
        <td style={{ textAlign: "center" }}>{Number(stock[row.grade]?.available_units || 0)}</td>
        <td><input style={inputStyle} type="number" min="1" step="1" value={row.quantity} onChange={(e) => /^\d*$/.test(e.target.value) && updateRow(row.id, "quantity", e.target.value)}/></td>
        <td><input style={inputStyle} type="text" value={row.reason} onChange={(e) => updateRow(row.id, "reason", e.target.value)}/></td>
        <td><button type="button" onClick={() => setRows((current) => current.length === 1 ? current : current.filter((item) => item.id !== row.id))}>X</button></td>
      </tr>;
    })}</tbody></table>
    <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}><button type="submit" style={{ flex: 1, padding: "10px", background: "#1976d2", color: "white", border: 0, borderRadius: "5px" }}>Guardar</button>
      <button type="button" onClick={() => setRows((current) => [...current, emptyRow()])} style={{ padding: "10px 24px", background: "#198754", color: "white", border: 0, borderRadius: "5px" }}>+ Nuevo</button></div>
  </form>;
}
