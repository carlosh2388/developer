import { useEffect, useState } from "react";
import { api } from "../services/api";
import ConfigRecordsTable from "../components/ConfigRecordsTable";
import { assertUniqueCode, useCatalogList } from "../hooks/useCatalogList";

function Localidades() {
  const list = useCatalogList("/localidades");
  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");
  const [idLocalidad, setIdLocalidad] = useState("");
  const [nombreLocalidad, setNombreLocalidad] = useState("");
  const [estatus, setEstatus] = useState("Activo");
  const [descripcion, setDescripcion] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [placeholder] =
    useState("LOC-XXX");

  // =========================
  // FECHA AUTOMÁTICA
  // =========================

  useEffect(() => {
    const hoy = new Date()
      .toISOString()
      .split("T")[0];

    setFecha(hoy);
  }, []);

  // =========================
  // NORMALIZAR LOCALIDAD
  // =========================

  const handleIdLocalidad = (e) => {
    setIdLocalidad(
      e.target.value.toUpperCase()
    );
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      assertUniqueCode(list.rows, idLocalidad, "código de localidad", editingId);
      await api(editingId ? `/localidades/${editingId}` : "/localidades", { method: editingId ? "PUT" : "POST", body: JSON.stringify({
        codigo: idLocalidad, nombre: nombreLocalidad, fechaApertura: fecha,
        estado: estatus === "Activo" ? "ACTIVE" : "INACTIVE", descripcion,
      }) });
      alert("Localidad guardada correctamente");
      setIdLocalidad(""); setNombreLocalidad(""); setDescripcion("");
      setEstatus("Activo");
      setFecha(new Date().toISOString().split("T")[0]);
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
        Registro de Localidades
      </h2>

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

        {/* ID LOCALIDAD */}
        <div style={{ flex: 1 }}>
          <label>
            ID de Localidad
          </label>

          <input
            type="text"
            value={idLocalidad}
            onChange={handleIdLocalidad}
            placeholder={placeholder}
            style={inputStyle}
          />
        </div>

        {/* ESTATUS */}
        <div style={{ flex: 1 }}>
          <label>Estatus</label>

          <select
            value={estatus}
            onChange={(e) =>
              setEstatus(e.target.value)
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

      {/* NOMBRE LOCALIDAD */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          Nombre de la Localidad
        </label>

        <input
          type="text"
          value={nombreLocalidad}
          onChange={(e) =>
            setNombreLocalidad(
              e.target.value
            )
          }
          style={inputStyle}
        />
      </div>

      {/* DESCRIPCIÓN */}
      <div style={{ marginBottom: "15px" }}>
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

      <br />
      <br />

      {/* BOTÓN */}
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
      <ConfigRecordsTable title="Localidades registradas" rows={list.rows} loading={list.loading} error={list.error} dateField="openedOn" columns={[
        { key: "code", label: "Código" }, { key: "name", label: "Localidad" }, { key: "openedOn", label: "Apertura" },
        { key: "description", label: "Descripción" }, { key: "status", label: "Estado" },
      ]} onEdit={(row) => { setEditingId(row.id); setIdLocalidad(row.code); setNombreLocalidad(row.name); setFecha(row.openedOn?.slice(0, 10) || ""); setEstatus(row.status === "INACTIVE" ? "Inactivo" : "Activo"); setDescripcion(row.description || ""); }} onDeactivate={async (row) => {
        if (!window.confirm(`¿Deseas dar de baja la localidad ${row.name}?`)) return;
        try { await api(`/localidades/${row.id}`, { method: "PUT", body: JSON.stringify({ estado: "INACTIVE" }) }); await list.reload(); }
        catch (error) { alert(error.message); }
      }}/>
    </form>
  );
}

export default Localidades;
