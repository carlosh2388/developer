import { useEffect, useState } from "react";

function EgresoHuevos() {

  // =========================
  // STATES BASE
  // =========================

  const [egreso, setEgreso] = useState("");

  const [fecha, setFecha] = useState("");

  const [hora, setHora] = useState("");

  // =========================
  // BODEGAS
  // =========================

  const [bodegaSalida, setBodegaSalida] = useState("BA");

  const [bodegaDestino, setBodegaDestino] = useState("");

  // =========================
  // PLACA
  // =========================

  const [placa, setPlaca] = useState("");

  const [nuevaPlaca, setNuevaPlaca] = useState("");

  const [mostrarNuevaPlaca, setMostrarNuevaPlaca] =
    useState(false);

  const [placas, setPlacas] = useState([
    "L-123ABC",
    "L-456DEF"
  ]);

  // =========================
  // PILOTO
  // =========================

  const [piloto, setPiloto] = useState("");

  const [nuevoPiloto, setNuevoPiloto] = useState("");

  const [mostrarNuevoPiloto, setMostrarNuevoPiloto] =
    useState(false);

  const [pilotos, setPilotos] = useState([
    "Juan Pérez",
    "Carlos López"
  ]);

  // =========================
  // GRUPOS
  // =========================

  const grupos = [
    "incubable",
    "comercial",
    "sucio",
    "quebrado",
    "otros"
  ];

  // =========================
  // CREAR GRUPO
  // =========================

  const crearGrupo = () => ({
    pewee: 0,
    pequeno: 0,
    mediano: 0,
    grande: 0,
    extra: 0,
    origen: ""
  });

  // =========================
  // CREAR LOTE
  // =========================

  const crearLote = (codigo = "") => ({
    id: Date.now() + Math.random(),

    lote: codigo,

    cantidades: {
      incubable: crearGrupo(),
      comercial: crearGrupo(),
      sucio: crearGrupo(),
      quebrado: crearGrupo(),
      otros: crearGrupo()
    },

    open: {
      incubable: false,
      comercial: false,
      sucio: false,
      quebrado: false,
      otros: false
    }
  });

  // =========================
  // LOTES
  // =========================

  const [lotes, setLotes] = useState([
    crearLote("REP-260401-1600")
  ]);

  // =========================
  // FECHA + HORA
  // =========================

  useEffect(() => {

    const now = new Date();

    setFecha(now.toISOString().split("T")[0]);

    setHora(now.toTimeString().slice(0, 5));

  }, []);

  // =========================
  // HANDLE CANTIDAD
  // =========================

  const handleCantidad = (
    loteId,
    grupo,
    campo,
    value
  ) => {

    setLotes(prev =>
      prev.map(l =>
        l.id === loteId
          ? {
              ...l,

              cantidades: {
                ...l.cantidades,

                [grupo]: {
                  ...l.cantidades[grupo],

                  [campo]: value
                }
              }
            }
          : l
      )
    );
  };

  // =========================
  // HANDLE ORIGEN
  // =========================

  const handleOrigen = (
    loteId,
    grupo,
    value
  ) => {

    setLotes(prev =>
      prev.map(l =>
        l.id === loteId
          ? {
              ...l,

              cantidades: {
                ...l.cantidades,

                [grupo]: {
                  ...l.cantidades[grupo],

                  origen: value
                }
              }
            }
          : l
      )
    );
  };

  // =========================
  // TOTAL
  // =========================

  const calcularTotal = (
    lote,
    grupo
  ) => {

    const g = lote.cantidades[grupo];

    return (
      (parseInt(g.pewee) || 0) +
      (parseInt(g.pequeno) || 0) +
      (parseInt(g.mediano) || 0) +
      (parseInt(g.grande) || 0) +
      (parseInt(g.extra) || 0)
    );
  };

  // =========================
  // TOGGLE
  // =========================

  const toggle = (
    loteId,
    grupo
  ) => {

    setLotes(prev =>
      prev.map(l =>
        l.id === loteId
          ? {
              ...l,

              open: {
                ...l.open,

                [grupo]: !l.open[grupo]
              }
            }
          : l
      )
    );
  };

  // =========================
  // AGREGAR LOTE
  // =========================

  const agregarLote = () => {

    setLotes(prev => [
      ...prev,
      crearLote("")
    ]);
  };

  // =========================
  // ELIMINAR LOTE
  // =========================

  const eliminarLote = (id) => {

    setLotes(prev =>
      prev.filter(l => l.id !== id)
    );
  };

  // =========================
  // HANDLE LOTE
  // =========================

  const handleLote = (
    id,
    value
  ) => {

    setLotes(prev =>
      prev.map(l =>
        l.id === id
          ? {
              ...l,
              lote: value
            }
          : l
      )
    );
  };

  // =========================
  // AGREGAR PLACA
  // =========================

  const agregarPlaca = () => {

    if (!nuevaPlaca.trim()) return;

    setPlacas([...placas, nuevaPlaca]);

    setPlaca(nuevaPlaca);

    setNuevaPlaca("");

    setMostrarNuevaPlaca(false);
  };

  // =========================
  // AGREGAR PILOTO
  // =========================

  const agregarPiloto = () => {

    if (!nuevoPiloto.trim()) return;

    setPilotos([...pilotos, nuevoPiloto]);

    setPiloto(nuevoPiloto);

    setNuevoPiloto("");

    setMostrarNuevoPiloto(false);
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = () => {

    const data = {
      egreso,
      fecha,
      hora,
      bodegaSalida,
      bodegaDestino,
      placa,
      piloto,
      lotes
    };

    console.log(data);

    alert("Egreso registrado correctamente");
  };

  // =========================
  // STYLE BOTONES
  // =========================

  const smallButton = {
    width: "28px",
    height: "28px",
    padding: "0",
    fontSize: "16px",
    lineHeight: "1"
  };

  // =========================
  // RENDER GRUPO
  // =========================

  const renderGrupo = (
    lote,
    grupo
  ) => {

    const total = calcularTotal(
      lote,
      grupo
    );

    return (

      <div style={{ marginBottom: "20px" }}>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>

          <h3 style={{
            margin: 0,
            fontWeight: "400",
            textTransform: "capitalize",
            fontSize: "18px"
          }}>
            {grupo}
          </h3>

          <button
            type="button"
            onClick={() =>
              toggle(lote.id, grupo)
            }
            style={smallButton}
          >
            {lote.open[grupo] ? "-" : "+"}
          </button>

        </div>

        {lote.open[grupo] && (

          <div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px"
            }}>

              {["pewee", "pequeno", "mediano"].map(k => (

                <div key={k}>

                  <label>{k}</label>

                  <input
                    type="number"
                    value={lote.cantidades[grupo][k]}

                    onChange={(e) =>
                      handleCantidad(
                        lote.id,
                        grupo,
                        k,
                        e.target.value
                      )
                    }
                  />

                </div>

              ))}

            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              marginTop: "10px"
            }}>

              <div>

                <label>Grande</label>

                <input
                  type="number"
                  value={lote.cantidades[grupo].grande}

                  onChange={(e) =>
                    handleCantidad(
                      lote.id,
                      grupo,
                      "grande",
                      e.target.value
                    )
                  }
                />

              </div>

              <div>

                <label>Extra</label>

                <input
                  type="number"
                  value={lote.cantidades[grupo].extra}

                  onChange={(e) =>
                    handleCantidad(
                      lote.id,
                      grupo,
                      "extra",
                      e.target.value
                    )
                  }
                />

              </div>

              <div>

                <label>Total</label>

                <input
                  type="number"
                  value={total}
                  readOnly
                />

              </div>

            </div>

            <div style={{ marginTop: "10px" }}>

              <label>Origen</label>

              <select
                value={lote.cantidades[grupo].origen}

                onChange={(e) =>
                  handleOrigen(
                    lote.id,
                    grupo,
                    e.target.value
                  )
                }
              >

                <option value="">
                  Seleccione
                </option>

                <option value="Nido">
                  Nido
                </option>

                <option value="Piso">
                  Piso
                </option>

              </select>

            </div>

          </div>

        )}

      </div>

    );
  };

  // =========================
  // RENDER
  // =========================

  return (

    <div className="form-container">

      <h2>Egreso de Huevos</h2>

      {/* FILA 1 */}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "10px"
      }}>

        <div>

          <label># Egreso</label>

          <input
            value={egreso}
            onChange={(e) =>
              setEgreso(e.target.value)
            }
          />

        </div>

        <div>

          <label>Fecha</label>

          <input
            type="date"
            value={fecha}

            onChange={(e) =>
              setFecha(e.target.value)
            }
          />

        </div>

        <div>

          <label>Hora</label>

          <input
            type="time"
            value={hora}

            onChange={(e) =>
              setHora(e.target.value)
            }
          />

        </div>

      </div>

      {/* FILA 2 */}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "10px",
        marginTop: "10px"
      }}>

        <div>

          <label>Bodega Salida</label>

          <select
            value={bodegaSalida}

            onChange={(e) =>
              setBodegaSalida(e.target.value)
            }
          >

            <option>BA</option>
            <option>BH</option>
            <option>BGR</option>
            <option>BI</option>

          </select>

        </div>

        <div>

          <label>Bodega Destino</label>

          <select
            value={bodegaDestino}

            onChange={(e) =>
              setBodegaDestino(e.target.value)
            }
          >

            <option value="">
              Sin Bodega
            </option>

            <option>BA</option>
            <option>BH</option>
            <option>BGR</option>
            <option>BI</option>

          </select>

        </div>

      </div>

      {/* FILA 3 */}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
        marginTop: "10px"
      }}>

        {/* PLACA */}

        <div>

          <label>Placa Camión</label>

          <div style={{
            display: "flex",
            gap: "8px"
          }}>

            <select
              value={placa}

              onChange={(e) =>
                setPlaca(e.target.value)
              }
            >

              <option value="">
                Seleccione
              </option>

              {placas.map((p, i) => (

                <option
                  key={i}
                  value={p}
                >
                  {p}
                </option>

              ))}

            </select>

            <button
              type="button"

              onClick={() =>
                setMostrarNuevaPlaca(true)
              }

              style={smallButton}
            >
              +
            </button>

          </div>

          {mostrarNuevaPlaca && (

            <div style={{
              display: "flex",
              gap: "8px",
              marginTop: "8px"
            }}>

              <input
                value={nuevaPlaca}

                onChange={(e) =>
                  setNuevaPlaca(e.target.value)
                }
              />

              <button
                type="button"
                onClick={agregarPlaca}
              >
                Guardar
              </button>

            </div>

          )}

        </div>

        {/* PILOTO */}

        <div>

          <label>Piloto</label>

          <div style={{
            display: "flex",
            gap: "8px"
          }}>

            <select
              value={piloto}

              onChange={(e) =>
                setPiloto(e.target.value)
              }
            >

              <option value="">
                Seleccione
              </option>

              {pilotos.map((p, i) => (

                <option
                  key={i}
                  value={p}
                >
                  {p}
                </option>

              ))}

            </select>

            <button
              type="button"

              onClick={() =>
                setMostrarNuevoPiloto(true)
              }

              style={smallButton}
            >
              +
            </button>

          </div>

          {mostrarNuevoPiloto && (

            <div style={{
              display: "flex",
              gap: "8px",
              marginTop: "8px"
            }}>

              <input
                value={nuevoPiloto}

                onChange={(e) =>
                  setNuevoPiloto(e.target.value)
                }
              />

              <button
                type="button"
                onClick={agregarPiloto}
              >
                Guardar
              </button>

            </div>

          )}

        </div>

      </div>

      {/* LOTES DINÁMICOS */}

      <div style={{ marginTop: "25px" }}>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>

          <h2 style={{ margin: 0 }}>
            Lotes
          </h2>

          <button
            type="button"
            onClick={agregarLote}
            style={smallButton}
          >
            +
          </button>

        </div>

        {lotes.map((loteItem) => (

          <div
            key={loteItem.id}

            style={{
              border: "1px solid #ccc",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px"
            }}
          >

            {/* HEADER LOTE */}

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "10px",
              alignItems: "center",
              marginBottom: "20px"
            }}>

              <div>

                <label># Lote</label>

                <input
                  value={loteItem.lote}

                  onChange={(e) =>
                    handleLote(
                      loteItem.id,
                      e.target.value
                    )
                  }
                />

              </div>

              <button
                type="button"

                onClick={() =>
                  eliminarLote(loteItem.id)
                }

                style={{
                  ...smallButton,
                  background: "#d9534f",
                  color: "#fff",
                  border: "none"
                }}
              >
                -
              </button>

            </div>

            {/* SUBGRUPOS */}

            {grupos.map(grupo =>
              renderGrupo(
                loteItem,
                grupo
              )
            )}

          </div>

        ))}

      </div>

      {/* FECHA PRODUCCIÓN */}

      <div style={{ marginTop: "20px" }}>

        <label>Fecha Producción</label>

        <input
          type="date"
          value={fecha}

          onChange={(e) =>
            setFecha(e.target.value)
          }
        />

      </div>

      {/* BOTÓN */}

      <button
        onClick={guardar}
        style={{
          marginTop: "20px"
        }}
      >
        Registrar Egreso
      </button>

    </div>

  );
}

export default EgresoHuevos;
