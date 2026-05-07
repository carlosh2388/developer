import { useEffect, useState } from "react";

function MovimientosAlimentos() {

  // =========================
  // STATES
  // =========================

  const [movimiento, setMovimiento] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [fecha, setFecha] = useState("");

  const [lote] = useState("REP-260401-1600");

  const [tipoAlimento, setTipoAlimento] = useState("");

  const [aditivo, setAditivo] = useState("");

  const [medicamento, setMedicamento] = useState("");

  const [showAlimento, setShowAlimento] = useState(false);

  const [showAditivo, setShowAditivo] = useState(false);

  const [showMedicamento, setShowMedicamento] = useState(false);

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
  // CONTINUAR
  // =========================

  const continuar = () => {

    if (!movimiento) {

      alert("Seleccione tipo de movimiento");
      return;
    }

    setMostrarFormulario(true);
  };

  // =========================
  // TOGGLES ERP
  // =========================

  const handleTipoAlimento = (e) => {

    const value = e.target.value;

    setTipoAlimento(value);
    setShowAlimento(!!value);
  };

  const handleAditivo = (e) => {

    const value = e.target.value;

    setAditivo(value);
    setShowAditivo(!!value);
  };

  const handleMedicamento = (e) => {

    const value = e.target.value;

    setMedicamento(value);
    setShowMedicamento(!!value);
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = () => {

    const data = {

      movimiento,
      fecha,
      lote,
      tipoAlimento,
      aditivo,
      medicamento
    };

    console.log(data);

    alert("Movimiento de alimentos registrado correctamente");
  };

  // =========================
  // RENDER
  // =========================

  return (

    <div className="container">

      <h2>Movimientos de Alimentos</h2>

      {/* TIPO MOVIMIENTO */}
      <label>Tipo de Movimiento</label>

      <select
        value={movimiento}
        onChange={(e) =>
          setMovimiento(e.target.value)
        }
      >

        <option value="">
          Seleccione
        </option>

        <option value="entrada">
          Entrada a Bodega
        </option>

        <option value="salida">
          Salida de Bodega
        </option>

      </select>

      <button onClick={continuar}>
        Continuar
      </button>

      {/* FORMULARIO ERP */}
      {mostrarFormulario && (

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

          {/* ALIMENTO */}
          <label>Tipo de Alimento</label>

          <select
            value={tipoAlimento}
            onChange={handleTipoAlimento}
          >

            <option value="">
              Seleccione
            </option>

            <option>Preinicio</option>
            <option>Inicio Polla</option>
            <option>Desarrollo Polla</option>
            <option>Crecimiento Polla</option>
            <option>Prepostura</option>
            <option>Fase 1</option>
            <option>Fase 2</option>

          </select>

          {showAlimento && (
            <div>

              <label>
                Cantidad de Alimento (quintales)
              </label>

              <input type="number" />

            </div>
          )}

          <hr />

          {/* ADITIVO */}
          <label>Aditivos</label>

          <select
            value={aditivo}
            onChange={handleAditivo}
          >

            <option value="">
              Seleccione
            </option>

            <option>
              AD-001 Ejemplo
            </option>

          </select>

          {showAditivo && (
            <div>

              <label>
                Cantidad de Aditivo (gramos)
              </label>

              <input type="number" />

            </div>
          )}

          <hr />

          {/* MEDICAMENTO */}
          <label>Medicamentos</label>

          <select
            value={medicamento}
            onChange={handleMedicamento}
          >

            <option value="">
              Seleccione
            </option>

            <option>
              MD-001 Ejemplo
            </option>

          </select>

          {showMedicamento && (
            <div>

              <label>
                Cantidad de Medicamento (gramos)
              </label>

              <input type="number" />

            </div>
          )}

          <button onClick={guardar}>
            Guardar
          </button>

        </div>
      )}

    </div>
  );
}

export default MovimientosAlimentos;