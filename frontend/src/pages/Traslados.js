import { useEffect, useState } from "react";

function Traslados() {

  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");
  const [tipo, setTipo] = useState("");
  const [envio, setEnvio] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [causas, setCausas] = useState([]);
  const [nuevaCausa, setNuevaCausa] = useState("");
  const [mostrarNuevaCausa, setMostrarNuevaCausa] =
    useState(false);

  const [filas, setFilas] = useState([
    {
      hembras: "",
      machos: "",
      subtotal: 0,
      lote: "",
      causa: ""
    }
  ]);

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
  // TOTAL GENERAL
  // =========================

  const totalGeneral = filas.reduce(
    (acc, fila) => acc + (Number(fila.subtotal) || 0),
    0
  );

  // =========================
  // AGREGAR FILA
  // =========================

  const agregarFila = () => {
    setFilas([
      ...filas,
      {
        hembras: "",
        machos: "",
        subtotal: 0,
        lote: "",
        causa: ""
      }
    ]);
  };

  // =========================
  // ELIMINAR FILA
  // =========================

  const eliminarFila = (index) => {

    if (filas.length === 1) {
      return;
    }

    const nuevasFilas =
      filas.filter((_, i) => i !== index);

    setFilas(nuevasFilas);
  };

  // =========================
  // ACTUALIZAR FILA
  // =========================

  const actualizarFila = (
    index,
    campo,
    valor
  ) => {

    const nuevasFilas = [...filas];

    nuevasFilas[index][campo] = valor;

    const hembras =
      parseInt(
        nuevasFilas[index].hembras
      ) || 0;

    const machos =
      parseInt(
        nuevasFilas[index].machos
      ) || 0;

    nuevasFilas[index].subtotal =
      hembras + machos;

    setFilas(nuevasFilas);
  };

  // =========================
  // GUARDAR NUEVA CAUSA
  // =========================

  const guardarNuevaCausa = () => {

    if (!nuevaCausa.trim()) return;

    setCausas([
      ...causas,
      nuevaCausa
    ]);

    setNuevaCausa("");
    setMostrarNuevaCausa(false);
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = () => {

    const data = {

      fecha,
      tipo,
      envio,
      totalGeneral,
      detalles: filas,
      observaciones

    };

    console.log(data);

    alert(
      "Egreso registrado correctamente"
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
    marginBottom: "15px",
    alignItems: "flex-end"
  };

  // =========================
  // RENDER
  // =========================

  return (

    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h2>
        Egreso de Reproductores
      </h2>

      {/* FECHA + TIPO + TOTAL */}

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
          <label>Tipo</label>

          <select
            value={tipo}
            onChange={(e) =>
              setTipo(e.target.value)
            }
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

          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label>Total</label>

          <input
            value={totalGeneral}
            readOnly
            style={inputStyle}
          />
        </div>

      </div>

      {/* FILAS SOLO SI EXISTE TIPO */}

      {(tipo === "Mortandad" ||
        tipo === "Venta") && (

        <>
          {filas.map(
            (fila, index) => (

              <div
                key={index}
                style={rowStyle}
              >

                <div style={{ flex: 0.5 }}>
                  <label>
                    Hembras
                  </label>

                  <input
                    type="number"
                    value={fila.hembras}
                    onChange={(e) =>
                      actualizarFila(
                        index,
                        "hembras",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={{ flex: 0.5 }}>
                  <label>
                    Machos
                  </label>

                  <input
                    type="number"
                    value={fila.machos}
                    onChange={(e) =>
                      actualizarFila(
                        index,
                        "machos",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={{ flex: 0.5 }}>
                  <label>
                    Sub-Total
                  </label>

                  <input
                    value={fila.subtotal}
                    readOnly
                    style={inputStyle}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label>
                    # Lote
                  </label>

                  <select
                    value={fila.lote}
                    onChange={(e) =>
                      actualizarFila(
                        index,
                        "lote",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      Seleccione
                    </option>

                    <option value="SL-001">
                      SL-001
                    </option>

                    <option value="BL-001">
                      BL-001
                    </option>

                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label>
                    Causa
                  </label>

                  <select
                    value={fila.causa}
                    onChange={(e) =>
                      actualizarFila(
                        index,
                        "causa",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      Seleccione
                    </option>

                    {causas.map(
                      (c, i) => (
                        <option
                          key={i}
                          value={c}
                        >
                          {c}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* NUEVA CAUSA */}

                <button
                  type="button"
                  onClick={() =>
                    setMostrarNuevaCausa(
                      true
                    )
                  }
                  style={{
                    width: "35px",
                    height: "35px",
                    border: "none",
                    borderRadius: "5px",
                    backgroundColor:
                      "#388e3c",
                    color: "#fff",
                    cursor: "pointer"
                  }}
                >
                  +
                </button>

                {/* AGREGAR FILA */}

                <button
                  type="button"
                  onClick={agregarFila}
                  style={{
                    width: "35px",
                    height: "35px",
                    border: "none",
                    borderRadius: "5px",
                    backgroundColor:
                      "#1976d2",
                    color: "#fff",
                    cursor: "pointer"
                  }}
                >
                  +
                </button>

                {/* ELIMINAR FILA */}

                <button
                  type="button"
                  onClick={() =>
                    eliminarFila(index)
                  }
                  style={{
                    width: "35px",
                    height: "35px",
                    border: "none",
                    borderRadius: "5px",
                    backgroundColor:
                      "#d32f2f",
                    color: "#fff",
                    cursor: "pointer"
                  }}
                >
                  X
                </button>

              </div>

            )
          )}
        </>
      )}

      {/* NUEVA CAUSA */}

      {mostrarNuevaCausa && (

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px"
          }}
        >

          <input
            value={nuevaCausa}
            onChange={(e) =>
              setNuevaCausa(
                e.target.value
              )
            }
            placeholder="Nueva causa"
            style={{
              ...inputStyle,
              flex: 1
            }}
          />

          <button
            type="button"
            onClick={
              guardarNuevaCausa
            }
            style={{
              padding: "0 15px",
              backgroundColor:
                "#388e3c",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Guardar
          </button>

        </div>

      )}

      {/* ENVÍO SOLO PARA VENTA */}

      {tipo === "Venta" && (

        <div
          style={{
            marginBottom: "20px"
          }}
        >

          <label>
            # Envío
          </label>

          <input
            type="text"
            value={envio}
            onChange={(e) =>
              setEnvio(
                e.target.value
              )
            }
            style={inputStyle}
          />

        </div>

      )}

      {/* OBSERVACIONES */}

      <div
        style={{
          marginBottom: "20px"
        }}
      >

        <label>
          Observaciones
        </label>

        <textarea
          value={observaciones}
          onChange={(e) =>
            setObservaciones(
              e.target.value
            )
          }
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "10px",
            borderRadius: "5px",
            border:
              "1px solid #ccc"
          }}
        />

      </div>

      {/* GUARDAR */}

      <button
        onClick={guardar}
        style={{
          padding: "10px 20px",
          backgroundColor:
            "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Guardar Egreso
      </button>

    </div>

  );

}

export default Traslados;
