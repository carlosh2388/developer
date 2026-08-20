import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useReferenceValues } from "../hooks/useOperationalCatalogs";
import ConfigRecordsTable from "../components/ConfigRecordsTable";
import CancelEditButton from "../components/CancelEditButton";
import { confirmAction } from "../services/notifications";
import { useCatalogList } from "../hooks/useCatalogList";
import InlineAddActions from "../components/InlineAddActions";

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
  const [unidades, setUnidades] = useState([]);
  const [mostrarNuevaUnidad, setMostrarNuevaUnidad] = useState(false);
  const [codigoNuevaUnidad, setCodigoNuevaUnidad] = useState("");
  const [nombreNuevaUnidad, setNombreNuevaUnidad] = useState("");
  const [abreviaturaNuevaUnidad, setAbreviaturaNuevaUnidad] = useState("");
  const [estado, setEstado] = useState("Activo");
  const [precio, setPrecio] = useState("");

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
  const cancelarEdicion = () => { setEditingId(null); setTipoInventario(""); setIdProducto(""); setNombre(""); setUnidad(""); setEstado("Activo"); setPrecio(""); setCosto(""); setPresentacion(""); setEnfermedad(""); setDosis(""); setTipo(""); setMostrarGenerales(false); setMostrarInsumos(false); setHelpId(""); setMostrarGuardar(false); setMostrarNuevaUnidad(false); setCodigoNuevaUnidad(""); setNombreNuevaUnidad(""); setAbreviaturaNuevaUnidad(""); };

  useEffect(() => { setUnidades(referencias.UNIT || []); }, [referencias.UNIT]);

  const abrirNuevaUnidad = async () => {
    try {
      const data = await api("/catalogos/unidades/siguiente");
      setCodigoNuevaUnidad(data.code); setMostrarNuevaUnidad(true);
    } catch (error) { alert(error.message); }
  };

  const agregarUnidad = async () => {
    if (!nombreNuevaUnidad.trim() || !abreviaturaNuevaUnidad.trim()) return;
    try {
      const nueva = await api("/catalogos/unidades", { method: "POST", body: JSON.stringify({
        nombre: nombreNuevaUnidad.trim(), abreviatura: abreviaturaNuevaUnidad.trim(),
      }) });
      setUnidades((current) => [...current, nueva].sort((a, b) => a.label.localeCompare(b.label, "es", { numeric: true })));
      setUnidad(nueva.valueCode); setMostrarNuevaUnidad(false); setCodigoNuevaUnidad("");
      setNombreNuevaUnidad(""); setAbreviaturaNuevaUnidad("");
    } catch (error) { alert(error.message); }
  };

  // =========================
  // CAMBIO DE TIPO INVENTARIO
  // =========================

  const handleTipo = async (e) => {
    const value = e.target.value;

    setTipoInventario(value);

    if (value) {
      setMostrarGenerales(true);
      setMostrarGuardar(true);

      setHelpId(`${value}01 Automático`);
      try {
        const next = await api(`/productos/siguiente?tipo=${encodeURIComponent(value)}`);
        setIdProducto(next.code);
      } catch (error) { setIdProducto(""); alert(error.message); }

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
      setIdProducto("");
    }
  };

  // =========================
  // MÁSCARA ID PRODUCTO
  // =========================

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();
    const units = { Caja: "BOX", Gramo: "GRAM", Kilogramo: "KILOGRAM", Libra: "POUND", Quintal: "QUINTAL" };
    try {
      const saved = await api(editingId ? `/productos/${editingId}` : "/productos", { method: editingId ? "PUT" : "POST", body: JSON.stringify({
        ...(!editingId ? { tipoProducto: tipoInventario } : {}), nombre, unidad: units[unidad] || unidad,
        estado: estado === "Activo" ? "ACTIVE" : "INACTIVE", precioVenta: precio || 0,
        existenciaInicial: 0, costoEstandar: costo || 0, presentacion,
        enfermedadObjetivo: enfermedad, dosis, tipoVacuna: tipo || null,
      }) });
      alert(`Producto ${saved.code} guardado correctamente`);
      setTipoInventario(""); setIdProducto(""); setNombre(""); setUnidad(""); setEstado("Activo");
      setPrecio(""); setCosto(""); setPresentacion(""); setEnfermedad(""); setDosis(""); setTipo("");
      setMostrarGenerales(false); setMostrarInsumos(false); setHelpId(""); setMostrarGuardar(false);
      setMostrarNuevaUnidad(false); setCodigoNuevaUnidad(""); setNombreNuevaUnidad(""); setAbreviaturaNuevaUnidad("");
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

  const productosConExistencia = list.rows.map((row) => ({
    ...row,
    currentStock: Number(row.currentStock ?? row.openingStock ?? 0),
  }));

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
          disabled={Boolean(editingId)}
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
                readOnly
                placeholder={helpId}
                style={inputStyle}
              />

               </div>

            {/* UNIDAD */}
            <div style={{ flex: 1 }}>
              <label>
                Unidad de Medida
              </label>

              <div style={{ display: "flex", gap: "8px" }}>
                <select value={unidad} onChange={(e) => setUnidad(e.target.value)} style={inputStyle}>
                  <option value="">Seleccione</option>
                  {[...unidades].sort((a, b) => a.label.localeCompare(b.label, "es", { numeric: true }))
                    .map((item) => <option key={item.valueCode} value={item.valueCode}>{item.label}</option>)}
                </select>
                <button type="button" onClick={abrirNuevaUnidad} title="Agregar unidad de medida"
                  style={{ width: 42, height: 42, padding: 0, flexShrink: 0, fontSize: 20 }}>+</button>
              </div>
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

          {mostrarNuevaUnidad && <div className="inline-add-row" style={{
            display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end",
            marginBottom: 15, padding: 14, border: "1px solid #d7e0da", borderRadius: 8
          }}>
            <div style={{ flex: "0 0 110px" }}>
              <label>Código</label>
              <input value={codigoNuevaUnidad} readOnly aria-label="Código de unidad" style={inputStyle} />
            </div>
            <div style={{ flex: "2 1 260px" }}>
              <label>Nombre de la unidad</label>
              <input value={nombreNuevaUnidad} onChange={(e) => setNombreNuevaUnidad(e.target.value)} placeholder="Ejemplo: Metro" style={inputStyle} />
            </div>
            <div style={{ flex: "1 1 150px" }}>
              <label>Abreviatura</label>
              <input value={abreviaturaNuevaUnidad} onChange={(e) => setAbreviaturaNuevaUnidad(e.target.value)} placeholder="Ejemplo: m" style={inputStyle} />
            </div>
            <InlineAddActions onSave={agregarUnidad} onCancel={() => {
              setMostrarNuevaUnidad(false); setCodigoNuevaUnidad(""); setNombreNuevaUnidad(""); setAbreviaturaNuevaUnidad("");
            }} />
          </div>}

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
                value="0"
                placeholder="0"
                min="0"
                step="1"
                readOnly
                disabled
                aria-readonly="true"
                style={{ ...inputStyle, cursor: "not-allowed", opacity: 0.75 }}
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
        <div className="edit-actions"><button
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
        </button><CancelEditButton editing={editingId} onCancel={cancelarEdicion}/></div>
      )}
      <ConfigRecordsTable title="Productos registrados" rows={productosConExistencia} loading={list.loading} error={list.error} columns={[
        { key: "code", label: "Código" }, { key: "productType", label: "Tipo", render: (value) =>
          (referencias.PRODUCT_TYPE || []).find((item) => item.valueCode === value)?.label || ({ AD: "Aditivo", AL: "Alimento", HC: "Huevo comercial", HI: "Huevo incubable", IN: "Insumo", ME: "Material de Empaque", MD: "Medicamento", VA: "Vacuna" }[value] || value)
        }, { key: "name", label: "Producto" },
        { key: "unitCode", label: "Unidad" }, { key: "currentStock", label: "Existencia actual", render: (value) => Number(value || 0).toLocaleString("es-GT", { maximumFractionDigits: 0 }) },
        { key: "standardCost", label: "Costo" }, { key: "salePrice", label: "Precio" }, { key: "status", label: "Estado" },
      ]} onEdit={(row) => {
        setEditingId(row.id); setTipoInventario(row.productType); setIdProducto(row.code); setNombre(row.name);
        setUnidad(row.unitCode); setEstado(row.status === "INACTIVE" ? "Inactivo" : "Activo"); setPrecio(row.salePrice || "");
        setCosto(row.standardCost || ""); setPresentacion(row.presentation || "");
        setEnfermedad(row.targetDisease || ""); setDosis(row.dosage || ""); setTipo(row.vaccineKind || "");
        setMostrarGenerales(true); setMostrarGuardar(true); setMostrarInsumos(["MD", "VA"].includes(row.productType));
      }} onDeactivate={async (row) => {
        if (!(await confirmAction(`¿Deseas dar de baja el producto ${row.name}?`, { title: "Dar de baja producto", confirmLabel: "Sí, dar de baja" }))) return;
        try { await api(`/productos/${row.id}`, { method: "PUT", body: JSON.stringify({ estado: "INACTIVE" }) }); await list.reload(); alert("Producto dado de baja correctamente."); }
        catch (error) { alert(error.message); }
      }}/>
    </form>
  );
}

export default Productos;
