import { useEffect, useState } from "react";

function ControlPesoHuevos() {
  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");
  const [lote, setLote] = useState("");
  const [semana, setSemana] = useState("");

  const [numMuestras, setNumMuestras] = useState(0);

  const [promedio, setPromedio] = useState(0);
  const [uniformidad, setUniformidad] = useState(0);

  const [filas, setFilas] = useState([]);

  // =========================
  // FECHA AUTOMÁTICA
  // =========================

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];
    setFecha(hoy);
  }, []);

  // =========================
  // CREAR FILAS DINÁMICAS
  // =========================

  useEffect(() => {
    const nuevas = [];

    for (let i = 0; i < numMuestras; i++) {
      nuevas.push({
        id: i,
        pesoCaja: "",
        material: "",
        pesoMaterial: "",
        pesoUnitario: ""
      });
    }

    setFilas(nuevas);
  }, [numMuestras]);

  // =========================
  // ACTUALIZAR FILA
  // =========================

 const handleChange = (
  index,
  field,
  value
) => {

  const copy = [...filas];

  const fila = {
    ...copy[index]
  };

  fila[field] = value;

  // Material seleccionado
  if (fila.material === "Cartones 360") {

    fila.pesoMaterial = 1150;

  } else if (
    fila.material === "Bandejas 336"
  ) {

    fila.pesoMaterial = 1050;

  } else {

    fila.pesoMaterial = "";
  }

  // Calcular peso unitario
  const pesoCaja =
    parseFloat(fila.pesoCaja) || 0;

  const pesoMaterial =
    parseFloat(fila.pesoMaterial) || 0;

  const factor =
    fila.material === "Cartones 360"
      ? 360
      : fila.material === "Bandejas 336"
      ? 336
      : 0;

  fila.pesoUnitario =
    pesoCaja > 0 && factor > 0
      ? (
          (pesoCaja - pesoMaterial) /
          factor
        ).toFixed(2)
      : "";

  copy[index] = fila;

  setFilas(copy);
};

  // =========================
  // PROMEDIO GENERAL
  // =========================

  useEffect(() => {
    const vals = filas
      .map((f) => parseFloat(f.pesoUnitario))
      .filter((v) => !isNaN(v));

    const avg =
      vals.length > 0
        ? vals.reduce((a, b) => a + b, 0) /
          vals.length
        : 0;

    setPromedio(avg.toFixed(2));
  }, [filas]);


  // =========================
// UNIFORMIDAD ±10%
// =========================

useEffect(() => {
  const valores = filas
    .map((f) => parseFloat(f.pesoUnitario))
    .filter((v) => !isNaN(v));

  const prom = parseFloat(promedio);

  if (!valores.length || !prom) {
    setUniformidad(0);
    return;
  }

  const min = prom * 0.9;
  const max = prom * 1.1;

  const dentroRango = valores.filter(
    (v) => v >= min && v <= max
  ).length;

  setUniformidad(
    (
      (dentroRango / valores.length) *
      100
    ).toFixed(2)
  );
}, [filas, promedio]);
  
  // =========================
  // GUARDAR
  // =========================

  const guardar = () => {
console.log({
  fecha,
  lote,
  semana,
  numMuestras,
  promedio,
  uniformidad,
  filas
});

    alert("Registro guardado correctamente");
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
      style={{
        maxWidth: "900px",
        margin: "auto",
        fontFamily: "Arial",
        padding: "20px"
      }}
    >
      <h2>Control Peso Huevos</h2>

      {/* =========================
          FECHA / LOTE / SEMANA
      ========================= */}

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label>Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ flex: 1 }}>
          <label># Lote</label>
        
          <select
            value={lote}
            onChange={(e) =>
              setLote(e.target.value)
            }
            style={inputStyle}
          >
            <option value="">
              Seleccione
            </option>
        
            <option value="SL-001">
              SL-001
            </option>
        
            <option value="BL-001">
              BL-001
            </option>
        
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label>Semana</label>
          <input
            type="number"
            value={semana}
            onChange={(e) => setSemana(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

{/* =========================
    MUESTRAS + PROMEDIO + UNIFORMIDAD
========================= */}

<div style={rowStyle}>
  <div style={{ flex: 1 }}>
    <label>Número de Muestras</label>

    <input
      type="number"
      value={numMuestras}
      onChange={(e) =>
        setNumMuestras(
          Number(e.target.value)
        )
      }
      style={inputStyle}
    />
  </div>

  <div style={{ flex: 1 }}>
    <label>Peso Promedio</label>

    <input
      value={promedio}
      readOnly
      style={inputStyle}
    />
  </div>

  <div style={{ flex: 1 }}>
    <label>Uniformidad (%)</label>

    <input
      value={uniformidad}
      readOnly
      style={inputStyle}
    />
  </div>
</div>

      {/* =========================
          TABLA DINÁMICA
      ========================= */}

      {filas.map((fila, i) => (
        <div key={i} style={rowStyle}>
          {/* PESO CAJA */}
          <div style={{ flex: 1 }}>
            <label>Peso Caja</label>
            <input
              type="number"
              value={fila.pesoCaja}
              onChange={(e) =>
                handleChange(i, "pesoCaja", e.target.value)
              }
              style={inputStyle}
            />
          </div>

          {/* MATERIAL */}
          <div style={{ flex: 1 }}>
            <label>Material de Empaque</label>
            <select
              value={fila.material}
              onChange={(e) =>
                handleChange(i, "material", e.target.value)
              }
              style={inputStyle}
            >
              <option value="">Seleccione</option>
              <option value="Cartones 360">
                Caja de Cartones 360
              </option>
              <option value="Bandejas 336">
                Caja de Bandejas 336
              </option>
            </select>
          </div>

          {/* PESO MATERIAL */}
          <div style={{ flex: 1 }}>
            <label>Peso Material (g)</label>
            <input value={fila.pesoMaterial} readOnly style={inputStyle} />
          </div>

          {/* PESO UNITARIO */}
          <div style={{ flex: 1 }}>
            <label>Peso Unitario</label>
            <input value={fila.pesoUnitario} readOnly style={inputStyle} />
          </div>
        </div>
      ))}

      {/* =========================
          GUARDAR
      ========================= */}

      <button
        onClick={guardar}
        style={{
          padding: "10px 20px",
          backgroundColor: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: 15
        }}
      >
        Guardar Registro
      </button>
    </div>
  );
}

export default ControlPesoHuevos;
