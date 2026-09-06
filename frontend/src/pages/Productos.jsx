import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useReferenceValues } from "../hooks/useOperationalCatalogs";
import ConfigRecordsTable from "../components/ConfigRecordsTable";
import CancelEditButton from "../components/CancelEditButton";
import { confirmAction } from "../services/notifications";
import { useCatalogList } from "../hooks/useCatalogList";
import InlineAddActions from "../components/InlineAddActions";

function Productos() {
  const referencias = useReferenceValues(["PRODUCT_TYPE", "UNIT", "VACCINE_KIND", "VACCINE_STRAIN", "VACCINE_APPLICATION_MODE"]);
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
  const [diluyente, setDiluyente] = useState("");
  const [cepa, setCepa] = useState("");
  const [modoAplicacion, setModoAplicacion] = useState("");
  const [cepas, setCepas] = useState([]);
  const [modosAplicacion, setModosAplicacion] = useState([]);
  const [mostrarNuevaCepa, setMostrarNuevaCepa] = useState(false);
  const [mostrarNuevoModo, setMostrarNuevoModo] = useState(false);
  const [nuevaCepa, setNuevaCepa] = useState("");
  const [nuevoModo, setNuevoModo] = useState("");

  const [mostrarGenerales, setMostrarGenerales] = useState(false);
  const [mostrarInsumos, setMostrarInsumos] = useState(false);

  const [helpId, setHelpId] = useState("");
  const [mostrarGuardar, setMostrarGuardar] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const cancelarEdicion = () => { setEditingId(null); setTipoInventario(""); setIdProducto(""); setNombre(""); setUnidad(""); setEstado("Activo"); setPrecio(""); setCosto(""); setPresentacion(""); setEnfermedad(""); setDosis(""); setTipo(""); setDiluyente(""); setCepa(""); setModoAplicacion(""); setMostrarNuevaCepa(false); setMostrarNuevoModo(false); setNuevaCepa(""); setNuevoModo(""); setMostrarGenerales(false); setMostrarInsumos(false); setHelpId(""); setMostrarGuardar(false); setMostrarNuevaUnidad(false); setCodigoNuevaUnidad(""); setNombreNuevaUnidad(""); setAbreviaturaNuevaUnidad(""); };

  useEffect(() => { setUnidades(referencias.UNIT || []); }, [referencias.UNIT]);
  useEffect(() => { setCepas(referencias.VACCINE_STRAIN || []); }, [referencias.VACCINE_STRAIN]);
  useEffect(() => { setModosAplicacion(referencias.VACCINE_APPLICATION_MODE || []); }, [referencias.VACCINE_APPLICATION_MODE]);

  const agregarOpcionVacuna = async (catalogo, nombre, setOptions, setSelected, close, clear) => {
    if (!nombre.trim()) return;
    try {
      const nueva = await api("/catalogos/valores", {
        method: "POST", body: JSON.stringify({ catalogo, nombre: nombre.trim() }),
      });
      setOptions((current) => [...current, nueva].sort((a, b) => a.label.localeCompare(b.label, "es", { numeric: true })));
      setSelected(nueva.valueCode); close(false); clear("");
    } catch (error) { alert(error.message); }
  };

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
    if (value !== "VA") { setDiluyente(""); setCepa(""); setModoAplicacion(""); }
    if (value !== "VA") setTipo("");
    if (value === "VA") setPresentacion("");

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
        existenciaInicial: 0, costoEstandar: costo || 0, presentacion: tipoInventario === "VA" ? null : presentacion,
        enfermedadObjetivo: enfermedad, dosis, tipoVacuna: tipoInventario === "VA" ? (tipo || null) : null,
        diluyente: tipoInventario === "VA" ? diluyente === "SI" : null,
        cepa: tipoInventario === "VA" ? (cepa || null) : null,
        modoAplicacion: tipoInventario === "VA" ? (modoAplicacion || null) : null,
      }) });
      alert(`Producto ${saved.code} guardado correctamente`);
      setTipoInventario(""); setIdProducto(""); setNombre(""); setUnidad(""); setEstado("Activo");
      setPrecio(""); setCosto(""); setPresentacion(""); setEnfermedad(""); setDosis(""); setTipo("");
      setDiluyente(""); setCepa(""); setModoAplicacion(""); setMostrarNuevaCepa(false); setMostrarNuevoModo(false); setNuevaCepa(""); setNuevoModo("");
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

            {tipoInventario !== "VA" && <div style={{ flex: 1 }}>
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
            </div>}
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
                {tipoInventario === "VA" ? "Dosis por Frasco" : "Dosis"}
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

            {tipoInventario === "VA" && <div style={{ flex: 1 }}>
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
            </div>}
          </div>

          {tipoInventario === "VA" && <>
            <div style={rowStyle}>
              <div style={{ flex: 1 }}>
                <label>Diluyente</label>
                <select value={diluyente} onChange={(e) => setDiluyente(e.target.value)} style={inputStyle}>
                  <option value="">Seleccione</option>
                  <option value="SI">Sí</option>
                  <option value="NO">No</option>
                </select>
              </div>

              <div style={{ flex: 2 }}>
                <label>Cepa</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={cepa} onChange={(e) => setCepa(e.target.value)} style={inputStyle}>
                    <option value="">Seleccione</option>
                    {cepas.map((item) => <option key={item.valueCode} value={item.valueCode}>{item.label}</option>)}
                  </select>
                  <button type="button" onClick={() => setMostrarNuevaCepa(true)} title="Agregar cepa"
                    style={{ width: 42, height: 42, padding: 0, flexShrink: 0, fontSize: 20 }}>+</button>
                </div>
              </div>

              <div style={{ flex: 2 }}>
                <label>Modo de Aplicación</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={modoAplicacion} onChange={(e) => setModoAplicacion(e.target.value)} style={inputStyle}>
                    <option value="">Seleccione</option>
                    {modosAplicacion.map((item) => <option key={item.valueCode} value={item.valueCode}>{item.label}</option>)}
                  </select>
                  <button type="button" onClick={() => setMostrarNuevoModo(true)} title="Agregar modo de aplicación"
                    style={{ width: 42, height: 42, padding: 0, flexShrink: 0, fontSize: 20 }}>+</button>
                </div>
              </div>
            </div>

            {mostrarNuevaCepa && <div className="inline-add-row" style={{ marginBottom: 15 }}>
              <input value={nuevaCepa} onChange={(e) => setNuevaCepa(e.target.value)} placeholder="Nueva cepa" style={inputStyle} />
              <InlineAddActions
                onSave={() => agregarOpcionVacuna("VACCINE_STRAIN", nuevaCepa, setCepas, setCepa, setMostrarNuevaCepa, setNuevaCepa)}
                onCancel={() => { setMostrarNuevaCepa(false); setNuevaCepa(""); }}
              />
            </div>}

            {mostrarNuevoModo && <div className="inline-add-row" style={{ marginBottom: 15 }}>
              <input value={nuevoModo} onChange={(e) => setNuevoModo(e.target.value)} placeholder="Nuevo modo de aplicación" style={inputStyle} />
              <InlineAddActions
                onSave={() => agregarOpcionVacuna("VACCINE_APPLICATION_MODE", nuevoModo, setModosAplicacion, setModoAplicacion, setMostrarNuevoModo, setNuevoModo)}
                onCancel={() => { setMostrarNuevoModo(false); setNuevoModo(""); }}
              />
            </div>}
          </>}
        </div>
      )}

      {/* BOTÓN */}
      <div className="edit-actions">{mostrarGuardar && (<button
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
        </button>)}<CancelEditButton editing={editingId} onCancel={cancelarEdicion}/></div>
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
        setDiluyente(row.hasDiluent === true ? "SI" : row.hasDiluent === false ? "NO" : "");
        setCepa(row.vaccineStrainCode || ""); setModoAplicacion(row.applicationModeCode || "");
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
