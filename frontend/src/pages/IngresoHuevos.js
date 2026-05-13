import { useEffect, useState } from "react";

function IngresoHuevos() {

  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");

  const [lote] = useState("REP-260401-1600");

  const [loteProd, setLoteProd] = useState("");

  const [clasificacion, setClasificacion] = useState("");

  const [origen, setOrigen] = useState("");

  const [total, setTotal] = useState(0);

  const [cantidades, setCantidades] = useState({
    pewee: 0,
    pequeno: 0,
    mediano: 0,
    grande: 0,
    extra: 0,
    mixto: 0
  });

  // =========================
  // FECHA + LOTE AUTOMÁTICO
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
  // TOTAL AUTOMÁTICO
  // =========================

  useEffect(() => {

    const suma = Object.values(cantidades)
      .reduce((a, b) => a + (parseInt(b) || 0), 0);

    setTotal(suma);

  }, [cantidades]);

  // =========================
  // HANDLE INPUTS
  // =========================

  const handleCantidad = (e) => {

    setCantidades({
      ...cantidades,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // REGLA DE NEGOCIO
  // =========================

  const handleClasificacion = (e) => {

    const value = e.target.value;

    setClasificacion(value);

    if (value === "Incubable") {
      setOrigen("Nido");
    }
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = () => {

    const data = {

      fecha,
      lote,
      loteProd,
      clasificacion,
      origen,
      cantidades,
      total
    };

    console.log(data);

    alert("Registro de clasificación guardado correctamente");
  };

  // =========================
  // RENDER
  // =========================

  return (

    <div className="container">

      <h2>Clasificación de Huevos</h2>

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
      <label># Lote</label>

      <select value={lote} disabled>
        <option>{lote}</option>
      </select>

      {/* LOTE PROD */}
      <label># Lote de Producción</label>

      <input type="text" value={loteProd} readOnly />

      {/* CLASIFICACIÓN */}
      <label>Clasificación</label>

      <select
        value={clasificacion}
        onChange={handleClasificacion}
      >

        <option value="">
          Seleccione
        </option>

        <option value="Incubable">
          Incubable
        </option>

        <option value="Comercial">
          Comercial
        </option>

        <option value="Sucio">
          Sucio
        </option>

        <option value="Quebrado">
          Quebrado
        </option>

        <option value="Otros">
          Otros
        </option>

      </select>

      <hr />

      {/* GRID CANTIDADES */}
      <div className="grid">

        {Object.keys(cantidades).map((k) => (
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

      {/* TOTAL */}
      <label>Cantidad Total</label>

      <input type="number" value={total} readOnly />

      {/* ORIGEN */}
      <label>Origen</label>

      <select
        value={origen}
        onChange={(e) =>
          setOrigen(e.target.value)
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

      {/* BOTÓN */}
      <button onClick={guardar}>
        Guardar
      </button>

    </div>
  );
}

export default IngresoHuevos;