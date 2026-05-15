import { useEffect, useState } from "react";

function IngresoHuevos() {

  // =========================
  // STATES BASE
  // =========================

  const [fecha, setFecha] = useState("");

  const [lote] = useState("REP-260401-1600");

  // =========================
  // SUBGRUPOS (UN SOLO NIVEL)
  // =========================

  const grupos = [
    "incubable",
    "comercial",
    "sucio",
    "quebrado",
    "otros"
  ];

  // =========================
  // OPEN STATE (SIN BLANCO/ROJO)
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
  // CANTIDADES (SIN TIPOS)
  // =========================

  const [cantidades, setCantidades] = useState({
    incubable: crearGrupo(),
    comercial: crearGrupo(),
    sucio: crearGrupo(),
    quebrado: crearGrupo(),
    otros: crearGrupo()
  });

  // =========================
  // FECHA + INIT
  // =========================

  useEffect(() => {

    const now = new Date();

    setFecha(now.toISOString().split("T")[0]);

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
  // GUARDAR
  // =========================

  const guardar = () => {

    const data = {
      fecha,
      lote,
      cantidades
    };

    console.log(data);

    alert("Registro guardado correctamente");
  };

  // =========================
  // RENDER GRUPO
  // =========================

  const renderGrupo = (grupo) => {

    const total = calcularTotal(grupo);

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
            textTransform: "capitalize",
            fontSize: "18px",
            fontWeight: "400"
          }}>
            {grupo}
          </h3>

          <button
            type="button"
            onClick={() => toggle(grupo)}
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
            {open[grupo] ? "-" : "+"}
          </button>

        </div>

        {/* BODY */}
        {open[grupo] && (

          <div>

            {/* FILA 1 */}
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

            {/* FILA 2 */}
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

            {/* ORIGEN */}
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

      <h2>Ingreso de Huevos (Clasificación)</h2>

      {/* FECHA */}
      <label>Fecha</label>

      <input
        type="date"
        value={fecha}
        onChange={(e) =>
          setFecha(e.target.value)
        }
      />

      {/* LOTE */}
      <label>Lote</label>

      <select disabled>
        <option>{lote}</option>
      </select>

      {/* GRUPOS (UNA SOLA VEZ) */}
      {grupos.map(renderGrupo)}

      {/* GUARDAR */}
      <button onClick={guardar}>
        Guardar
      </button>

    </div>
  );
}

export default IngresoHuevos;