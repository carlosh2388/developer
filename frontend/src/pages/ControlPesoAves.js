import { useEffect, useState } from "react";

function ControlPesoAves() {

  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");

  const [lote] = useState("REP-260401-1600");

  const [etapa, setEtapa] = useState("");

  const [nuevaEtapa, setNuevaEtapa] = useState("");

  const [mostrarNuevaEtapa,
    setMostrarNuevaEtapa] = useState(false);

  const [semana] = useState(1);

  const [uniformidad, setUniformidad] = useState("");

  const [tamanoMuestra,
    setTamanoMuestra] = useState("");

  const [promedioGeneral,
    setPromedioGeneral] = useState(0);

  const [etapas, setEtapas] = useState([]);

  // =========================
  // PESOS HEMBRAS
  // =========================

  const [hembras, setHembras] = useState({
    m1: "",
    m2: "",
    m3: "",
    m4: "",
    m5: "",
    m6: "",
    m7: ""
  });

  const [promHembras,
    setPromHembras] = useState(0);

  // =========================
  // PESOS MACHOS
  // =========================

  const [machos, setMachos] = useState({
    m1: "",
    m2: "",
    m3: "",
    m4: "",
    m5: "",
    m6: "",
    m7: ""
  });

  const [promMachos,
    setPromMachos] = useState(0);

  // =========================
  // FECHA + ETAPAS BASE
  // =========================

  useEffect(() => {

    const hoy = new Date()
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
  // CALCULAR PROMEDIOS
  // =========================

  const calcularPromedio = (obj) => {

    let suma = 0;

    let count = 0;

    Object.values(obj).forEach(v => {

      const num = parseFloat(v);

      if (!isNaN(num)) {

        suma += num;
        count++;

      }

    });

    return count > 0
      ? (suma / count).toFixed(2)
      : 0;
  };

  useEffect(() => {

    setPromHembras(
      calcularPromedio(hembras)
    );

  }, [hembras]);

  useEffect(() => {

    setPromMachos(
      calcularPromedio(machos)
    );

  }, [machos]);

  // =========================
  // PROMEDIO GENERAL
  // =========================

  useEffect(() => {

    const hem =
      parseFloat(promHembras) || 0;

    const mac =
      parseFloat(promMachos) || 0;

    if (hem > 0 && mac > 0) {

      setPromedioGeneral(
        ((hem + mac) / 2).toFixed(2)
      );

    } else if (hem > 0) {

      setPromedioGeneral(
        hem.toFixed(2)
      );

    } else if (mac > 0) {

      setPromedioGeneral(
        mac.toFixed(2)
      );

    } else {

      setPromedioGeneral(0);

    }

  }, [promHembras, promMachos]);

  // =========================
  // HANDLERS
  // =========================

  const handleHembras = (e) => {

    setHembras({
      ...hembras,
      [e.target.name]:
        e.target.value
    });

  };

  const handleMachos = (e) => {

    setMachos({
      ...machos,
      [e.target.name]:
        e.target.value
    });

  };

  // =========================
  // AGREGAR ETAPA
  // =========================

  const agregarEtapa = () => {

    if (!mostrarNuevaEtapa) {

      setMostrarNuevaEtapa(true);

      return;

    }

    if (!nuevaEtapa.trim()) return;

    setEtapas(prev => [
      ...prev,
      nuevaEtapa
    ]);

    setEtapa(nuevaEtapa);

    setNuevaEtapa("");

    setMostrarNuevaEtapa(false);

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
      hembras,
      promHembras,
      machos,
      promMachos

    };

    console.log(data);

    alert(
      "Registro de pesos guardado correctamente"
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

  // =========================
  // RENDER
  // =========================

  return (

    <div
      className="form-container"
      style={{
        maxWidth: "950px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h2>
        Registro de Pesos de Aves
      </h2>

      {/* =========================
          FECHA + LOTE + SEMANA
      ========================= */}

      <div style={rowStyle}>

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

        <div style={{ flex: 1 }}>

          <label># Lote</label>

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

          <label>Semana</label>

          <input
            type="number"
            value={semana}
            readOnly
            style={inputStyle}
          />

        </div>

      </div>

      {/* =========================
          ETAPA + TAMAÑO MUESTRA +
          PROMEDIO GENERAL +
          UNIFORMIDAD
      ========================= */}

      <div style={rowStyle}>

        {/* ETAPA */}

        <div style={{ flex: 2 }}>

          <label>Etapa</label>

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center"
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

              {etapas.map((e, i) => (

                <option
                  key={i}
                  value={e}
                >
                  {e}
                </option>

              ))}

            </select>

            {mostrarNuevaEtapa && (

              <input
                type="text"
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
              style={{
                padding: "8px 12px",
                cursor: "pointer"
              }}
            >
              {mostrarNuevaEtapa
                ? "Guardar"
                : "+"}
            </button>

          </div>

        </div>

        {/* TAMAÑO MUESTRA */}

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
          />

        </div>

        {/* PROMEDIO GENERAL */}

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

        {/* UNIFORMIDAD */}

        <div style={{ flex: 1 }}>

          <label>
            % Uniformidad
          </label>

          <input
            type="number"
            value={uniformidad}
            onChange={(e) =>
              setUniformidad(
                e.target.value
              )
            }
            style={inputStyle}
          />

        </div>

      </div>

      {/* =========================
          HEMBRAS
      ========================= */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginTop: "20px"
        }}
      >

        <h3>
          Hembras
        </h3>

        <div>

          <strong>
            Promedio:
          </strong>{" "}
          {promHembras}

        </div>

      </div>

      <div style={rowStyle}>

        {[1, 2, 3, 4].map(i => (

          <div
            key={i}
            style={{ flex: 1 }}
          >

            <label>
              Muestra {i}
            </label>

            <input
              name={`m${i}`}
              type="number"
              onChange={
                handleHembras
              }
              style={inputStyle}
            />

          </div>

        ))}

      </div>

      <div style={rowStyle}>

        {[5, 6, 7].map(i => (

          <div
            key={i}
            style={{ flex: 1 }}
          >

            <label>
              Muestra {i}
            </label>

            <input
              name={`m${i}`}
              type="number"
              onChange={
                handleHembras
              }
              style={inputStyle}
            />

          </div>

        ))}

      </div>

      {/* =========================
          MACHOS
      ========================= */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginTop: "20px"
        }}
      >

        <h3>
          Machos
        </h3>

        <div>

          <strong>
            Promedio:
          </strong>{" "}
          {promMachos}

        </div>

      </div>

      <div style={rowStyle}>

        {[1, 2, 3, 4].map(i => (

          <div
            key={i}
            style={{ flex: 1 }}
          >

            <label>
              Muestra {i}
            </label>

            <input
              name={`m${i}`}
              type="number"
              onChange={
                handleMachos
              }
              style={inputStyle}
            />

          </div>

        ))}

      </div>

      <div style={rowStyle}>

        {[5, 6, 7].map(i => (

          <div
            key={i}
            style={{ flex: 1 }}
          >

            <label>
              Muestra {i}
            </label>

            <input
              name={`m${i}`}
              type="number"
              onChange={
                handleMachos
              }
              style={inputStyle}
            />

          </div>

        ))}

      </div>

      {/* =========================
          BOTÓN GUARDAR
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
          marginTop: "15px"
        }}
      >

        Guardar Registro

      </button>

    </div>

  );

}

export default ControlPesoAves;
