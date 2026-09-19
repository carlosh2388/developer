import { useState } from "react";
import { loadInventoryDocument, quantityInput, saveInventory } from "../services/operations";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";
import { useCatalogList } from "../hooks/useCatalogList";
import ConfigRecordsTable from "../components/ConfigRecordsTable";
import OperationPanel from "../components/OperationPanel";
import CancelEditButton from "../components/CancelEditButton";
import EggAdjustmentForm from "../components/EggAdjustmentForm";
import { api } from "../services/api";

function AjustesEntradaRecords({ onEditInventory, onEditEgg }) {
  const inventory = useCatalogList("/inventario/documentos");
  const eggs = useCatalogList("/huevos/movimientos");
  const inventoryRows = inventory.rows
    .filter((row) => row.movement_type === "ADJUSTMENT_IN")
    .map((row) => ({
      ...row,
      source: "inventory",
      sourceLabel: "Inventario",
      displayNumber: row.document_number,
      description: row.products || "Sin detalles",
      total: row.total_quantity,
    }));
  const eggRows = eggs.rows
    .filter((row) => row.movement_type === "INPUT" && row.destination_warehouse_id && !row.collector_names && !row.classifier_names)
    .map((row) => ({
      ...row,
      source: "egg",
      sourceLabel: "Huevo",
      displayNumber: row.movement_number || row.id,
      description: row.grade_labels || "Sin clasificaciones",
      total: row.total_units,
    }));
  const rows = [...inventoryRows, ...eggRows];
  const columns = [
    { key: "displayNumber", label: "Documento" },
    { key: "sourceLabel", label: "Tipo" },
    { key: "movement_date", label: "Fecha", render: (value) => String(value || "").slice(0, 10) },
    { key: "flock_codes", label: "Lote", render: (value) => value || "Sin lote" },
    { key: "description", label: "Detalle" },
    { key: "total", label: "Total", render: (value) => Number(value || 0).toLocaleString("es-GT", { maximumFractionDigits: 2 }) },
    { key: "status", label: "Estado", render: (value) => ({ POSTED: "Registrado", VOID: "Anulado", DRAFT: "Borrador" }[value] || value) },
  ];
  const reload = async () => { await Promise.all([inventory.reload(), eggs.reload()]); };

  return <ConfigRecordsTable
    title="Ajustes de entrada"
    rows={rows}
    loading={inventory.loading || eggs.loading}
    error={inventory.error || eggs.error}
    columns={columns}
    dateField="movement_date"
    inactiveStatuses={["VOID"]}
    nonEditableStatuses={["VOID"]}
    deactivateLabel="Anular"
    onEdit={(row) => row.source === "egg" ? onEditEgg(row) : onEditInventory(row)}
    onDeactivate={async (row) => {
      if (!window.confirm("Deseas anular este registro?")) return;
      await api(row.source === "egg" ? `/operaciones/huevos/${row.id}/anular` : `/inventario/documentos/${row.id}/anular`, { method: "PATCH" });
      await reload();
      alert("Registro anulado correctamente.");
    }}
  />;
}

function AjustesEntrada() {
  const { productosPorTipo } = useOperationalCatalogs(["productos"]);

  // =========================
  // FECHA
  // =========================

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  // =========================
  // LISTAS
  // =========================

  const vacunas = productosPorTipo(["VA"]);
  const medicamentos = productosPorTipo(["MD"]);
  const aditivos = productosPorTipo(["AD"]);
  const insumos = productosPorTipo(["IN"]);
  const materiales = productosPorTipo(["ME"]);
  const alimentos = productosPorTipo(["AL"]);

  // =========================
  // FILAS DINÁMICAS
  // =========================

  const [filas, setFilas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [eggMode, setEggMode] = useState(false);
  const [eggEditingId, setEggEditingId] = useState(null);
  const [eggInitialData, setEggInitialData] = useState(null);
  const cargarEdicion = async (row) => { try { const data = await loadInventoryDocument(row.id); setEggMode(false); setEggEditingId(null); setEggInitialData(null); setEditingId(row.id); setFecha(String(data.document.movement_date).slice(0, 10)); setFilas(data.rows.map((item) => ({ ...item, tipo: item.tipo === "Materiales" ? "Material de Empaque" : item.tipo }))); } catch (error) { alert(error.message); } };
  const cargarEdicionHuevo = async (row) => { try {
    const data = await api(`/huevos/movimientos/${row.id}`);
    setEggMode(true); setFilas([]); setEditingId(null); setEggEditingId(row.id); setEggInitialData(data);
    setFecha(String(data.movement_date).slice(0, 10));
  } catch (error) { alert(error.message); } };

  // =========================
  // CREAR FILA
  // =========================

  const crearFila = (tipo) => ({
    id: Date.now() + Math.random(),
    tipo,
    item: "",
    cantidad: "",
    justificacion: ""
  });

  // =========================
  // AGREGAR FILA
  // =========================

  const agregarFila = (tipo) => {
    if (eggMode) return;
    setFilas(prev => [
      ...prev,
      crearFila(tipo)
    ]);
  };

  // =========================
  // ELIMINAR FILA
  // =========================

  const eliminarFila = (id) => {
    setFilas(prev =>
      prev.filter(f => f.id !== id)
    );
  };

  // =========================
  // CAMBIOS
  // =========================

  const handleChange = (
    id,
    campo,
    value
  ) => {
    setFilas(prev =>
      prev.map(f =>
        f.id === id
          ? { ...f, [campo]: value }
          : f
      )
    );
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = async (e) => {
    e.preventDefault();
    try { await saveInventory({ id: editingId, fecha, rows: filas, movementType: "ADJUSTMENT_IN", module: "OTHER" });
      alert(editingId ? "Ajuste actualizado correctamente" : "Ajuste de entrada registrado correctamente"); setFilas([]); setFecha(new Date().toISOString().split("T")[0]); setEditingId(null);
    } catch (error) { alert(error.message); }
  };

  // =========================
  // ESTILOS
  // =========================

  const btn = {
    padding: "10px",
    flex: 1,
    cursor: "pointer",
    border: "none",
    borderRadius: "5px",
    background: "#1976d2",
    color: "#fff"
  };

  const inputStyle = {
    width: "100%",
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "4px"
  };

  // =========================
  // OPTIONS POR TIPO
  // =========================

  const getOptions = (tipo) => {

    switch (tipo) {

      case "Vacunas":
        return vacunas;

      case "Medicamentos":
        return medicamentos;

      case "Aditivos":
        return aditivos;

      case "Insumos":
        return insumos;

      case "Material de Empaque":
        return materiales;

      case "Alimento":
        return alimentos;

      default:
        return [];
    }
  };
  return (<OperationPanel maxWidth={1000}><AjustesEntradaRecords onEditInventory={cargarEdicion} onEditEgg={cargarEdicionHuevo}/>
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h2>Ajustes de Entrada</h2>

      {/* FECHA */}
      <div style={{ marginBottom: "15px" }}>
        <label>Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) =>
            setFecha(e.target.value)
          }
          style={inputStyle}
        />
      </div>

      {/* BOTONES */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap"
        }}
      >

        <button
          type="button"
          style={btn}
          disabled={eggMode}
          onClick={() =>
            agregarFila("Aditivos")
          }
        >
          Aditivos
        </button>

        <button
          type="button"
          style={btn}
          disabled={eggMode}
          onClick={() =>
            agregarFila("Alimento")
          }
        >
          Alimento
        </button>

        <button type="button" style={{ ...btn, background: eggMode ? "#0d6efd" : "#1976d2" }} onClick={() => { setEggMode(true); setFilas([]); setEditingId(null); setEggEditingId(null); setEggInitialData(null); }}>
          Huevo
        </button>

        <button
          type="button"
          style={btn}
          disabled={eggMode}
          onClick={() =>
            agregarFila("Insumos")
          }
        >
          Insumos
        </button>

        <button
          type="button"
          style={btn}
          disabled={eggMode}
          onClick={() =>
            agregarFila("Material de Empaque")
          }
        >
          Material de Empaque
        </button>

        <button
          type="button"
          style={btn}
          disabled={eggMode}
          onClick={() =>
            agregarFila("Medicamentos")
          }
        >
          Medicamentos
        </button>

        <button
          type="button"
          style={btn}
          disabled={eggMode}
          onClick={() =>
            agregarFila("Vacunas")
          }
        >
          Vacunas
        </button>

      </div>

      {/* TABLA */}
      {eggMode ? <>
        <EggAdjustmentForm date={fecha} movementType="ADJUSTMENT_IN" editingId={eggEditingId} initialData={eggInitialData} onSaved={() => { setEggEditingId(null); setEggInitialData(null); }} />
        <button type="button" onClick={() => { setEggMode(false); setEggEditingId(null); setEggInitialData(null); }} style={{ marginTop: "10px", padding: "10px 18px", background: "#d9534f", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: 700 }}>Cancelar ajuste de huevo</button>
      </> : <form onSubmit={guardar}>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse"
          }}
        >

          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th>Tipo</th>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Razón o Justificación</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>

            {filas.map(fila => (

              <tr key={fila.id}>

                {/* TIPO */}
                <td>
                  {fila.tipo}
                </td>

                {/* NOMBRE */}
                <td>
                  <select
                    value={fila.item}
                    onChange={(e) =>
                      handleChange(
                        fila.id,
                        "item",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      Seleccione
                    </option>

                    {getOptions(fila.tipo).map(op => (
                      <option
                        key={op.value}
                        value={op.value}
                      >
                        {op.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* CANTIDAD */}
                <td>
                  <input
                    type="number"
                    {...quantityInput(getOptions(fila.tipo).find((item) => item.value === fila.item)?.unitCode)}
                    value={fila.cantidad}
                    onChange={(e) =>
                      handleChange(
                        fila.id,
                        "cantidad",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </td>

                {/* JUSTIFICACIÓN */}
                <td>
                  <input
                    type="text"
                    value={fila.justificacion}
                    onChange={(e) =>
                      handleChange(
                        fila.id,
                        "justificacion",
                        e.target.value
                      )
                    }
                    placeholder="Razón o justificación"
                    style={inputStyle}
                  />
                </td>

                {/* ACCIÓN */}
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      eliminarFila(fila.id)
                    }
                    style={{
                      padding: "5px 10px",
                      background: "#d9534f",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    X
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {/* GUARDAR */}
        <div style={{ marginTop: "20px" }}>
          <div className="edit-actions"><button
            type="submit"
            style={{
              padding: "10px 20px",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Guardar
          </button><CancelEditButton editing={editingId} onCancel={() => { setEditingId(null); setFilas([]); setFecha(new Date().toISOString().split("T")[0]); }}/></div>
        </div>

      </form>}

    </div>
  </OperationPanel>);
}

export default AjustesEntrada;

