import { useState } from "react";

function ControlAlimento() {

  // =========================
  // STATES
  // =========================

  const [movimiento, setMovimiento] = useState("");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [fecha, setFecha] = useState("");

  const [lote, setLote] =
    useState("REP-260401-1600");

  const [tipoAlimento, setTipoAlimento] =
    useState("");

  const [cantidadAlimento, setCantidadAlimento] =
    useState("");

  const [aditivo, setAditivo] =
    useState("");

  const [cantidadAditivo, setCantidadAditivo] =
    useState("");

  const [medicamento, setMedicamento] =
    useState("");

  const [cantidadMedicamento, setCantidadMedicamento] =
    useState("");

  // =========================
  // CONTINUAR
  // =========================

  const continuar = () => {

    if (!movimiento) {

      alert("Seleccione tipo de movimiento");

      return;
    }

    setMostrarFormulario(true);

    const hoy =
      new Date()
        .toISOString()
        .split("T")[0];

    setFecha(hoy);
  };

  // =========================
  // SUBMIT
  // =========================

  const guardar = (e) => {

    e.preventDefault();

    const data = {

      movimiento,
      fecha,
      lote,
      tipoAlimento,
      cantidadAlimento,
      aditivo,
      cantidadAditivo,
      medicamento,
      cantidadMedicamento
    };

    console.log(data);

    alert(
      "Movimiento de alimentos registrado correctamente"
    );
  };

  // =========================
  // RENDER
  // =========================

  return (

    <div className="container">

      <h2>
        Control de Alimentos
      </h2>

      {/* TIPO MOVIMIENTO */}
      <label>
        Tipo de Movimiento
      </label>

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

      <button
        className="btn"
        onClick={continuar}
      >

        Continuar

      </button>

      {/* FORMULARIO */}
      {mostrarFormulario && (

        <form onSubmit={guardar} className="form-alimentos">
        
          {/* FECHA */}
          <label>
            Fecha
          </label>

          <input
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(e.target.value)
            }
          />

          {/* LOTE */}
          <label>
            # Lote
          </label>

          <select
            value={lote}
            onChange={(e) =>
              setLote(e.target.value)
            }
          >

            <option value="REP-260401-1600">
              REP-260401-1600
            </option>

          </select>

          {/* TIPO ALIMENTO */}
          <label>
            Tipo de Alimento
          </label>

          <select
            value={tipoAlimento}
            onChange={(e) =>
              setTipoAlimento(e.target.value)
            }
          >

            <option value="">
              Seleccione
            </option>

            <option value="Preinicio">
              Preinicio
            </option>

            <option value="Inicio Polla">
              Inicio Polla
            </option>

            <option value="Desarrollo Polla">
              Desarrollo Polla
            </option>

            <option value="Crecimiento Polla">
              Crecimiento Polla
            </option>

            <option value="Prepostura">
              Prepostura
            </option>

            <option value="Fase 1">
              Fase 1
            </option>

            <option value="Fase 2">
              Fase 2
            </option>

          </select>

          {/* CANTIDAD ALIMENTO */}
          {tipoAlimento && (

            <div>

              <label>
                Cantidad de Alimento
                (quintales)
              </label>

              <input
                type="number"
                value={cantidadAlimento}
                onChange={(e) =>
                  setCantidadAlimento(
                    e.target.value
                  )
                }
              />

            </div>
          )}

          <hr />

          {/* ADITIVOS */}
          <label>
            Aditivos
          </label>

          <select
            value={aditivo}
            onChange={(e) =>
              setAditivo(e.target.value)
            }
          >

            <option value="">
              Seleccione
            </option>

            <option value="AD-001 Ejemplo">
              AD-001 Ejemplo
            </option>

          </select>

          {/* CANTIDAD ADITIVO */}
          {aditivo && (

            <div>

              <label>
                Cantidad de Aditivo
                (gramos)
              </label>

              <input
                type="number"
                value={cantidadAditivo}
                onChange={(e) =>
                  setCantidadAditivo(
                    e.target.value
                  )
                }
              />

            </div>
          )}

          <hr />

          {/* MEDICAMENTOS */}
          <label>
            Medicamentos
          </label>

          <select
            value={medicamento}
            onChange={(e) =>
              setMedicamento(
                e.target.value
              )
            }
          >

            <option value="">
              Seleccione
            </option>

            <option value="MD-001 Ejemplo">
              MD-001 Ejemplo
            </option>

          </select>

          {/* CANTIDAD MEDICAMENTO */}
          {medicamento && (

            <div>

              <label>
                Cantidad de Medicamento
                (gramos)
              </label>

              <input
                type="number"
                value={cantidadMedicamento}
                onChange={(e) =>
                  setCantidadMedicamento(
                    e.target.value
                  )
                }
              />

            </div>
          )}

          {/* BOTÓN */}
          <button
            type="submit"
            className="btn"
          >

            Guardar

          </button>

        </form>
      )}

    </div>
  );
}

export default ControlAlimento;