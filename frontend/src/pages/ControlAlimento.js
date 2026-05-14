import { useState } from "react";

function ControlAlimento() {

  // =========================
  // STATES
  // =========================

  const [movimiento, setMovimiento] =
    useState("");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [fecha, setFecha] =
    useState("");

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
  // CAMBIO MOVIMIENTO
  // =========================

  const handleMovimiento = (e) => {

    const value = e.target.value;

    setMovimiento(value);

    // VOLVER A ESTADO INICIAL
    if (value === "") {

      setMostrarFormulario(false);

      setFecha("");

      setTipoAlimento("");
      setCantidadAlimento("");

      setAditivo("");
      setCantidadAditivo("");

      setMedicamento("");
      setCantidadMedicamento("");

      return;
    }

    // MOSTRAR FORMULARIO
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
        maxWidth: "700px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h2>
        Control de Alimentos
      </h2>

      {/* TIPO MOVIMIENTO */}
      <label>
        Tipo de Movimiento
      </label>

      <select
        value={movimiento}
        onChange={handleMovimiento}
        style={{
          ...inputStyle,
          marginBottom: "20px"
        }}
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

      {/* FORMULARIO */}
      {mostrarFormulario && (

        <form
          onSubmit={guardar}
          className="form-alimentos"
        >

          {/* FECHA Y LOTE */}
          <div style={rowStyle}>

            {/* FECHA */}
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

            {/* LOTE */}
            <div style={{ flex: 1 }}>

              <label>
                # Lote
              </label>

              <select
                value={lote}
                onChange={(e) =>
                  setLote(e.target.value)
                }
                style={inputStyle}
              >

                <option value="REP-260401-1600">
                  REP-260401-1600
                </option>

              </select>

            </div>

          </div>

          {/* TIPO ALIMENTO */}
          <label>
            Tipo de Alimento
          </label>

          <select
            value={tipoAlimento}
            onChange={(e) =>
              setTipoAlimento(e.target.value)
            }
            style={{
              ...inputStyle,
              marginBottom: "15px"
            }}
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

            <div style={{ marginBottom: "15px" }}>

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
                style={inputStyle}
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
            style={{
              ...inputStyle,
              marginBottom: "15px"
            }}
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

            <div style={{ marginBottom: "15px" }}>

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
                style={inputStyle}
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
            style={{
              ...inputStyle,
              marginBottom: "15px"
            }}
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

            <div style={{ marginBottom: "20px" }}>

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
                style={inputStyle}
              />

            </div>
          )}

          {/* BOTÓN */}
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >

            Guardar

          </button>

        </form>
      )}

    </div>
  );
}

export default ControlAlimento;