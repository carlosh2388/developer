import { useEffect, useState } from "react";

function Localidades() {

  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");

  const [bodega, setBodega] = useState("");

  const [idLocalidad, setIdLocalidad] = useState("");

  const [nombreLocalidad, setNombreLocalidad] = useState("");

  const [estatus, setEstatus] = useState("Activo");

  const [placeholder, setPlaceholder] =
    useState("Ej: TRA, INV, HIN...");

  // =========================
  // CATÁLOGOS
  // =========================

  const localidadesBI = [
    "TRA",
    "HIN",
    "HCO",
    "VYA",
    "PB1",
    "PB2",
    "PBV",
    "PBD",
    "PR1",
    "PR2",
    "PRV",
    "PRD",
    "VMA"
  ];

  const localidadesGenerales = [
    "TRA",
    "INV"
  ];

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
  // CAMBIO BODEGA
  // =========================

  const handleBodega = (e) => {

    const value = e.target.value;

    setBodega(value);

    if (value === "BI") {

      setPlaceholder(
        "TRA, HIN, HCO, VYA..."
      );

    } else {

      setPlaceholder("TRA o INV");
    }
  };

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

    let valido = false;

    if (bodega === "BI") {

      valido =
        localidadesBI.includes(idLocalidad);

    } else {

      valido =
        localidadesGenerales.includes(
          idLocalidad
        );
    }

    if (!valido) {

      alert(
        "Localidad no válida para la bodega seleccionada"
      );

      return;
    }

    const data = {
      fecha,
      bodega,
      idLocalidad,
      nombreLocalidad,
      estatus
    };

    console.log(data);

    alert("Localidad guardada correctamente");
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

      <h2>Registro de Localidades</h2>

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

          <label>ID de Localidad</label>

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

        <label>Nombre de la Localidad</label>

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

      {/* BODEGA */}
      <div style={{ marginBottom: "15px" }}>

        <label>Nombre de la Bodega</label>

        <select
          value={bodega}
          onChange={handleBodega}
          style={inputStyle}
        >

          <option value="">
            Seleccione
          </option>

          <option value="BI">
            BI - Bodega de Incubadora
          </option>

          <option value="BA">
            BA - Bodega de Alimento
          </option>

          <option value="BH">
            BH - Bodega de Huevo
          </option>

          <option value="BGR">
            BGR - Bodega de Granja de Reproducción
          </option>

        </select>

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