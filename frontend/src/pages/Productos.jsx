import { useState } from "react";
import { api } from "../services/api";
import { useReferenceValues } from "../hooks/useOperationalCatalogs";
import ConfigRecordsTable from "../components/ConfigRecordsTable";
import { assertUniqueCode, useCatalogList } from "../hooks/useCatalogList";

function Productos() {
  const referencias = useReferenceValues(["PRODUCT_TYPE", "UNIT", "VACCINE_KIND"]);
  const list = useCatalogList("/productos");
  // =========================
  // STATES
  // =========================

  const [tipoInventario, setTipoInventario] = useState("");
  const [idProducto, setIdProducto] = useState("");
  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState("");
  const [estado, setEstado] = useState("Activo");
  const [precio, setPrecio] = useState("");
  const [existencia, setExistencia] = useState("");

  const [costo, setCosto] = useState("");
  const [presentacion, setPresentacion] = useState("");
  const [enfermedad, setEnfermedad] = useState("");
  const [dosis, setDosis] = useState("");
  const [tipo, setTipo] = useState("");

  const [mostrarGenerales, setMostrarGenerales] = useState(false);
  const [mostrarInsumos, setMostrarInsumos] = useState(false);

  const [helpId, setHelpId] = useState("");
  const [mostrarGuardar, setMostrarGuardar] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // =========================
  // CAMBIO DE TIPO INVENTARIO
  // =========================

  const handleTipo = (e) => {
    const value = e.target.value;

    setTipoInventario(value);

    const prefijos = {
      AD: "AD01 Automatico",
      AL: "AL01 Automatico",
      HC: "HC01 Automatico",
      HI: "HI01 Automatico",
      IN: "IN01 Automatico",
      ME: "ME01 Automatico",
      MD: "MD01 Automatico",
      VA: "VA01 Automatico"
    };

    if (value) {
      setMostrarGenerales(true);
      setMostrarGuardar(true);

      setHelpId(prefijos[value] || "");

      if (value === "MD" || value === "VA") {
        setMostrarInsumos(true);
      } else {
        setMostrarInsumos(false);
      }
    } else {
      setMostrarGenerales(false);
      setMostrarInsumos(false);
      setMostrarGuardar(false);
      setHelpId("");
    }
  };

  // =========================
  // MÁSCARA ID PRODUCTO
  // =========================

  const handleIdProducto = (e) => {
    setIdProducto(
      e.target.value.toUpperCase()
    );
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();
    const units = { Caja: "BOX", Gramo: "GRAM", Kilogramo: "KILOGRAM", Libra: "POUND", Quintal: "QUINTAL" };
    try {
      assertUniqueCode(list.rows, idProducto, "código de producto", editingId);
      await api(editingId ? `/productos/${editingId}` : "/productos", { method: editingId ? "PUT" : "POST", body: JSON.stringify({
        tipoProducto: tipoInventario, codigo: idProducto, nombre, unidad: units[unidad] || unidad,
        estado: estado === "Activo" ? "ACTIVE" : "INACTIVE", precioVenta: precio || 0,
        existenciaInicial: existencia || 0, costoEstandar: costo || 0, presentacion,
        enfermedadObjetivo: enfermedad, dosis, tipoVacuna: tipo || null,
      }) });
      alert("Producto guardado correctamente");
      setIdProducto(""); setNombre(""); setPrecio(""); setExistencia(""); setCosto("");
      setEditingId(null);
      await list.reload();
    } catch (error) { alert(error.message); }
  };

  // =========================
  // ESTILOS
  // =========================

  const inputStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  };

  const rowStyle = {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
    alignItems: "flex-end"
  };

  // =========================
  // RENDER
  // =========================

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
        position: "relative",
        fontFamily: "Arial"
      }}
    >
      <h2>
        Productos
      </h2>

      {/* TIPO INVENTARIO */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          Tipo de Inventario
        </label>

        <select
          value={tipoInventario}
          onChange={handleTipo}
          style={inputStyle}
        >
          <option value="">
            Seleccione
          </option>

          {(referencias.PRODUCT_TYPE || []).map((item) => <option key={item.valueCode} value={item.valueCode}>{item.label}</option>)}
          

            
        </select>
      </div>

      {/* CAMPOS GENERALES */}
      {mostrarGenerales && (
        <div>
          {/* FILA 1 */}
          <div style={rowStyle}>
            {/* ID PRODUCTO */}
            <div style={{ flex: 2 }}>
              <label>
                Id de Producto
              </label>

              <input
                type="text"
                value={idProducto}
                onChange={handleIdProducto}
                placeholder={helpId}
                style={inputStyle}
              />

               </div>

            {/* UNIDAD */}
            <div style={{ flex: 1 }}>
              <label>
                Unidad de Medida
              </label>

              <select
                value={unidad}
                onChange={(e) =>
                  setUnidad(
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="">
                  Seleccione
                </option>

                {(referencias.UNIT || []).map((item) => <option key={item.valueCode} value={item.valueCode}>{item.label}</option>)}
              </select>
            </div>

            {/* ESTADO */}
            <div style={{ flex: 1 }}>
              <label>
                Estado
              </label>

              <select
                value={estado}
                onChange={(e) =>
                  setEstado(
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="Activo">
                  Activo
                </option>

                <option value="Inactivo">
                  Inactivo
                </option>
              </select>
            </div>
          </div>

          {/* FILA 2 */}
          <div style={rowStyle}>
            {/* NOMBRE */}
            <div style={{ flex: 3 }}>
              <label>
                Nombre del Producto
              </label>

              <input
                type="text"
                value={nombre}
                onChange={(e) =>
                  setNombre(
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            {/* PRECIO */}
            <div style={{ flex: 1 }}>
              <label>
                Precio
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={precio}
                onChange={(e) =>
                  setPrecio(
                    e.target.value
                  )
                }
                placeholder="0.00"
                style={inputStyle}
              />
            </div>

            {/* EXISTENCIA */}
            <div style={{ flex: 1 }}>
              <label>
                Existencia
              </label>

              <input
                type="number"
                value={existencia}
                onChange={(e) =>
                  setExistencia(
                    e.target.value
                  )
                }
                placeholder="0"
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      )}

      {/* CAMPOS MEDICAMENTOS Y VACUNAS */}
      {mostrarInsumos && (
        <div>
          {/* FILA 3 */}
          <div style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label>
                Costo
              </label>

              <input
                type="number"
                step="0.01"
                value={costo}
                onChange={(e) =>
                  setCosto(
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label>
                Presentación
              </label>

              <input
                type="text"
                value={presentacion}
                onChange={(e) =>
                  setPresentacion(
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>
          </div>

          {/* FILA 4 */}
          <div style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label>
                Enfermedad
              </label>

              <input
                type="text"
                value={enfermedad}
                onChange={(e) =>
                  setEnfermedad(
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label>
                Dosis
              </label>

              <input
                type="text"
                value={dosis}
                onChange={(e) =>
                  setDosis(
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label>
                Tipo
              </label>

              <select
                value={tipo}
                onChange={(e) =>
                  setTipo(
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="">
                  Seleccione
                </option>

                {(referencias.VACCINE_KIND || []).map((item) => <option key={item.valueCode} value={item.valueCode}>{item.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN */}
      {mostrarGuardar && (
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          {editingId ? "Guardar cambios" : "Guardar"}
        </button>
      )}
      <ConfigRecordsTable title="Productos registrados" rows={list.rows} loading={list.loading} error={list.error} columns={[
        { key: "code", label: "Código" }, { key: "productType", label: "Tipo" }, { key: "name", label: "Producto" },
        { key: "unitCode", label: "Unidad" }, { key: "openingStock", label: "Existencia inicial" },
        { key: "standardCost", label: "Costo" }, { key: "salePrice", label: "Precio" }, { key: "status", label: "Estado" },
      ]} onEdit={(row) => {
        setEditingId(row.id); setTipoInventario(row.productType); setIdProducto(row.code); setNombre(row.name);
        setUnidad(row.unitCode); setEstado(row.status === "INACTIVE" ? "Inactivo" : "Activo"); setPrecio(row.salePrice || "");
        setExistencia(row.openingStock || ""); setCosto(row.standardCost || ""); setPresentacion(row.presentation || "");
        setEnfermedad(row.targetDisease || ""); setDosis(row.dosage || ""); setTipo(row.vaccineKind || "");
        setMostrarGenerales(true); setMostrarGuardar(true); setMostrarInsumos(["MD", "VA"].includes(row.productType));
      }} onDeactivate={async (row) => {
        if (!window.confirm(`¿Deseas dar de baja el producto ${row.name}?`)) return;
        try { await api(`/productos/${row.id}`, { method: "PUT", body: JSON.stringify({ estado: "INACTIVE" }) }); await list.reload(); }
        catch (error) { alert(error.message); }
      }}/>
    </form>
  );
}

export default Productos;
