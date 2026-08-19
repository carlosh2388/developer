import { api } from "./api";

const roleByType = {
  Alimento: "BASE_FOOD", Alimentos: "BASE_FOOD", Material: "MATERIAL", Materiales: "MATERIAL",
  Aditivo: "ADDITIVE", Aditivos: "ADDITIVE", Medicamento: "MEDICINE", Medicamentos: "MEDICINE",
  Vacuna: "VACCINE", Vacunas: "VACCINE", Insumo: "PRIMARY", Insumos: "PRIMARY",
};

const integerText = (value) => String(Math.round(Number(value || 0)));
const quantityText = (value) => String(Number(value || 0));
const decimalQuantityUnits = new Set(["GRAM", "GRAMO", "G", "KILOGRAM", "KILOGRAMO", "KG", "POUND", "LIBRA", "LB", "QUINTAL", "Q", "LITER", "LITRO", "L", "UM02", "UM03", "UM04", "UM05", "UM10"]);
export const allowsDecimalQuantity = (unitCode, unitLabel = "") => [unitCode, unitLabel]
  .some((value) => decimalQuantityUnits.has(String(value || "").trim().toUpperCase()));
export const quantityInput = (unitCode, unitLabel = "") => allowsDecimalQuantity(unitCode, unitLabel) ? { min: "0.01", step: "0.01" } : { min: "1", step: "1" };
export const quantityInputFor = (options, value) => {
  const selected = (options || []).find((item) => item.value === value);
  return quantityInput(selected?.unitCode, selected?.unitLabel);
};
const priceText = (value) => Number(value || 0).toFixed(2);
export const clientId = () => globalThis.crypto?.randomUUID?.()
  || `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export function inventoryDetails(rows, { allocate = false } = {}) {
  const details = [];
  rows.forEach((row) => {
    const product = row.item || row.alimento || row.material || row.vacuna || row.aditivo || row.medicamento;
    if (!product) return;
    const parentIndex = details.length;
    details.push({
      producto: product, rol: roleByType[row.tipo] || "PRIMARY", cantidad: Number(row.cantidad),
      costoUnitario: row.precio === undefined || row.precio === "" ? 0 : Number(
        (row.modoPrecio === "TOTAL" ? Number(row.precio) / Number(row.cantidad) : Number(row.precio)).toFixed(2)
      ),
      justificacion: row.justificacion || undefined,
      distribuciones: allocate ? (row.galeras || []).filter((x) => x.galera && Number(x.cantidad) > 0).map((x) => ({ galera: x.galera, cantidad: Number(x.cantidad) })) : undefined,
    });
    if (row.tipo === "Alimento") {
      (row.aditivos || []).filter((item) => item.producto).forEach((item) => details.push({ producto: item.producto, rol: "ADDITIVE", cantidad: Number(item.cantidad), detallePadreIndice: parentIndex }));
      (row.medicamentos || []).filter((item) => item.producto).forEach((item) => details.push({ producto: item.producto, rol: "MEDICINE", cantidad: Number(item.cantidad), detallePadreIndice: parentIndex }));
    }
  });
  return details;
}

export async function saveInventory({ id, fecha, proveedor, rows, movementType, module, allocate = false }) {
  return api(id ? `/inventario/documentos/${id}` : "/inventario/documentos", { method: id ? "PUT" : "POST", body: JSON.stringify({
    tipoMovimiento: movementType, modulo: module, fecha, proveedor: proveedor || undefined,
    detalles: inventoryDetails(rows, { allocate }),
  }) });
}

const eggGradeCodes = {
  "Grande (Nido)": "INC_LARGE_NEST", "Mediano (Nido)": "INC_MEDIUM_NEST", "Pequeño (Nido)": "INC_SMALL_NEST",
  "PequeÃ±o (Nido)": "INC_SMALL_NEST", "Otros* (Nido)": "INC_OTHER_NEST", "Otros* (Piso)": "INC_OTHER_FLOOR",
  "Extra-Grande-Mediano (Nido)": "COM_XL_M_NEST", "Pewee (Nido)": "COM_PEEWEE_NEST", "Sucio (Nido)": "COM_DIRTY_NEST",
  "Quebrado (Nido)": "COM_BROKEN_NEST", "Pálido Rojo (Nido)": "COM_PALE_RED_NEST", "PÃ¡lido Rojo (Nido)": "COM_PALE_RED_NEST",
  "Con Sangre (Nido)": "COM_BLOOD_NEST", "Sucio (Piso)": "COM_DIRTY_FLOOR", "Quebrado (Piso)": "COM_BROKEN_FLOOR",
  "Bueno (Piso)": "COM_GOOD_FLOOR",
};

export function eggGradeCode(label, type = "") {
  if (eggGradeCodes[label]) {
    if ((label === "Pequeño (Nido)" || label === "PequeÃ±o (Nido)") && type === "Comercial") return "COM_SMALL_NEST";
    return eggGradeCodes[label];
  }
  return label;
}

const labelByEggGrade = Object.fromEntries(Object.entries(eggGradeCodes).map(([label, code]) => [code, label]));
labelByEggGrade.COM_SMALL_NEST = "Pequeño (Nido)";
export function eggGradeLabel(code) { return labelByEggGrade[code] || code; }

export function eggPackageDetail(row = {}) {
  return {
    cajasBandejas336: Number(row.cajaB336 ?? row.cajaBandejas336 ?? 0),
    cajasCartones360: Number(row.cajaC360 ?? row.cajaCartones360 ?? 0),
    bandejas84: Number(row.bandeja84 ?? 0), cartones30: Number(row.carton30 ?? 0), unidades: Number(row.unidades ?? 0),
  };
}

export async function post(path, body) {
  return api(path, { method: "POST", body: JSON.stringify(body) });
}

export async function saveOperation(path, body, id) {
  return api(id ? `${path}/${id}` : path, { method: id ? "PUT" : "POST", body: JSON.stringify(body) });
}

const typeByRole = { BASE_FOOD: "Alimento", MATERIAL: "Materiales", ADDITIVE: "Aditivos", MEDICINE: "Medicamentos", VACCINE: "Vacunas", PRIMARY: "Insumos" };

export async function loadInventoryDocument(id) {
  const document = await api(`/inventario/documentos/${id}`);
  const roots = document.detalles.filter((line) => !line.parent_line_id);
  const rows = roots.map((line) => ({
    id: clientId(), tipo: typeByRole[line.line_role] || "Insumos",
    item: line.product_code, alimento: line.product_code, unitCode: line.product_unit_code,
    cantidad: (allowsDecimalQuantity(line.product_unit_code) ? quantityText : integerText)(line.quantity),
    precio: priceText(line.unit_cost), modoPrecio: "UNITARIO",
    justificacion: line.justification || "",
    galeras: (line.allocations || []).map((allocation) => ({ galera: allocation.house_code || allocation.house_id, cantidad: (allowsDecimalQuantity(line.product_unit_code) ? quantityText : integerText)(allocation.quantity) })),
    aditivos: document.detalles.filter((child) => child.parent_line_id === line.id && child.line_role === "ADDITIVE").map((child) => ({ id: clientId(), producto: child.product_code, unitCode: child.product_unit_code, cantidad: (allowsDecimalQuantity(child.product_unit_code) ? quantityText : integerText)(child.quantity) })),
    medicamentos: document.detalles.filter((child) => child.parent_line_id === line.id && child.line_role === "MEDICINE").map((child) => ({ id: clientId(), producto: child.product_code, unitCode: child.product_unit_code, cantidad: (allowsDecimalQuantity(child.product_unit_code) ? quantityText : integerText)(child.quantity) })),
  }));
  return { document, rows };
}
