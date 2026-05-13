import { useEffect, useState } from "react";

function IngresoHuevos() {

  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");

  const [lote] = useState("REP-260401-1600");

  const [loteProd, setLoteProd] = useState("");

  const [origen, setOrigen] = useState("");

  const [total, setTotal] = useState(0);

  const [cantidades, setCantidades] = useState({
    incubable: 0,

    pewee: 0,
    pequeno: 0,
    mediano: 0,
    grande: 0,
    extra: 0,

    comercial_pewee: 0,
    comercial_pequeno: 0,
    comercial_mediano: 0,
    comercial_grande: 0,
    comercial_extra: 0,

    sucio: 0,
    quebrado: 0,
    otros: 0
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
  // TOTAL GENERAL
  // =========================

  useEffect(() => {

    const suma = Object.values(cantidades)
      .reduce((a, b) => a + (parseInt(b) || 0), 0);

    setTotal(suma);

  }, [cantidades]);

  // =========================
  // INPUTS
  // =========================

  const handleCantidad = (e) => {

    setCantidades({
      ...cantidades,
      [e.target.name]: e.target.value
    });
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
      cantidades,
      total
    };

    console.log(data);

    alert("Registro de ingreso guardado correctamente");
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
      <label># Lote</label>
      <select value={lote} disabled>
        <option>{lote}</option>
      </select>

      {/* LOTE PROD */}
      <label># Lote de Producción</label>
      <input type="text" value={loteProd} readOnly />

      {/* =========================
          INCUBABLE
      ========================= */}
      <label>Incubable</label>

      <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>

        {["incubable"].map((k) => (
          <div key={k}>
            <input
              type="number"
              name={k}
              value={cantidades[k]}
              onChange={handleCantidad}
            />
          </div>
        ))}

      </div>

      <hr />

      {/* =========================
          COMERCIAL
      ========================= */}
      <label>Comercial</label>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>

        {["pewee", "pequeno", "mediano"].map((k) => (
          <div key={k}>
            <label>{k}</label>
            <input
              type="number"
              name={k}
              value={cantidades[k]}
              onChange={handleCantidad}
            />
          </div>
        ))}

      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginTop: "10px" }}>

        {["grande", "extra"].map((k) => (
          <div key={k}>
            <label>{k}</label>
            <input
              type="number"
              name={k}
              value={cantidades[k]}
              onChange={handleCantidad}
            />
          </div>
        ))}

      </div>

      <hr />

      {/* =========================
          OTROS
      ========================= */}
      <label>Otros</label>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>

        {["sucio", "quebrado", "otros"].map((k) => (
          <div key={k}>
            <label>{k}</label>
            <input
              type="number"
              name={k}
              value={cantidades[k]}
              onChange={handleCantidad}
            />
          </div>
        ))}

      </div>

      {/* =========================
          TOTAL
      ========================= */}
      <label>Cantidad Total</label>
      <input type="number" value={total} readOnly />

      {/* ORIGEN (opcional mantener) */}
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