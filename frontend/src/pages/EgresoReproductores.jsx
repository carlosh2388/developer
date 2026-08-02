import { useEffect, useState } from "react";

function EgresoReproductores() {
  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");

  const [filas, setFilas] = useState([
    {
      hembras: "",
      machos: "",
      subtotal: 0,
      lote: "",
      tipo: "",
      observacion: "",
      envio: ""
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
        tipo: "",
        observacion: "",
        envio: ""
      }
    ]);
  };

  // =========================
  // ELIMINAR FILA
  // =========================

  const eliminarFila = (index) => {
    if (filas.length === 1) return;

    const nuevasFilas = filas.filter(
      (_, i) => i !== index
    );

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
  // GUARDAR
  // =========================

  const guardar = () => {
    const data = {
      fecha,
      totalGeneral,
      detalles: filas
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
      <h2>Egreso de Reproductores</h2>

      {/* FECHA + TOTAL + AGREGAR */}
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
          <label>Total</label>

          <input
            value={totalGeneral}
            readOnly
            style={inputStyle}
          />
        </div>

        <button
          type="button"
          onClick={agregarFila}
          style={{
            width: "40px",
            height: "40px",
            border: "none",
            borderRadius: "5px",
            backgroundColor: "#1976d2",
            color: "#fff",
            fontSize: "20px",
            cursor: "pointer"
          }}
        >
          +
        </button>
      </div>

      {/* FILAS */}
      {filas.map((fila, index) => (
        <div
          key={index}
          style={rowStyle}
        >
          {/* HEMBRAS */}
          <div style={{ flex: 0.5 }}>
            <label>Hembras</label>

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

          {/* MACHOS */}
          <div style={{ flex: 0.5 }}>
            <label>Machos</label>

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

          {/* SUBTOTAL */}
          <div style={{ flex: 0.6 }}>
            <label>Sub-Total</label>

            <input
              value={fila.subtotal}
              readOnly
              style={inputStyle}
            />
          </div>

          {/* LOTE */}
          <div style={{ flex: 1 }}>
            <label># Lote</label>

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

              <option value="SL01">
                SL01
              </option>

              <option value="BL01">
                BL01
              </option>
            </select>
          </div>

          {/* TIPO */}
          <div style={{ flex: 1 }}>
            <label>Tipo</label>

            <select
              value={fila.tipo}
              onChange={(e) =>
                actualizarFila(
                  index,
                  "tipo",
                  e.target.value
                )
              }
              style={inputStyle}
            >
              <option value="">
                Seleccione
              </option>

              <option value="Error de Sexado">
                Error de Sexado
              </option>

              <option value="Mortandad">
                Mortandad
              </option>

              <option value="Selección">
                Selección
              </option>

              <option value="Venta">
                Venta
              </option>
            </select>
          </div>

          {/* OBSERVACIÓN O ENVÍO */}
          {fila.tipo === "Venta" ? (
            <div style={{ flex: 1.5 }}>
              <label># Envío</label>

              <input
                type="text"
                value={fila.envio}
                onChange={(e) =>
                  actualizarFila(
                    index,
                    "envio",
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>
          ) : (
            <div style={{ flex: 1.5 }}>
              <label>Observación</label>

              <input
                type="text"
                value={fila.observacion}
                onChange={(e) =>
                  actualizarFila(
                    index,
                    "observacion",
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>
          )}

          {/* ELIMINAR */}
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
      ))}

      {/* GUARDAR */}
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
        Guardar Egreso
      </button>
    </div>
  );
}

export default EgresoReproductores;
