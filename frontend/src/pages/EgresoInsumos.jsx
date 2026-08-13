import { useState } from "react";
import { loadInventoryDocument, saveInventory } from "../services/operations";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";
import OperationRecordsModal, { inventoryColumns } from "../components/OperationRecordsModal";
import OperationPanel from "../components/OperationPanel";

function EgresoInsumos() {
  const { productosPorTipo, opciones } = useOperationalCatalogs(["productos", "galeras"]);

  // =========================
  // FECHA
  // =========================

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  // =========================
  // OPCIONES
  // =========================

  const vacunas = productosPorTipo(["VA"]).map((x) => x.value);
  const medicamentos = productosPorTipo(["MD"]).map((x) => x.value);
  const aditivos = productosPorTipo(["AD"]).map((x) => x.value);
  const materiales = productosPorTipo(["ME", "IN"]).map((x) => x.value);
  const galeras = opciones("galeras");

  // =========================
  // FILAS
  // =========================

  const [filas, setFilas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const cargarEdicion = async (row) => { try { const data = await loadInventoryDocument(row.id); setEditingId(row.id); setFecha(String(data.document.movement_date).slice(0, 10)); setFilas(data.rows.map((item) => ({ ...item, tipo: item.tipo === "Vacunas" ? "Vacuna" : item.tipo }))); } catch (error) { alert(error.message); } };

  const crearFila = (tipo) => ({
    id: Date.now() + Math.random(),
    tipo,
    item: "",
    cantidad: "",
    galeras: [] // ahora será lista de {galera, cantidad}
  });

  const agregarFila = (tipo) => {
    setFilas(prev => [...prev, crearFila(tipo)]);
  };

  const eliminarFila = (id) => {
    setFilas(prev => prev.filter(f => f.id !== id));
  };

  // =========================
  // CAMBIOS
  // =========================

  const handleChange = (id, campo, value) => {
    setFilas(prev =>
      prev.map(f =>
        f.id === id ? { ...f, [campo]: value } : f
      )
    );
  };

  // =========================
  // GALERAS DINÁMICAS (AGREGAR FILA GALERA + CANTIDAD)
  // =========================

  const agregarGalera = (filaId) => {
    setFilas(prev =>
      prev.map(f =>
        f.id === filaId
          ? {
              ...f,
              galeras: [
                ...f.galeras,
                { galera: "", cantidad: "" }
              ]
            }
          : f
      )
    );
  };

  const handleGaleraChange = (filaId, index, campo, value) => {
    setFilas(prev =>
      prev.map(f => {
        if (f.id !== filaId) return f;

        const nuevas = [...f.galeras];
        nuevas[index] = {
          ...nuevas[index],
          [campo]: value
        };

        return {
          ...f,
          galeras: nuevas
        };
      })
    );
  };

  // =========================
  // OPTIONS POR TIPO
  // =========================

  const getOptions = (tipo) => {
    switch (tipo) {

      case "Aditivos":
        return aditivos;

      case "Materiales":
        return materiales;

      case "Medicamentos":
        return medicamentos;

      case "Vacuna":
        return vacunas;

      default:
        return [];
    }
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = async (e) => {
    e.preventDefault();
    try { await saveInventory({ id: editingId, fecha, rows: filas, movementType: "OUTPUT", module: "SUPPLIES", allocate: true });
      alert(editingId ? "Otro egreso actualizado correctamente" : "Otro egreso registrado correctamente"); setFilas([]); setEditingId(null);
    } catch (error) { alert(error.message); }
  };

  // =========================
  // ESTILOS
  // =========================

  const inputStyle = {
    width: "100%",
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "4px"
  };

  const btn = {
    padding: "10px",
    flex: 1,
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  };

  const btnSmall = {
    padding: "5px 10px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "5px"
  };

  const galeraRow = {
    display: "flex",
    gap: "8px",
    marginBottom: "5px"
  };

  // =========================
  // RENDER
  // =========================

  return (<OperationPanel maxWidth={1000}><OperationRecordsModal title="Otros egresos" path="/inventario/documentos" annulPath={(row) => `/inventario/documentos/${row.id}/anular`} dateField="movement_date" columns={inventoryColumns} rowFilter={(row) => row.movement_type === "OUTPUT" && row.module_code === "SUPPLIES"} onEdit={cargarEdicion}/>

    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h2>Otros egresos</h2>

      {/* FECHA */}
      <div style={{ marginBottom: "15px" }}>
        <label>Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* BOTONES (REORDENADOS) */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>

        <button type="button" style={btn} onClick={() => agregarFila("Aditivos")}>
          Aditivos
        </button>

        <button type="button" style={btn} onClick={() => agregarFila("Materiales")}>
          Materiales
        </button>

        <button type="button" style={btn} onClick={() => agregarFila("Medicamentos")}>
          Medicamentos
        </button>

        <button type="button" style={btn} onClick={() => agregarFila("Vacuna")}>
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
              <th>Galeras</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>

            {filas.map((fila) => (

              <tr key={fila.id}>

                {/* TIPO */}
                <td>{fila.tipo}</td>

                {/* ITEM */}
                <td>
                  <select
                    value={fila.item}
                    onChange={(e) =>
                      handleChange(fila.id, "item", e.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="">Seleccione</option>
                    {getOptions(fila.tipo).map(op => (
                      <option key={op} value={op}>
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
                      handleChange(fila.id, "cantidad", e.target.value)
                    }
                    style={inputStyle}
                  />
                </td>

                {/* GALERAS DINÁMICAS */}
                <td>

                  <button
                    type="button"
                    onClick={() => agregarGalera(fila.id)}
                    style={btnSmall}
                  >
                    Agregar
                  </button>

                  {fila.galeras.map((g, index) => (
                    <div key={index} style={galeraRow}>

                      <select
                        value={g.galera}
                        onChange={(e) =>
                          handleGaleraChange(
                            fila.id,
                            index,
                            "galera",
                            e.target.value
                          )
                        }
                        style={inputStyle}
                      >
                        <option value="">Seleccione</option>
                        {galeras.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        value={g.cantidad}
                        onChange={(e) =>
                          handleGaleraChange(
                            fila.id,
                            index,
                            "cantidad",
                            e.target.value
                          )
                        }
                        style={inputStyle}
                      />

                    </div>
                  ))}

                </td>

                {/* ELIMINAR */}
                <td>
                  <button
                    type="button"
                    onClick={() => eliminarFila(fila.id)}
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

export default EgresoInsumos;
