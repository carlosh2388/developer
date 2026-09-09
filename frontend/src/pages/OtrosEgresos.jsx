import { useState } from "react";
import { loadInventoryDocument, quantityInput, saveInventory } from "../services/operations";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";
import OperationRecordsModal, { inventoryColumns } from "../components/OperationRecordsModal";
import OperationPanel from "../components/OperationPanel";
import CancelEditButton from "../components/CancelEditButton";

function OtrosEgresos() {
  const { productosPorTipo, opciones } = useOperationalCatalogs(["productos", "lotes"]);

  // =========================
  // FECHA
  // =========================

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  // =========================
  // OPCIONES
  // =========================

  const vacunas = productosPorTipo(["VA"]);
  const medicamentos = productosPorTipo(["MD"]);
  const aditivos = productosPorTipo(["AD"]);
  const insumos = productosPorTipo(["IN"]);
  const materiales = productosPorTipo(["ME"]);
  const lotes = opciones("lotes");

  // =========================
  // FILAS
  // =========================

  const [filas, setFilas] = useState([]);
  const [filasSinLote, setFilasSinLote] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const cargarEdicion = async (row) => { try { const data = await loadInventoryDocument(row.id); setFilasSinLote([]); setEditingId(row.id); setFecha(String(data.document.movement_date).slice(0, 10)); setFilas(data.rows.map((item) => ({ ...item, tipo: item.tipo === "Materiales" ? "Material de Empaque" : item.tipo === "Vacunas" ? "Vacuna" : item.tipo }))); } catch (error) { alert(error.message); } };

  const crearFila = (tipo) => ({
    id: Date.now() + Math.random(),
    tipo,
    item: "",
    cantidad: "",
    lotes: []
  });

  const agregarFila = (tipo) => {
    setFilas(prev => [...prev, crearFila(tipo)]);
  };

  const eliminarFila = (id) => {
    setFilas(prev => prev.filter(f => f.id !== id));
    setFilasSinLote((current) => current.filter((filaId) => filaId !== id));
  };

  // =========================
  // CAMBIOS
  // =========================

  const handleChange = (id, campo, value) => {
    setFilas(prev =>
      prev.map(f =>
        f.id === id
          ? { ...f, [campo]: value }
          : f
      )
    );
  };

  // =========================
  // LOTES DINÁMICOS
  // =========================

  const agregarLote = (filaId) => {
    setFilas(prev =>
      prev.map(f =>
        f.id === filaId
          ? {
              ...f,
              lotes: [
                ...f.lotes,
                {
                  lote: "",
                  cantidad: ""
                }
              ]
            }
          : f
      )
    );
  };

  const handleLoteChange = (
    filaId,
    index,
    campo,
    value
  ) => {
    setFilasSinLote((current) => current.filter((id) => id !== filaId));
    setFilas(prev =>
      prev.map(f => {
        if (f.id !== filaId) return f;

        const nuevas = [...f.lotes];

        nuevas[index] = {
          ...nuevas[index],
          [campo]: value
        };

        return {
          ...f,
          lotes: nuevas
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

      case "Insumos":
        return insumos;

      case "Material de Empaque":
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
    const invalidas = filas.filter((fila) => !fila.lotes.length
      || fila.lotes.some((item) => !item.lote || !/^\d+(?:\.\d{1,2})?$/.test(String(item.cantidad)) || Number(item.cantidad) <= 0)
      || Math.abs(fila.lotes.reduce((total, item) => total + Number(item.cantidad || 0), 0) - Number(fila.cantidad)) > 0.0001);
    if (invalidas.length) {
      setFilasSinLote(invalidas.map((fila) => fila.id));
      const numeros = invalidas.map((fila) => filas.indexOf(fila) + 1).join(", ");
      alert(`Selecciona un lote y distribuye la cantidad completa en las filas: ${numeros}.`);
      return;
    }
    setFilasSinLote([]);
    try { await saveInventory({ id: editingId, fecha, rows: filas, movementType: "OUTPUT", module: "OTHER", allocate: true });
      alert(editingId ? "Egreso actualizado correctamente" : "Otro egreso registrado correctamente"); setFilas([]); setFilasSinLote([]); setFecha(new Date().toISOString().split("T")[0]); setEditingId(null);
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

  const loteRow = {
    display: "flex",
    gap: "8px",
    marginBottom: "5px"
  };

  // =========================
  // RENDER
  // =========================

  return (<OperationPanel maxWidth={1500}><OperationRecordsModal title="Otros egresos" path="/inventario/documentos" annulPath={(row) => `/inventario/documentos/${row.id}/anular`} dateField="movement_date" columns={inventoryColumns} rowFilter={(row) => row.movement_type === "OUTPUT" && row.module_code === "OTHER"} onEdit={cargarEdicion}/>
    <div
      style={{
        width: "100%",
        maxWidth: "1460px",
        boxSizing: "border-box",
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
          marginBottom: "15px"
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
            agregarFila("Vacuna")
          }
        >
          Vacunas
        </button>

      </div>

      {/* TABLA */}

      <form onSubmit={guardar} style={{ overflowX: "auto" }}>

        <table
          style={{
            width: "100%",
            minWidth: "1180px",
            borderCollapse: "collapse"
          }}
        >
          <colgroup><col style={{ width: "14%" }}/><col style={{ width: "30%" }}/><col style={{ width: "15%" }}/><col style={{ width: "32%" }}/><col style={{ width: "9%" }}/></colgroup>

          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th>Tipo</th>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Lotes</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>

            {filas.map((fila) => (

              <tr key={fila.id}>

                <td>{fila.tipo}</td>

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

                {/* LOTES */}

                <td className={filasSinLote.includes(fila.id) ? "allocation-validation-error" : ""}>

                  <button
                    type="button"
                    onClick={() =>
                      agregarLote(fila.id)
                    }
                    style={btnSmall}
                  >
                    Agregar
                  </button>

                  {fila.lotes.map(
                    (g, index) => (
                      <div
                        key={index}
                        style={loteRow}
                      >

                        <select
                          value={g.lote}
                          onChange={(e) =>
                            handleLoteChange(
                              fila.id,
                              index,
                              "lote",
                              e.target.value
                            )
                          }
                          style={inputStyle}
                        >
                          <option value="">
                            Seleccione
                          </option>

                          {lotes.map(opt => (
                            <option
                              key={opt.value}
                              value={opt.value}
                            >
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          {...quantityInput(getOptions(fila.tipo).find((item) => item.value === fila.item)?.unitCode)}
                          value={g.cantidad}
                          onChange={(e) =>
                            handleLoteChange(
                              fila.id,
                              index,
                              "cantidad",
                              e.target.value
                            )
                          }
                          style={inputStyle}
                        />

                      </div>
                    )
                  )}

                  {filasSinLote.includes(fila.id) && <small className="field-error-message">Selecciona un lote y distribuye la cantidad completa de esta fila.</small>}

                </td>

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
          </button><CancelEditButton editing={editingId} onCancel={() => { setEditingId(null); setFilas([]); setFilasSinLote([]); setFecha(new Date().toISOString().split("T")[0]); }}/></div>
        </div>

      </form>

    </div>
  </OperationPanel>);
}

export default OtrosEgresos;
