import { useEffect, useState } from "react";

function Bodegas() {
  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");
  const [idBodega, setIdBodega] = useState("");
  const [nombreBodega, setNombreBodega] = useState("");

  const [localidades, setLocalidades] = useState([
    "Granja",
    "Incubadora"
  ]);

  const [localidad, setLocalidad] = useState("Seleccione");
  const [estado, setEstado] = useState("Activo");
  const [descripcion, setDescripcion] = useState("");

  const [mostrarNuevaLocalidad, setMostrarNuevaLocalidad] =
    useState(false);
  const [nuevaLocalidad, setNuevaLocalidad] =
    useState("");

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
  // NORMALIZAR ID
  // =========================

  const handleIdBodega = (e) => {
    setIdBodega(
      e.target.value.toUpperCase()
    );
  };

  // =========================
  // AGREGAR LOCALIDAD
  // =========================

  const agregarLocalidad = () => {
    if (!nuevaLocalidad.trim()) return;

    const nueva =
      nuevaLocalidad.trim();

    if (!localidades.includes(nueva)) {
      setLocalidades([
        ...localidades,
        nueva
      ]);
    }

    setLocalidad(nueva);
    setNuevaLocalidad("");
    setMostrarNuevaLocalidad(false);
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
                <option value="Seleccione">
                  Seleccione
                </option>

                {localidades.map(
                  (loc, index) => (
                    <option
                      key={index}
                      value={loc}
                    >
                      {loc}
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
            onChange={
              handleIdBodega
            }
            placeholder="BO01 Automático"
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
      <button
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
        Guardar
      </button>
    </form>
  );
}

export default Bodegas;
