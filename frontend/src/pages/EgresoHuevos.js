import { useEffect, useState } from "react";

function EgresoHuevos() {

  // =========================
  // STATES BASE
  // =========================

  const [egreso, setEgreso] = useState("");

  const [fecha, setFecha] = useState("");

  const [hora, setHora] = useState("");

  const [lote] = useState("REP-260401-1600");

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

  const [placas, setPlacas] = useState([
    "L-123ABC",
    "L-456DEF"
  ]);

  // =========================
  // PILOTO
  // =========================

  const [piloto, setPiloto] = useState("");

  const [nuevoPiloto, setNuevoPiloto] = useState("");

  const [pilotos, setPilotos] = useState([
    "Juan Pérez",
    "Carlos López"
  ]);

  // =========================
  // LOTE PRODUCCIÓN
  // =========================

  const [loteProd] = useState([
    "PRO-001",
    "PRO-002"
  ]);

  // =========================
  // ESTRUCTURA
  // =========================

  const grupos = [
    "incubable",
    "comercial",
    "sucio",
    "quebrado",
    "otros"
  ];

  const tipos = [
    "blanco",
    "rojo"
  ];

  // =========================
  // EXPANSIÓN
  // =========================

  const [open, setOpen] = useState({

    blanco: {
      incubable: false,
      comercial: false,
      sucio: false,
      quebrado: false,
      otros: false
    },

    rojo: {
      incubable: false,
      comercial: false,
      sucio: false,
      quebrado: false,
      otros: false
    }
  });

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
  // CANTIDADES
  // =========================

  const [cantidades, setCantidades] = useState({

    blanco: {
      incubable: crearGrupo(),
      comercial: crearGrupo(),
      sucio: crearGrupo(),
      quebrado: crearGrupo(),
      otros: crearGrupo()
    },

    rojo: {
      incubable: crearGrupo(),
      comercial: crearGrupo(),
      sucio: crearGrupo(),
      quebrado: crearGrupo(),
      otros: crearGrupo()
    }
  });

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
    tipo,
    grupo,
    campo,
    value
  ) => {

    setCantidades(prev => ({
      ...prev,

      [tipo]: {
        ...prev[tipo],

        [grupo]: {
          ...prev[tipo][grupo],

          [campo]: value
        }
      }
    }));
  };

  // =========================
  // HANDLE ORIGEN
  // =========================

  const handleOrigen = (
    tipo,
    grupo,
    value
  ) => {

    setCantidades(prev => ({
      ...prev,

      [tipo]: {
        ...prev[tipo],

        [grupo]: {
          ...prev[tipo][grupo],

          origen: value
        }
      }
    }));
  };

  // =========================
  // TOTAL POR GRUPO
  // =========================

  const calcularTotal = (
    tipo,
    grupo
  ) => {

    const g = cantidades[tipo][grupo];

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
    tipo,
    grupo
  ) => {

    setOpen(prev => ({
      ...prev,

      [tipo]: {
        ...prev[tipo],

        [grupo]: !prev[tipo][grupo]
      }
    }));
  };

  // =========================
  // PLACA
  // =========================

  const agregarPlaca = () => {

    if (!nuevaPlaca.trim()) return;

    setPlacas([...placas, nuevaPlaca]);

    setPlaca(nuevaPlaca);

    setNuevaPlaca("");
  };

  // =========================
  // PILOTO
  // =========================

  const agregarPiloto = () => {

    if (!nuevoPiloto.trim()) return;

    setPilotos([...pilotos, nuevoPiloto]);

    setPiloto(nuevoPiloto);

    setNuevoPiloto("");
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = () => {

    const data = {

      egreso,
      fecha,
      hora,
      lote,
      bodegaSalida,
      bodegaDestino,
      placa,
      piloto,
      loteProd,
      cantidades
    };

    console.log(data);

    alert("Egreso registrado correctamente");
  };

  // =========================
  // RENDER GRUPO
  // =========================

  const renderGrupo = (
    tipo,
    grupo
  ) => {

    const total = calcularTotal(
      tipo,
      grupo
    );

    return (

      <div style={{ marginBottom: "20px" }}>

        {/* HEADER */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>

          <h3 style={{
            margin: 0,
            textTransform: "capitalize"
          }}>
            {grupo}
          </h3>

          <button
            type="button"
            onClick={() =>
              toggle(tipo, grupo)
            }
            style={{
              width: "28px",
              height: "28px",
              padding: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              lineHeight: "1"
            }}
          >
            {open[tipo][grupo]
              ? "-"
              : "+"}
          </button>

        </div>

        {/* BODY */}
        {open[tipo][grupo] && (

          <div>

            {/* FILA 1 */}
            <div style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "10px"
            }}>

              {[
                "pewee",
                "pequeno",
                "mediano"
              ].map(k => (

                <div key={k}>

                  <label>{k}</label>

                  <input
                    type="number"
                    value={
                      cantidades[tipo][grupo][k]
                    }
                    onChange={(e) =>
                      handleCantidad(
                        tipo,
                        grupo,
                        k,
                        e.target.value
                      )
                    }
                  />

                </div>

              ))}

            </div>

            {/* FILA 2 */}
            <div style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "10px",
              marginTop: "10px"
            }}>

              <div>

                <label>Grande</label>

                <input
                  type="number"
                  value={
                    cantidades[tipo][grupo]
                      .grande
                  }
                  onChange={(e) =>
                    handleCantidad(
                      tipo,
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
                  value={
                    cantidades[tipo][grupo]
                      .extra
                  }
                  onChange={(e) =>
                    handleCantidad(
                      tipo,
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

            {/* ORIGEN */}
            <div style={{ marginTop: "10px" }}>

              <label>Origen</label>

              <select
                value={
                  cantidades[tipo][grupo]
                    .origen
                }
                onChange={(e) =>
                  handleOrigen(
                    tipo,
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
  // RENDER TIPO
  // =========================

  const renderTipo = (tipo) => (

    <div style={{ marginBottom: "40px" }}>

      <h2 style={{
        textTransform: "capitalize"
      }}>
        Huevo {tipo}
      </h2>

      {grupos.map(grupo =>
        renderGrupo(tipo, grupo)
      )}

    </div>

  );

  // =========================
  // RENDER
  // =========================

  return (

    <div className="form-container">

      <h2>Egresos</h2>

      {/* EGRESO */}
      <label># Egreso</label>

      <input
        type="number"
        value={egreso}
        onChange={(e) =>
          setEgreso(e.target.value)
        }
      />

      {/* FECHA */}
      <label>Fecha</label>

      <input
        type="date"
        value={fecha}
        onChange={(e) =>
          setFecha(e.target.value)
        }
      />

      {/* HORA */}
      <label>Hora</label>

      <input
        type="time"
        value={hora}
        onChange={(e) =>
          setHora(e.target.value)
        }
      />

      {/* LOTE */}
      <label># Lote</label>

      <select value={lote} disabled>
        <option>{lote}</option>
      </select>

      {/* BODEGA SALIDA */}
      <label>Bodega de Salida</label>

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

      {/* BODEGA DESTINO */}
      <label>Bodega Destino</label>

      <select
        value={bodegaDestino}
        onChange={(e) =>
          setBodegaDestino(e.target.value)
        }
      >

        <option value="">
          Sin Bodega de Destino
        </option>

        <option>BA</option>
        <option>BH</option>
        <option>BGR</option>
        <option>BI</option>

      </select>

      {/* PLACA */}
      <label>Placa Camión</label>

      <div className="causa-linea">

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
            <option key={i} value={p}>
              {p}
            </option>
          ))}

        </select>

        <input
          type="text"
          value={nuevaPlaca}
          onChange={(e) =>
            setNuevaPlaca(e.target.value)
          }
          placeholder="Nueva placa"
        />

        <button
          type="button"
          onClick={agregarPlaca}
          className="btn-plus"
        >
          +
        </button>

      </div>

      {/* PILOTO */}
      <label>Piloto</label>

      <div className="causa-linea">

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
            <option key={i} value={p}>
              {p}
            </option>
          ))}

        </select>

        <input
          type="text"
          value={nuevoPiloto}
          onChange={(e) =>
            setNuevoPiloto(e.target.value)
          }
          placeholder="Nuevo piloto"
        />

        <button
          type="button"
          onClick={agregarPiloto}
          className="btn-plus"
        >
          +
        </button>

      </div>

      {/* HUEVO BLANCO */}
      {renderTipo("blanco")}

      {/* HUEVO ROJO */}
      {renderTipo("rojo")}

      {/* FECHA PRODUCCIÓN */}
      <label>Fecha Producción</label>

      <input
        type="date"
        value={fecha}
        onChange={(e) =>
          setFecha(e.target.value)
        }
      />

      {/* BOTÓN */}
      <button onClick={guardar}>
        Registrar Egreso
      </button>

    </div>
  );
}

export default EgresoHuevos;