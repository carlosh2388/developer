import { useEffect, useState } from "react";

function Egresos() {

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

  // =========================
  // RENDER
  // =========================

  return (

    <div className="container">

      <h2>Registro de Egresos ERP</h2>

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

            <option value="">
              Seleccione
            </option>

            <option>Mortalidad</option>
            <option>Venta</option>
            <option>Traslados</option>
            <option>Otros</option>

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

          <div className="erp-causa">

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
              ＋
            </button>

          </div>

          <label>
            Observaciones adicionales
          </label>

          <textarea
            value={observaciones}
            onChange={(e) =>
              setObservaciones(e.target.value)
            }
          />

          <button onClick={guardar}>
            Guardar Egreso
          </button>

        </div>
      )}

    </div>
  );
}

export default Egresos;