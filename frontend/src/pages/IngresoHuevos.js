import { useEffect, useState } from "react";

function IngresoHuevos() {

  // =========================
  // STATES BASE
  // =========================

  const [fecha, setFecha] = useState("");

  const [lote] = useState("REP-260401-1600");

  const [loteProd, setLoteProd] = useState("");

  const [origen, setOrigen] = useState("");

  // =========================
  // EXPANSIÓN DE GRUPOS
  // =========================

  const [open, setOpen] = useState({
    incubable: false,
    comercial: false,
    sucio: false,
    quebrado: false,
    otros: false
  });

  // =========================
  // CANTIDADES
  // =========================

  const [cantidades, setCantidades] = useState({
    incubable: { pewee: 0, pequeno: 0, mediano: 0, grande: 0, extra: 0 },

    comercial: { pewee: 0, pequeno: 0, mediano: 0, grande: 0, extra: 0 },

    sucio: { pewee: 0, pequeno: 0, mediano: 0, grande: 0, extra: 0 },

    quebrado: { pewee: 0, pequeno: 0, mediano: 0, grande: 0, extra: 0 },

    otros: { pewee: 0, pequeno: 0, mediano: 0, grande: 0, extra: 0 }
  });

  // =========================
  // FECHA + LOTE
  // =========================

  useEffect(() => {

    const now = new Date();

    setFecha(now.toISOString().split("T")[0]);

    const loteGen =
      "PRO-" +
      String(now.getFullYear()).slice(2) +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      "-" +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0");

    setLoteProd(loteGen);

  }, []);

  // =========================
  // HANDLE INPUTS
  // =========================

  const handleCantidad = (grupo, campo, value) => {

    setCantidades(prev => ({
      ...prev,
      [grupo]: {
        ...prev[grupo],
        [campo]: value
      }
    }));
  };

  // =========================
  // TOTAL POR GRUPO
  // =========================

  const calcularTotal = (grupo) => {

    const g = cantidades[grupo];

    return Object.values(g)
      .reduce((a, b) => a + (parseInt(b) || 0), 0);
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
      loteProd,
      origen,
      cantidades
    };

    console.log(data);

    alert("Registro guardado correctamente");
  };

  // =========================
  // RENDER GRUPO
  // =========================

  const renderGrupo = (nombre) => {

    const total = calcularTotal(nombre);

    return (

      <div style={{ marginBottom: "20px" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

          <h3 style={{ margin: 0, textTransform: "capitalize" }}>
            {nombre}
          </h3>

          <button
            onClick={() => toggle(nombre)}
            style={{
              width: "28px",
              height: "28px",
              padding: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              lineHeight: "1"
            }}>

            {open[nombre] ? "-" : "+"}
          </button>

        </div>

        {/* BODY */}
        {open[nombre] && (

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
                    value={cantidades[nombre][k]}
                    onChange={(e) =>
                      handleCantidad(nombre, k, e.target.value)
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
                <label>grande</label>
                <input
                  type="number"
                  value={cantidades[nombre].grande}
                  onChange={(e) =>
                    handleCantidad(nombre, "grande", e.target.value)
                  }
                />
              </div>

              <div>
                <label>extra</label>
                <input
                  type="number"
                  value={cantidades[nombre].extra}
                  onChange={(e) =>
                    handleCantidad(nombre, "extra", e.target.value)
                  }
                />
              </div>

              {/* TOTAL EN MISMA LÍNEA */}
              <div>
                <label>Total</label>
                <input type="number" value={total} readOnly />
              </div>

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

      <h2>Ingreso de Huevos</h2>

      {/* FECHA */}
      <label>Fecha</label>
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />

      {/* LOTE */}
      <label>Lote</label>
      <select disabled>
        <option>{lote}</option>
      </select>

      {/* LOTE PROD */}
      <label>Lote Producción</label>
      <input value={loteProd} readOnly />

      {/* GRUPOS */}
      {renderGrupo("incubable")}
      {renderGrupo("comercial")}
      {renderGrupo("sucio")}
      {renderGrupo("quebrado")}
      {renderGrupo("otros")}

      {/* ORIGEN */}
      <label>Origen</label>
      <select value={origen} onChange={(e) => setOrigen(e.target.value)}>
        <option value="">Seleccione</option>
        <option value="Nido">Nido</option>
        <option value="Piso">Piso</option>
      </select>

      {/* GUARDAR */}
      <button onClick={guardar}>
        Guardar
      </button>

    </div>
  );
}

export default IngresoHuevos;