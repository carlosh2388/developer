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

  // NUEVO STATE
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
  // AGREGAR CAUSA
  // =========================

  const agregarCausa = () => {

    if (!nuevaCausa.trim()) return;

    setCausas([...causas, nuevaCausa]);

    setCausaFinal(nuevaCausa);

    setNuevaCausa("");

    setMostrarNuevaCausa(false);
  };

  // =========================
  // GUARDAR
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

    alert("Egreso registrado correctamente");
  };

  return (

    <div className="form-container">

      <h2>
        Traslados (venta, mortandad, otros)
      </h2>

      {paso === 2 && (

        <div>

          <label>Causa</label>

          {/* FILA */}
          <div className="causa-linea">

            <select
              value={causaFinal}
              onChange={(e) =>
                setCausaFinal(e.target.value)
              }
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
              className="btn-plus"
              onClick={() =>
                setMostrarNuevaCausa(
                  !mostrarNuevaCausa
                )
              }
            >
              +
            </button>

          </div>

          {/* INPUT NUEVA CAUSA */}
          {mostrarNuevaCausa && (

            <div className="nueva-causa-box">

              <input
                type="text"
                value={nuevaCausa}
                onChange={(e) =>
                  setNuevaCausa(e.target.value)
                }
                placeholder="Nueva causa"
              />

              <button
                type="button"
                onClick={agregarCausa}
              >
                Guardar causa
              </button>

            </div>

          )}

        </div>
      )}

    </div>
  );
}

export default Traslados;