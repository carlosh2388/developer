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
  // GRUPOS (UN SOLO NIVEL)
  // =========================

  const grupos = [
    "incubable",
    "comercial",
    "sucio",
    "quebrado",
    "otros"
  ];

  const tipos = ["blanco", "rojo"];

  // =========================
  // OPEN STATE (SIMPLIFICADO)
  // =========================

  const [open, setOpen] = useState({
    incubable: false,
    comercial: false,
    sucio: false,
    quebrado: false,
    otros: false
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
  // CANTIDADES (SIN BLANCO/ROJO)
  // =========================

  const [cantidades, setCantidades] = useState({
    incubable: crearGrupo(),
    comercial: crearGrupo(),
    sucio: crearGrupo(),
    quebrado: crearGrupo(),
    otros: crearGrupo()
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
    grupo,
    campo,
    value
  ) => {

    setCantidades(prev => ({
      ...prev,
      [grupo]: {
        ...prev[grupo],
        [campo]: value
      }
    }));
  };

  // =========================
  // HANDLE ORIGEN
  // =========================

  const handleOrigen = (
    grupo,
    value
  ) => {

    setCantidades(prev => ({
      ...prev,
      [grupo]: {
        ...prev[grupo],
        origen: value
      }
    }));
  };

  // =========================
  // TOTAL
  // =========================

  const calcularTotal = (grupo) => {

    const g = cantidades[grupo];

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

  const toggle = (grupo) => {

    setOpen(prev => ({
      ...prev,
      [grupo]: !prev[grupo]
    }));
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
      lote,
      bodegaSalida,
      bodegaDestino,
      placa,
      piloto,
      cantidades
    };

    console.log(data);

    alert("Egreso registrado correctamente");
  };

  // =========================
  // STYLES (BOTÓN IGUAL INCUBABLE)
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

  const renderGrupo = (grupo) => {

    const total = calcularTotal(grupo);

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
            onClick={() => toggle(grupo)}
            style={smallButton}
          >
            {open[grupo] ? "-" : "+"}
          </button>

        </div>

        {open[grupo] && (

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
                    value={cantidades[grupo][k]}
                    onChange={(e) =>
                      handleCantidad(grupo, k, e.target.value)
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
                  value={cantidades[grupo].grande}
                  onChange={(e) =>
                    handleCantidad(grupo, "grande", e.target.value)
                  }
                />
              </div>

              <div>
                <label>Extra</label>
                <input
                  type="number"
                  value={cantidades[grupo].extra}
                  onChange={(e) =>
                    handleCantidad(grupo, "extra", e.target.value)
                  }
                />
              </div>

              <div>
                <label>Total</label>
                <input type="number" value={total} readOnly />
              </div>

            </div>

            <div style={{ marginTop: "10px" }}>
              <label>Origen</label>

              <select
                value={cantidades[grupo].origen}
                onChange={(e) =>
                  handleOrigen(grupo, e.target.value)
                }
              >

                <option value="">Seleccione</option>
                <option value="Nido">Nido</option>
                <option value="Piso">Piso</option>

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
          <input value={egreso} onChange={(e) => setEgreso(e.target.value)} />
        </div>

        <div>
          <label>Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>

        <div>
          <label>Hora</label>
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
        </div>

      </div>

      {/* FILA 2 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "10px",
        marginTop: "10px"
      }}>

        <div>
          <label># Lote</label>
          <select disabled>
            <option>{lote}</option>
          </select>
        </div>

        <div>
          <label>Bodega Salida</label>
          <select value={bodegaSalida} onChange={(e) => setBodegaSalida(e.target.value)}>
            <option>BA</option>
            <option>BH</option>
            <option>BGR</option>
            <option>BI</option>
          </select>
        </div>

        <div>
          <label>Bodega Destino</label>
          <select value={bodegaDestino} onChange={(e) => setBodegaDestino(e.target.value)}>
            <option value="">Sin Bodega</option>
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

          <div style={{ display: "flex", gap: "8px" }}>
            <select value={placa} onChange={(e) => setPlaca(e.target.value)}>
              <option value="">Seleccione</option>
              {placas.map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setMostrarNuevaPlaca(true)}
              style={smallButton}
            >
              +
            </button>
          </div>

          {mostrarNuevaPlaca && (
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <input value={nuevaPlaca} onChange={(e) => setNuevaPlaca(e.target.value)} />
              <button type="button" onClick={agregarPlaca}>Guardar</button>
            </div>
          )}
        </div>

        {/* PILOTO */}
        <div>
          <label>Piloto</label>

          <div style={{ display: "flex", gap: "8px" }}>
            <select value={piloto} onChange={(e) => setPiloto(e.target.value)}>
              <option value="">Seleccione</option>
              {pilotos.map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setMostrarNuevoPiloto(true)}
              style={smallButton}
            >
              +
            </button>
          </div>

          {mostrarNuevoPiloto && (
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <input value={nuevoPiloto} onChange={(e) => setNuevoPiloto(e.target.value)} />
              <button type="button" onClick={agregarPiloto}>Guardar</button>
            </div>
          )}
        </div>

      </div>

      {/* SOLO GRUPOS (UNA VEZ) */}
      {grupos.map(renderGrupo)}

      {/* FECHA PRODUCCIÓN */}
      <label>Fecha Producción</label>
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />

      <button onClick={guardar}>
        Registrar Egreso
      </button>

    </div>
  );
}

export default EgresoHuevos;