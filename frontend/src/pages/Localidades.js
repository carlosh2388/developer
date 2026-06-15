import { useEffect, useState } from "react";

function Localidades() {
  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");
  const [idLocalidad, setIdLocalidad] = useState("");
  const [nombreLocalidad, setNombreLocalidad] = useState("");
  const [estatus, setEstatus] = useState("Activo");
  const [descripcion, setDescripcion] = useState("");

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      fecha,
      idLocalidad,
      nombreLocalidad,
      estatus,
      descripcion
    };

    console.log(data);

    alert(
      "Localidad guardada correctamente"
    );
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
        Guardar
      </button>
    </form>
  );
}

export default Localidades;
