import { useState } from "react";
import { loadInventoryDocument, saveInventory } from "../services/operations";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";
import OperationRecordsModal, { inventoryColumns } from "../components/OperationRecordsModal";
import OperationPanel from "../components/OperationPanel";

function AjusteSalida() {
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
  const vacunas = productosPorTipo(["VA"]).map((x) => x.value);
  const medicamentos = productosPorTipo(["MD"]).map((x) => x.value);
  const aditivos = productosPorTipo(["AD"]).map((x) => x.value);
  const insumos = productosPorTipo(["IN"]).map((x) => x.value);
  const materiales = productosPorTipo(["ME"]).map((x) => x.value);
  const alimentos = productosPorTipo(["AL"]).map((x) => x.value);

  // =========================
  // FILAS DINÁMICAS
  // =========================
  const [filas, setFilas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const cargarEdicion = async (row) => { try { const data = await loadInventoryDocument(row.id); setEditingId(row.id); setFecha(String(data.document.movement_date).slice(0, 10)); setFilas(data.rows.map((item) => ({ ...item, tipo: item.tipo === "Materiales" ? "Material de Empaque" : item.tipo }))); } catch (error) { alert(error.message); } };

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
    try { await saveInventory({ id: editingId, fecha, rows: filas, movementType: "ADJUSTMENT_OUT", module: "OTHER" });
      alert(editingId ? "Ajuste actualizado correctamente" : "Ajuste de salida registrado correctamente"); setFilas([]); setEditingId(null);
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

  return (<OperationPanel maxWidth={1000}><OperationRecordsModal title="Ajustes de salida" path="/inventario/documentos" annulPath={(row) => `/inventario/documentos/${row.id}/anular`} dateField="movement_date" columns={inventoryColumns} rowFilter={(row) => row.movement_type === "ADJUSTMENT_OUT"} onEdit={cargarEdicion}/>
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >
      <h2>Ajustes de Salida</h2>

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
          onClick={() =>
            agregarFila("Aditivos")
          }
        >
          Aditivos
        </button>

        <button
          type="button"
          style={btn}
          onClick={() =>
            agregarFila("Alimento")
          }
        >
          Alimento
        </button>

        {/* NUEVO BOTÓN INSUMOS */}
        <button
          type="button"
          style={btn}
          onClick={() =>
            agregarFila("Insumos")
          }
        >
          Insumos
        </button>

        <button
          type="button"
          style={btn}
          onClick={() =>
            agregarFila("Material de Empaque")
          }
        >
          Material de Empaque
        </button>

        <button
          type="button"
          style={btn}
          onClick={() =>
            agregarFila("Medicamentos")
          }
        >
          Medicamentos
        </button>

        <button
          type="button"
          style={btn}
          onClick={() =>
            agregarFila("Vacunas")
          }
        >
          Vacunas
        </button>
      </div>

      {/* TABLA */}
      <form onSubmit={guardar}>
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
                        key={op}
                        value={op}
                      >
                        {op}
                      </option>
                    ))}
                  </select>
                </td>

                {/* CANTIDAD */}
                <td>
                  <input
                    type="number"
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
          <button
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
          </button>
        </div>
      </form>
    </div>
  </OperationPanel>);
}

export default AjusteSalida;
