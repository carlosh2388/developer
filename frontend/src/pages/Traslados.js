import { useEffect, useState } from "react";

function Traslados() {

  // =========================
  // STATES
  // =========================

  const [paso, setPaso] = useState(1);

  const [causaInicial, setCausaInicial] =
    useState("");

  const [fecha, setFecha] =
    useState("");

  const [lote] =
    useState("REP-260401-1600");

  const [hembras, setHembras] =
    useState("");

  const [machos, setMachos] =
    useState("");

  const [total, setTotal] =
    useState(0);

  const [causaFinal, setCausaFinal] =
    useState("");

  const [nuevaCausa, setNuevaCausa] =
    useState("");

  const [causas, setCausas] =
    useState([]);

  const [observaciones, setObservaciones] =
    useState("");

  const [mostrarNuevaCausa, setMostrarNuevaCausa] =
    useState(false);

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
  // CAMBIO TIPO TRASLADO
  // =========================

  const handleTipoTraslado = (e) => {

    const value = e.target.value;

    setCausaInicial(value);

    if (value === "") {

      setPaso(1);

      return;
    }

    setPaso(2);
  };

  // =========================
  // CALCULAR TOTAL
  // =========================

  useEffect(() => {

    const h = parseInt(hembras) || 0;

    const m = parseInt(machos) || 0;

    setTotal(h + m);

  }, [hembras, machos]);

  // =========================
  // GUARDAR TRASLADO
  // =========================

  const guardar = () => {

    const data = {

      causaInicial,
      fecha,
      lote,
      hembras,
      machos,
      total,
      causaFinal,
      observaciones
    };

    console.log(data);

    alert("Traslado registrado correctamente");
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
        maxWidth: "750px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h2>
        Traslados (venta, mortandad, otros)
      </h2>

      {/* =========================
          TIPO DE TRASLADO
      ========================= */}
      <div style={{ marginBottom: "15px" }}>

        <label>
          Tipo de traslado
        </label>

        <select
          value={causaInicial}
          onChange={handleTipoTraslado}
          style={inputStyle}
        >

          <option value="">
            Seleccione
          </option>

          <option value="Mortandad">
            Mortandad
          </option>

          <option value="Venta">
            Venta
          </option>

          <option value="Traslado">
            Traslado
          </option>

          <option value="Otro">
            Otro
          </option>

        </select>

      </div>

      {/* =========================
          PASO 2
      ========================= */}
      {paso === 2 && (

        <div>

          {/* FECHA Y LOTE */}
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

          {/* HEMBRAS, MACHOS Y TOTAL EN UNA LÍNEA */}
          <div style={rowStyle}>

            <div style={{ flex: 1 }}>

              <label>
                Cantidad Hembras
              </label>

              <input
                type="number"
                value={hembras}
                onChange={(e) =>
                  setHembras(e.target.value)
                }
                style={inputStyle}
              />

            </div>

            <div style={{ flex: 1 }}>

              <label>
                Cantidad Machos
              </label>

              <input
                type="number"
                value={machos}
                onChange={(e) =>
                  setMachos(e.target.value)
                }
                style={inputStyle}
              />

            </div>

            <div style={{ flex: 1 }}>

              <label>
                Total
              </label>

              <input
                type="number"
                value={total}
                readOnly
                style={inputStyle}
              />

            </div>

          </div>

          {/* CAUSA FINAL */}
          <div style={{ marginBottom: "15px" }}>

            <label>
              Causa
            </label>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center"
              }}
            >

              <select
                value={causaFinal}
                onChange={(e) =>
                  setCausaFinal(e.target.value)
                }
                style={{
                  ...inputStyle,
                  marginBottom: 0,
                  flex: 1
                }}
              >

                <option value="">
                  Seleccione una causa
                </option>

                {causas.map((c, i) => (

                  <option key={i} value={c}>
                    {c}
                  </option>

                ))}

              </select>

              <button
                type="button"
                onClick={() =>
                  setMostrarNuevaCausa(true)
                }
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                +
              </button>

            </div>

          </div>

          {/* NUEVA CAUSA */}
          {mostrarNuevaCausa && (

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "15px"
              }}
            >

              <input
                type="text"
                value={nuevaCausa}
                onChange={(e) =>
                  setNuevaCausa(e.target.value)
                }
                placeholder="Nueva causa"
                style={{
                  ...inputStyle,
                  marginBottom: 0,
                  flex: 1
                }}
              />

              <button
                type="button"
                onClick={() => {

                  if (!nuevaCausa.trim()) return;

                  const nuevaLista = [
                    ...causas,
                    nuevaCausa
                  ];

                  setCausas(nuevaLista);

                  setCausaFinal(nuevaCausa);

                  setNuevaCausa("");

                  setMostrarNuevaCausa(false);

                }}
                style={{
                  padding: "0 15px",
                  border: "none",
                  backgroundColor: "#388e3c",
                  color: "#fff",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Guardar
              </button>

            </div>

          )}

          {/* OBSERVACIONES */}
          <div style={{ marginBottom: "20px" }}>

            <label>
              Observaciones adicionales
            </label>

            <textarea
              value={observaciones}
              onChange={(e) =>
                setObservaciones(e.target.value)
              }
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc"
              }}
            />

          </div>

          {/* BOTÓN GUARDAR */}
          <button
            onClick={guardar}
            style={{
              padding: "10px 20px",
              border: "none",
              backgroundColor: "#1976d2",
              color: "#fff",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Guardar Traslado
          </button>

        </div>

      )}

    </div>
  );
}

export default Traslados;