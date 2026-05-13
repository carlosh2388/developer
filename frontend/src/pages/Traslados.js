import { useEffect, useState } from "react";

function Traslados() {

  // =========================
  // STATES
  // =========================

  const [paso, setPaso] = useState(1);

  const [causaInicial, setCausaInicial] = useState("");

  const [fecha, setFecha] = useState("");

  const [lote] = useState("REP-260401-1600");

  const [hembras, setHembras] = useState("");

  const [machos, setMachos] = useState("");

  const [total, setTotal] = useState(0);

  const [causaFinal, setCausaFinal] = useState("");

  const [nuevaCausa, setNuevaCausa] = useState("");

  const [causas, setCausas] = useState([]);

  const [observaciones, setObservaciones] = useState("");

  const [mostrarNuevaCausa, setMostrarNuevaCausa] = useState(false);

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
  // PASO 2
  // =========================

  const irPaso2 = () => {

    if (!causaInicial) {
      alert("Seleccione una causa");
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
  // RENDER
  // =========================

  return (

    <div className="form-container">

      <h2>Traslados (venta, mortandad, otros)</h2>

      {/* =========================
          PASO 1
      ========================= */}
      {paso === 1 && (

        <div>

          <label>Causa</label>

          <select
            value={causaInicial}
            onChange={(e) =>
              setCausaInicial(e.target.value)
            }
          >

            <option value="">Seleccione</option>

            <option>Mortandad</option>
            <option>Venta</option>
            <option>Traslado</option>
            <option>Otro</option>

          </select>

          <button onClick={irPaso2}>
            Continuar
          </button>

        </div>

      )}

      {/* =========================
          PASO 2
      ========================= */}
      {paso === 2 && (

        <div>

          <label>Fecha</label>

          <input
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(e.target.value)
            }
          />

          <label># Lote</label>

          <select value={lote} disabled>
            <option>{lote}</option>
          </select>

          <label>Cantidad Hembras</label>

          <input
            type="number"
            value={hembras}
            onChange={(e) =>
              setHembras(e.target.value)
            }
          />

          <label>Cantidad Machos</label>

          <input
            type="number"
            value={machos}
            onChange={(e) =>
              setMachos(e.target.value)
            }
          />

          <label>Cantidad Total</label>

          <input
            type="number"
            value={total}
            readOnly
          />

          <label>Causa</label>

          {/* SELECT + BOTÓN EN UNA LÍNEA */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>

            <select
              value={causaFinal}
              onChange={(e) =>
                setCausaFinal(e.target.value)
              }
              style={{ flex: 1 }}
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
                width: "28px",
                height: "28px",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              +
            </button>

          </div>

          {/* NUEVA CAUSA */}
          {mostrarNuevaCausa && (

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>

              <input
                type="text"
                value={nuevaCausa}
                onChange={(e) =>
                  setNuevaCausa(e.target.value)
                }
                placeholder="Nueva causa"
                style={{ flex: 1 }}
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
              >
                Guardar nueva causa
              </button>

            </div>

          )}

          <label>Observaciones adicionales</label>

          <textarea
            value={observaciones}
            onChange={(e) =>
              setObservaciones(e.target.value)
            }
          />

          <button onClick={guardar}>
            Guardar Traslado
          </button>

        </div>

      )}

    </div>
  );
}

export default Traslados;