import { useEffect, useState } from "react";

function ControlPesoHuevos() {

  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");

  const [lote] =
    useState("REP-260401-1600");

  const [muestras, setMuestras] = useState({
    m1: "",
    m2: "",
    m3: "",
    m4: "",
    m5: "",
    m6: "",
    m7: ""
  });

  const [promedio, setPromedio] =
    useState(0);

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
  // CALCULAR PROMEDIO
  // =========================

  useEffect(() => {

    let suma = 0;
    let count = 0;

    Object.values(muestras).forEach((val) => {

      const num = parseFloat(val);

      if (!isNaN(num)) {
        suma += num;
        count++;
      }
    });

    setPromedio(
      count > 0
        ? (suma / count).toFixed(2)
        : 0
    );

  }, [muestras]);

  // =========================
  // HANDLE INPUTS
  // =========================

  const handleChange = (e) => {

    setMuestras({
      ...muestras,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = () => {

    const data = {

      fecha,
      lote,
      ...muestras,
      promedio
    };

    console.log(data);

    alert("Registro de pesos guardado correctamente");
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
    marginBottom: "15px"
  };

  // =========================
  // RENDER
  // =========================

  return (

    <div
      className="form-container"
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h2>
        Registro de Pesos de Huevos
      </h2>

      {/* =========================
          FECHA Y LOTE
      ========================= */}
      <div style={rowStyle}>

        <div style={{ flex: 1 }}>

          <label>
            Fecha
          </label>

          <input
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(e.target.value)
            }
            style={inputStyle}
          />

        </div>

        <div style={{ flex: 1 }}>

          <label>
            # Lote
          </label>

          <select
            value={lote}
            disabled
            style={inputStyle}
          >

            <option>
              {lote}
            </option>

          </select>

        </div>

      </div>

      {/* =========================
          MUESTRAS 1 - 4
      ========================= */}
      <div style={rowStyle}>

        <div style={{ flex: 1 }}>
          <label>Peso Muestra 1</label>
          <input
            name="m1"
            type="number"
            step="0.01"
            value={muestras.m1}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label>Peso Muestra 2</label>
          <input
            name="m2"
            type="number"
            step="0.01"
            value={muestras.m2}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label>Peso Muestra 3</label>
          <input
            name="m3"
            type="number"
            step="0.01"
            value={muestras.m3}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label>Peso Muestra 4</label>
          <input
            name="m4"
            type="number"
            step="0.01"
            value={muestras.m4}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

      </div>

      {/* =========================
          MUESTRAS 5 - 7 + PROMEDIO
      ========================= */}
      <div style={rowStyle}>

        <div style={{ flex: 1 }}>
          <label>Peso Muestra 5</label>
          <input
            name="m5"
            type="number"
            step="0.01"
            value={muestras.m5}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label>Peso Muestra 6</label>
          <input
            name="m6"
            type="number"
            step="0.01"
            value={muestras.m6}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label>Peso Muestra 7</label>
          <input
            name="m7"
            type="number"
            step="0.01"
            value={muestras.m7}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label>Peso Promedio</label>
          <input
            type="number"
            value={promedio}
            readOnly
            style={inputStyle}
          />
        </div>

      </div>

      {/* BOTÓN */}
      <button
        onClick={guardar}
        style={{
          padding: "10px 20px",
          backgroundColor: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Guardar Registro
      </button>

    </div>
  );
}

export default ControlPesoHuevos;