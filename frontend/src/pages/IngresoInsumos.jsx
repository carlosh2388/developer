import { useState } from "react";
import { loadInventoryDocument, saveInventory } from "../services/operations";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";
import OperationRecordsModal, { inventoryColumns } from "../components/OperationRecordsModal";
import OperationPanel from "../components/OperationPanel";

function IngresoInsumos() {
  const { productosPorTipo, opciones } = useOperationalCatalogs(["productos", "proveedores"]);

  // =========================
  // FECHA
  // =========================

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [proveedor, setProveedor] = useState("");

  // =========================
  // LISTAS
  // =========================

  const vacunas = productosPorTipo(["VA"]).map((x) => x.value);
  const medicamentos = productosPorTipo(["MD"]).map((x) => x.value);
  const aditivos = productosPorTipo(["AD"]).map((x) => x.value);
  const insumos = productosPorTipo(["IN"]).map((x) => x.value);
  const materiales = productosPorTipo(["ME"]).map((x) => x.value);
  const alimentos = productosPorTipo(["AL"]).map((x) => x.value);
  const proveedores = opciones("proveedores");

  // =========================
  // FILAS DINÁMICAS
  // =========================

  const [filas, setFilas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const cargarEdicion = async (row) => { try { const data = await loadInventoryDocument(row.id); setEditingId(row.id); setFecha(String(data.document.movement_date).slice(0, 10)); setProveedor(data.document.supplier_code || ""); setFilas(data.rows.map((item) => ({ ...item, tipo: item.tipo === "Materiales" ? "Material de Empaque" : item.tipo }))); } catch (error) { alert(error.message); } };

  // =========================
  // CREAR FILA
  // =========================

  const crearFila = (tipo) => ({
    id: Date.now() + Math.random(),
    tipo,
    item: "",
    cantidad: "",
    precio: ""
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
  // GUARDAR
  // =========================

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (!proveedor) throw new Error("Selecciona el proveedor.");
      if (!filas.length) throw new Error("Agrega al menos un insumo.");
      if (filas.some((fila) => !fila.item || Number(fila.cantidad) <= 0 || Number(fila.precio) < 0)) throw new Error("Completa producto, cantidad y precio en cada fila.");
      await saveInventory({ id: editingId, fecha, proveedor, rows: filas, movementType: "INPUT", module: "SUPPLIES" });
      alert(editingId ? "Otro ingreso actualizado correctamente" : "Otro ingreso registrado correctamente"); setFilas([]); setEditingId(null); setProveedor(""); setFecha(new Date().toISOString().split("T")[0]);
    } catch (error) { alert(error.message); }
  };

  // =========================
  // ESTILO
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

  // =========================
  // RENDER
  // =========================

  return (<OperationPanel maxWidth={1000}><OperationRecordsModal title="Otros ingresos" path="/inventario/documentos" annulPath={(row) => `/inventario/documentos/${row.id}/anular`} dateField="movement_date" columns={inventoryColumns} rowFilter={(row) => row.movement_type === "INPUT" && row.module_code === "SUPPLIES"} onEdit={cargarEdicion}/>
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h2>Otros ingresos</h2>

      {/* FECHA Y PROVEEDOR */}
      <div style={{ display: "flex", gap: 20, marginBottom: 15 }}>
        <label style={{ flex: 1 }}>Fecha<input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputStyle}/></label>
        <label style={{ flex: 1 }}>Proveedor<select required value={proveedor} onChange={(e) => setProveedor(e.target.value)} style={inputStyle}>
          <option value="">Seleccione</option>
          {proveedores.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select></label>
      </div>

      {/* BOTONES (ORDENADOS + NUEVO ALIMENTO) */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap"
        }}
      >

        <button type="button" style={btn} onClick={() => agregarFila("Aditivos")}>
          Aditivos
        </button>

        <button type="button" style={btn} onClick={() => agregarFila("Alimento")}>
          Alimento
        </button>

        <button type="button" style={btn} onClick={() => agregarFila("Insumos")}>
          Insumos
        </button>

        <button type="button" style={btn} onClick={() => agregarFila("Material de Empaque")}>
          Material de Empaque
        </button>

        <button type="button" style={btn} onClick={() => agregarFila("Medicamentos")}>
          Medicamentos
        </button>

        <button type="button" style={btn} onClick={() => agregarFila("Vacunas")}>
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
              <th>Precio unitario (Q)</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>

            {filas.map(fila => (

              <tr key={fila.id}>

                {/* TIPO */}
                <td>{fila.tipo}</td>

                {/* NOMBRE */}
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

                {/* PRECIO UNITARIO */}
                <td>
                  <input type="number" min="0" step="0.01" value={fila.precio} onChange={(e) => handleChange(fila.id, "precio", e.target.value)} placeholder="0.00" style={inputStyle}/>
                </td>

                {/* ACCIÓN */}
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
            {editingId ? "Guardar cambios" : "Guardar"}
          </button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setFilas([]); setProveedor(""); }}>Cancelar edición</button>}
        </div>

      </form>

    </div>
  </OperationPanel>);
}

export default IngresoInsumos;
