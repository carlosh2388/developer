import { useEffect, useState } from "react";

function ControlPesoAves() {

  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");

  const [lote] = useState("REP-260401-1600");

  const [sexo, setSexo] = useState("Macho");

  const [etapa, setEtapa] = useState("");

  const [nuevaEtapa, setNuevaEtapa] = useState("");

  const [mostrarNuevaEtapa,
    setMostrarNuevaEtapa] = useState(false);

  const [semana] = useState(1);

  const [uniformidad, setUniformidad] = useState("");

  const [etapas, setEtapas] = useState([]);

  // =========================
  // PESOS HEMBRAS
  // =========================

  const [hembras, setHembras] = useState({
    m1: "", m2: "", m3: "", m4: "",
    m5: "", m6: "", m7: ""
  });

  const [promHembras, setPromHembras] =
    useState(0);

  // =========================
  // PESOS MACHOS
  // =========================

  const [machos, setMachos] = useState({
    m1: "", m2: "", m3: "", m4: "",
    m5: "", m6: "", m7: ""
  });

  const [promMachos, setPromMachos] =
    useState(0);

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

    // MOSTRAR INPUT
    if (!mostrarNuevaEtapa) {

      setMostrarNuevaEtapa(true);

      return;
    }

    // VALIDAR
    if (!nuevaEtapa.trim()) return;

    // AGREGAR
    setEtapas(prev => [
      ...prev,
      nuevaEtapa
    ]);

    // AUTO SELECCIONAR
    setEtapa(nuevaEtapa);

    // LIMPIAR
    setNuevaEtapa("");

    // OCULTAR
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
              setFecha(
                e.target.value
              )
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
          ETAPA + UNIFORMIDAD
      ========================= */}

      <div style={rowStyle}>

        <div style={{ flex: 2 }}>

          <label>Etapa</label>

          <div style={{
            display: "flex",
            gap: "10px",
            alignItems: "center"
          }}>

            {/* SELECT */}

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

            {/* INPUT NUEVA ETAPA */}

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

            {/* BOTÓN */}

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

      <h3>Hembras</h3>

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

              onChange={handleHembras}

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

              onChange={handleHembras}

              style={inputStyle}
            />

          </div>

        ))}

        <div style={{ flex: 1 }}>

          <label>Promedio</label>

          <input
            value={promHembras}

            readOnly

            style={inputStyle}
          />

        </div>

      </div>

      {/* =========================
          MACHOS
      ========================= */}

      <h3>Machos</h3>

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

              onChange={handleMachos}

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

              onChange={handleMachos}

              style={inputStyle}
            />

          </div>

        ))}

        <div style={{ flex: 1 }}>

          <label>Promedio</label>

          <input
            value={promMachos}

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

export default ControlPesoAves;
