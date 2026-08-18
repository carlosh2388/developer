import { useEffect, useState } from "react";
import { api } from "../services/api";
import ConfigRecordsTable from "../components/ConfigRecordsTable";
import { assertUniqueCode, useCatalogList } from "../hooks/useCatalogList";
import CancelEditButton from "../components/CancelEditButton";

function Bodegas() {
  const list = useCatalogList("/bodegas");
  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");
  const [idBodega, setIdBodega] = useState("");
  const [nombreBodega, setNombreBodega] = useState("");

  const [localidades, setLocalidades] = useState([]);

  const [localidad, setLocalidad] = useState("");
  const [estado, setEstado] = useState("Activo");
  const [descripcion, setDescripcion] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [mostrarNuevaLocalidad, setMostrarNuevaLocalidad] =
    useState(false);
  const [nuevaLocalidad, setNuevaLocalidad] =
    useState("");

  const cargarSiguienteCodigo = () => api("/bodegas/siguiente")
    .then((data) => setIdBodega(data.code))
    .catch((error) => alert(error.message));
  const cancelarEdicion = async () => { setEditingId(null); setNombreBodega(""); setLocalidad(""); setEstado("Activo"); setDescripcion(""); setNuevaLocalidad(""); setMostrarNuevaLocalidad(false); setFecha(new Date().toISOString().split("T")[0]); await cargarSiguienteCodigo(); };

  // =========================
  // FECHA AUTOMÁTICA
  // =========================

  useEffect(() => {
    const hoy = new Date()
      .toISOString()
      .split("T")[0];

    setFecha(hoy);
    api("/localidades").then((rows) => setLocalidades([...rows].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es", { sensitivity: "base", numeric: true })))).catch((error) => alert(error.message));
    cargarSiguienteCodigo();
  }, []);

  // =========================
  // NORMALIZAR ID
  // =========================

  // =========================
  // AGREGAR LOCALIDAD
  // =========================

  const agregarLocalidad = async () => {
    if (!nuevaLocalidad.trim()) return;
    try {
      const nueva = await api("/localidades", { method: "POST", body: JSON.stringify({
        codigo: `LOC-${Date.now().toString().slice(-6)}`, nombre: nuevaLocalidad.trim(), fechaApertura: fecha,
      }) });
      setLocalidades((current) => [...current, nueva].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es", { sensitivity: "base", numeric: true }))); setLocalidad(nueva.id);
      setNuevaLocalidad(""); setMostrarNuevaLocalidad(false);
    } catch (error) { alert(error.message); }
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      assertUniqueCode(list.rows, idBodega, "código de bodega", editingId);
      await api(editingId ? `/bodegas/${editingId}` : "/bodegas", { method: editingId ? "PUT" : "POST", body: JSON.stringify({
        fechaApertura: fecha, codigo: idBodega, nombre: nombreBodega, localidadId: localidad,
        estado: estado === "Activo" ? "ACTIVE" : "INACTIVE", descripcion,
      }) });
      alert("Bodega guardada correctamente");
      setNombreBodega(""); setLocalidad(""); setEstado("Activo"); setDescripcion("");
      setNuevaLocalidad(""); setMostrarNuevaLocalidad(false);
      setFecha(new Date().toISOString().split("T")[0]);
      setEditingId(null);
      await list.reload();
      await cargarSiguienteCodigo();
    } catch (error) { alert(error.message); }
  };

  // =========================
  // ESTILOS
  // =========================

  const inputStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    boxSizing: "border-box"
  };

  const rowStyle = {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
    alignItems: "flex-end"
  };

  const addButtonStyle = {
    width: "42px",
    height: "42px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#1976d2",
    color: "#fff",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: "bold",
    flexShrink: 0
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
      <h2>Registro de Bodega</h2>

      {/* FILA 1 */}
      <div style={rowStyle}>
        {/* FECHA */}
        <div style={{ flex: 1 }}>
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

        {/* LOCALIDAD */}
        <div style={{ flex: 2 }}>
          <label>Localidad</label>

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center"
            }}
          >
            <div style={{ flex: 1 }}>
              <select
                value={localidad}
                onChange={(e) =>
                  setLocalidad(
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="">
                  Seleccione
                </option>

                {localidades.map(
                  (loc) => (
                    <option
                      key={loc.id}
                      value={loc.id}
                    >
                      {loc.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {mostrarNuevaLocalidad && (
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={nuevaLocalidad}
                  onChange={(e) =>
                    setNuevaLocalidad(
                      e.target.value
                    )
                  }
                  placeholder="Nueva localidad"
                  style={inputStyle}
                />
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                mostrarNuevaLocalidad
                  ? agregarLocalidad()
                  : setMostrarNuevaLocalidad(
                      true
                    )
              }
              style={addButtonStyle}
            >
              +
            </button>
          </div>
        </div>

        {/* ESTADO */}
        <div style={{ flex: 1 }}>
          <label>Estado</label>
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
        {/* ID BODEGA */}
        <div style={{ flex: 1 }}>
          <label>Id Bodega</label>
          <input
            type="text"
            value={idBodega}
            placeholder="BO01 Automático"
            readOnly
            aria-readonly="true"
            style={inputStyle}
          />
        </div>

        {/* NOMBRE BODEGA */}
        <div style={{ flex: 2 }}>
          <label>
            Nombre de la Bodega
          </label>
          <input
            type="text"
            value={nombreBodega}
            onChange={(e) =>
              setNombreBodega(
                e.target.value
              )
            }
            style={inputStyle}
          />
        </div>
      </div>

      {/* FILA 3 */}
      <div
        style={{
          marginBottom: "20px"
        }}
      >
        <label>
          Descripción (opcional)
        </label>
        <input
          type="text"
          value={descripcion}
          onChange={(e) =>
            setDescripcion(
              e.target.value
            )
          }
          style={inputStyle}
        />
      </div>

      {/* BOTÓN */}
      <div className="edit-actions"><button
        type="submit"
        style={{
          padding: "10px 20px",
          backgroundColor:
            "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        {editingId ? "Guardar cambios" : "Guardar"}
      </button><CancelEditButton editing={editingId} onCancel={cancelarEdicion}/></div>
      <ConfigRecordsTable title="Bodegas registradas" rows={list.rows} loading={list.loading} error={list.error} dateField="openedOn" columns={[
        { key: "code", label: "Código" }, { key: "name", label: "Bodega" }, { key: "openedOn", label: "Apertura" },
        { key: "description", label: "Descripción" }, { key: "status", label: "Estado" },
      ]} onEdit={(row) => { setEditingId(row.id); setIdBodega(row.code); setNombreBodega(row.name); setFecha(row.openedOn?.slice(0, 10) || ""); setLocalidad(row.locationId || ""); setEstado(row.status === "INACTIVE" ? "Inactivo" : "Activo"); setDescripcion(row.description || ""); }} onDeactivate={async (row) => {
        if (!window.confirm(`¿Deseas dar de baja la bodega ${row.name}?`)) return;
        try { await api(`/bodegas/${row.id}`, { method: "PUT", body: JSON.stringify({ estado: "INACTIVE" }) }); await list.reload(); }
        catch (error) { alert(error.message); }
      }}/>
    </form>
  );
}

export default Bodegas;
