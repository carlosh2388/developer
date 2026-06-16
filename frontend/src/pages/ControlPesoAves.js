import { useEffect, useState } from "react";

function ControlPesoAves() {

  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");

  const [lote] = useState("REP-260401-1600");

  const [semana] = useState(1);

  const [etapa, setEtapa] = useState("");

  const [nuevaEtapa, setNuevaEtapa] =
    useState("");

  const [mostrarNuevaEtapa,
    setMostrarNuevaEtapa] =
    useState(false);

  const [etapas, setEtapas] =
    useState([]);

  const [tamanoMuestra,
    setTamanoMuestra] =
    useState("");

  const [promHembras,
    setPromHembras] =
    useState(0);

  const [promMachos,
    setPromMachos] =
    useState(0);

  const [promedioGeneral,
    setPromedioGeneral] =
    useState(0);

  const [uniformidad,
    setUniformidad] =
    useState(0);

  // =========================
  // EXPANDIR / CONTRAER
  // =========================

  const [mostrarHembras,
    setMostrarHembras] =
    useState(true);

  const [mostrarMachos,
    setMostrarMachos] =
    useState(true);

  // =========================
  // MUESTRAS DINÁMICAS
  // =========================

  const [hembras,
    setHembras] =
    useState([]);

  const [machos,
    setMachos] =
    useState([]);

  // =========================
  // FECHA INICIAL
  // =========================

  useEffect(() => {

    const hoy =
      new Date()
        .toISOString()
        .split("T")[0];

    setFecha(hoy);

    setEtapas([
      "Crianza",
      "Levante",
      "Producción"
    ]);

  }, []);

  // =========================
  // GENERAR MUESTRAS
  // =========================

  useEffect(() => {

    const total =
      parseInt(
        tamanoMuestra || 0
      );

    if (
      isNaN(total) ||
      total <= 0
    ) {

      setHembras([]);
      setMachos([]);

      return;

    }

    const mitad =
      Math.floor(total / 2);

    setHembras(
      Array(mitad).fill("")
    );

    setMachos(
      Array(mitad).fill("")
    );

  }, [tamanoMuestra]);

  // =========================
  // CALCULAR PROMEDIO
  // =========================

  const calcularPromedio =
    (lista) => {

      const numeros =
        lista
          .map(v =>
            parseFloat(v)
          )
          .filter(v =>
            !isNaN(v)
          );

      if (
        numeros.length === 0
      )
        return 0;

      const suma =
        numeros.reduce(
          (a, b) => a + b,
          0
        );

      return (
        suma /
        numeros.length
      ).toFixed(2);

    };

  // =========================
  // PROMEDIO HEMBRAS
  // =========================

  useEffect(() => {

    setPromHembras(
      calcularPromedio(
        hembras
      )
    );

  }, [hembras]);

  // =========================
  // PROMEDIO MACHOS
  // =========================

  useEffect(() => {

    setPromMachos(
      calcularPromedio(
        machos
      )
    );

  }, [machos]);

  // =========================
  // PROMEDIO GENERAL
  // =========================

  useEffect(() => {

    const h =
      Number(promHembras);

    const m =
      Number(promMachos);

    if (
      h > 0 &&
      m > 0
    ) {

      setPromedioGeneral(
        (
          (h + m) / 2
        ).toFixed(2)
      );

    }
    else if (h > 0) {

      setPromedioGeneral(
        h.toFixed(2)
      );

    }
    else if (m > 0) {

      setPromedioGeneral(
        m.toFixed(2)
      );

    }
    else {

      setPromedioGeneral(0);

    }

  }, [
    promHembras,
    promMachos
  ]);

  // =========================
  // HANDLERS
  // =========================

  const handleHembra =
    (index, value) => {

      const copia =
        [...hembras];

      copia[index] =
        value;

      setHembras(
        copia
      );

    };

  const handleMacho =
    (index, value) => {

      const copia =
        [...machos];

      copia[index] =
        value;

      setMachos(
        copia
      );

    };

  // =========================
  // UNIFORMIDAD AUTOMÁTICA
  // ±10% DEL PROMEDIO GENERAL
  // =========================

  useEffect(() => {

    const promedio =
      Number(promedioGeneral);

    if (promedio <= 0) {

      setUniformidad(0);

      return;

    }

    const limiteInferior =
      promedio * 0.90;

    const limiteSuperior =
      promedio * 1.10;

    const todasLasMuestras = [

      ...hembras,
      ...machos

    ]
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));

    if (
      todasLasMuestras.length === 0
    ) {

      setUniformidad(0);

      return;

    }

    const dentroRango =
      todasLasMuestras.filter(v =>
        v >= limiteInferior &&
        v <= limiteSuperior
      ).length;

    const porcentaje =
      (
        (dentroRango /
          todasLasMuestras.length) *
        100
      ).toFixed(2);

    setUniformidad(
      porcentaje
    );

  }, [
    hembras,
    machos,
    promedioGeneral
  ]);

  // =========================
  // AGREGAR ETAPA
  // =========================

  const agregarEtapa = () => {

    if (!mostrarNuevaEtapa) {

      setMostrarNuevaEtapa(
        true
      );

      return;

    }

    if (
      !nuevaEtapa.trim()
    )
      return;

    setEtapas(prev => [

      ...prev,
      nuevaEtapa

    ]);

    setEtapa(
      nuevaEtapa
    );

    setNuevaEtapa("");

    setMostrarNuevaEtapa(
      false
    );

  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = () => {

    const data = {

      fecha,
      lote,
      semana,

      etapa,

      tamanoMuestra,

      promedioGeneral,

      uniformidad,

      promHembras,

      promMachos,

      hembras,

      machos

    };

    console.log(data);

    alert(
      "Registro guardado correctamente"
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

    marginBottom: "15px"

  };

  const botonExpandir = {

    padding: "5px 12px",

    background: "#1976d2",

    color: "#fff",

    border: "none",

    borderRadius: "5px",

    cursor: "pointer"

  };

  // =========================
  // RENDER
  // =========================

  return (

    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h2>
        Registro de Pesos de Aves
      </h2>

      {/* =====================
          FECHA + LOTE + SEMANA
      ===================== */}

      <div style={rowStyle}>

        <div style={{ flex: 1 }}>

          <label>
            Fecha
          </label>

          <input
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(
                e.target.value
              )
            }
            style={inputStyle}
          />

        </div>

        <div style={{ flex: 1 }}>

          <label>
            # Lote
          </label>

          <select
            disabled
            style={inputStyle}
          >

            <option>
              {lote}
            </option>

          </select>

        </div>

        <div style={{ flex: 1 }}>

          <label>
            Semana
          </label>

          <input
            value={semana}
            readOnly
            style={inputStyle}
          />

        </div>

      </div>

      {/* =====================
           ETAPA
      ===================== */}

      <div style={rowStyle}>

        <div style={{ flex: 2 }}>

          <label>
            Etapa
          </label>

          <div
            style={{
              display: "flex",
              gap: "10px"
            }}
          >

            <select
              value={etapa}
              onChange={(e) =>
                setEtapa(
                  e.target.value
                )
              }
              style={inputStyle}
            >

              <option value="">
                Seleccione
              </option>

              {etapas.map(
                (item, i) => (
                  <option
                    key={i}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}

            </select>

            {mostrarNuevaEtapa && (

              <input
                value={nuevaEtapa}
                onChange={(e) =>
                  setNuevaEtapa(
                    e.target.value
                  )
                }
                placeholder="Nueva etapa"
                style={inputStyle}
              />

            )}

            <button
              type="button"
              onClick={agregarEtapa}
              style={botonExpandir}
            >

              {mostrarNuevaEtapa
                ? "Guardar"
                : "+"}

            </button>

          </div>

        </div>

        {/* =====================
            TAMAÑO DE MUESTRA
        ===================== */}

        <div style={{ flex: 1 }}>

          <label>
            Tamaño de la Muestra
          </label>

          <input
            type="number"
            value={tamanoMuestra}
            onChange={(e) =>
              setTamanoMuestra(
                e.target.value
              )
            }
            style={inputStyle}
            placeholder="Ej: 20, 50, 100"
          />

        </div>

        {/* =====================
            PROMEDIO GENERAL
        ===================== */}

        <div style={{ flex: 1 }}>

          <label>
            Promedio General
          </label>

          <input
            value={promedioGeneral}
            readOnly
            style={inputStyle}
          />

        </div>

        {/* =====================
            % UNIFORMIDAD
        ===================== */}

        <div style={{ flex: 1 }}>

          <label>
            % Uniformidad
          </label>

          <input
            value={uniformidad}
            readOnly
            style={inputStyle}
          />

        </div>

      </div>

      {/* =====================
          HEMBRAS HEADER
      ===================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "20px"
        }}
      >

        <h3>
          Hembras
        </h3>

        <div style={{
          display: "flex",
          gap: "10px",
          alignItems: "center"
        }}>

          <strong>
            Promedio:
          </strong>

          <span>
            {promHembras}
          </span>

          <button
            type="button"
            onClick={() =>
              setMostrarHembras(true)
            }
            style={botonExpandir}
          >
            +
          </button>

          <button
            type="button"
            onClick={() =>
              setMostrarHembras(false)
            }
            style={{
              ...botonExpandir,
              background: "#999"
            }}
          >
            -
          </button>

        </div>

      </div>

      {/* =====================
          HEMBRAS MUESTRAS
      ===================== */}

      {mostrarHembras && (

        <div>
        {/* =====================
            GRID HEMBRAS (5 POR FILA)
        ===================== */}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>

          {hembras.map((valor, i) => (
            <div
              key={i}
              style={{ width: "18%" }}
            >
              <label>M {i + 1}</label>

              <input
                type="number"
                value={valor}
                onChange={(e) =>
                  handleHembra(i, e.target.value)
                }
                style={inputStyle}
              />
            </div>
          ))}

        </div>

      )}

      {/* =====================
          MACHOS HEADER
      ===================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "25px"
        }}
      >

        <h3>
          Machos
        </h3>

        <div style={{
          display: "flex",
          gap: "10px",
          alignItems: "center"
        }}>

          <strong>Promedio:</strong>
          <span>{promMachos}</span>

          <button
            type="button"
            onClick={() =>
              setMostrarMachos(true)
            }
            style={botonExpandir}
          >
            +
          </button>

          <button
            type="button"
            onClick={() =>
              setMostrarMachos(false)
            }
            style={{
              ...botonExpandir,
              background: "#999"
            }}
          >
            -
          </button>

        </div>

      </div>

      {/* =====================
          MACHOS GRID
      ===================== */}

      {mostrarMachos && (

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>

          {machos.map((valor, i) => (
            <div
              key={i}
              style={{ width: "18%" }}
            >
              <label>M {i + 1}</label>

              <input
                type="number"
                value={valor}
                onChange={(e) =>
                  handleMacho(i, e.target.value)
                }
                style={inputStyle}
              />
            </div>
          ))}

        </div>

      )}

      {/* =====================
          BOTÓN GUARDAR
      ===================== */}

      <div style={{ marginTop: "25px" }}>

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

    </div>
  );
}

export default ControlPesoAves;

    
