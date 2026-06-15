import { useEffect, useState } from "react";

function Bodegas() {
  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");
  const [idBodega, setIdBodega] = useState("");
  const [nombreBodega, setNombreBodega] = useState("");
  const [localidad, setLocalidad] = useState("Seleccione");
  const [estado, setEstado] = useState("Activo");
  const [descripcion, setDescripcion] = useState("");

  // =========================
  // FECHA AUTOMÁTICA
  // =========================

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];
    setFecha(hoy);
  }, []);

  // =========================
  // NORMALIZAR ID
  // =========================

  const handleIdBodega = (e) => {
    setIdBodega(e.target.value.toUpperCase());
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      fecha,
      idBodega,
      nombreBodega,
      localidad,
      estado,
      descripcion
    };

    console.log(data);
    alert("Bodega guardada correctamente");
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
            onChange={(e) => setFecha(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* LOCALIDAD */}
        <div style={{ flex: 1 }}>
          <label>Localidad</label>
          <select
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
            style={inputStyle}
          >
            <option value="Seleccione">Seleccione</option>
            <option value="Granja">Granja</option>
            <option value="Incubadora">Incubadora</option>
          </select>
        </div>

        {/* ESTADO */}
        <div style={{ flex: 1 }}>
          <label>Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            style={inputStyle}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* FILA 2: ID + NOMBRE (ID primero) */}
      <div style={rowStyle}>
        {/* ID BODEGA */}
        <div style={{ flex: 1 }}>
          <label>Id Bodega</label>
          <input
            type="text"
            value={idBodega}
            onChange={handleIdBodega}
            placeholder="BOD-XXX"
            style={inputStyle}
          />
        </div>

        {/* NOMBRE BODEGA */}
        <div style={{ flex: 2 }}>
          <label>Nombre de la Bodega</label>
          <input
            type="text"
            value={nombreBodega}
            onChange={(e) => setNombreBodega(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* FILA 3: DESCRIPCIÓN */}
      <div style={{ marginBottom: "20px" }}>
        <label>Descripción (opcional)</label>
        <input
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          style={inputStyle}
        />
      </div>

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
        Guardar
      </button>
    </form>
  );
}

export default Bodegas;
