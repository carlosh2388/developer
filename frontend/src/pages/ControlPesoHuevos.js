import { useEffect, useState } from "react";

function ControlPesoHuevos() {

  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");

  const [lote] = useState("REP-260401-1600");

  const [muestras, setMuestras] = useState({
    m1: "",
    m2: "",
    m3: "",
    m4: "",
    m5: "",
    m6: ""
  });

  const [promedio, setPromedio] = useState(0);

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
  // CALCULAR PROMEDIO
  // =========================

  useEffect(() => {

    let suma = 0;
    let count = 0;

    Object.values(muestras).forEach((val) => {

      const num = parseFloat(val);

      if (!isNaN(num)) {
        suma += num;
        count++;
      }
    });

    setPromedio(
      count > 0 ? (suma / count).toFixed(2) : 0
    );

  }, [muestras]);

  // =========================
  // HANDLE INPUTS
  // =========================

  const handleChange = (e) => {

    setMuestras({
      ...muestras,
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
      ...muestras,
      promedio
    };

    console.log(data);

    alert("Registro de pesos de huevos guardado correctamente");
  };

  // =========================
  // RENDER
  // =========================

  return (

    <div className="form-container">

      <h2>Registro de Pesos de Huevos</h2>

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

      {/* MUESTRAS */}
      <label>Peso Muestra 1</label>

      <input
        name="m1"
        type="number"
        step="0.01"
        value={muestras.m1}
        onChange={handleChange}
      />

      <label>Peso Muestra 2 (opcional)</label>

      <input
        name="m2"
        type="number"
        step="0.01"
        value={muestras.m2}
        onChange={handleChange}
      />

      <label>Peso Muestra 3 (opcional)</label>

      <input
        name="m3"
        type="number"
        step="0.01"
        value={muestras.m3}
        onChange={handleChange}
      />

      <label>Peso Muestra 4 (opcional)</label>

      <input
        name="m4"
        type="number"
        step="0.01"
        value={muestras.m4}
        onChange={handleChange}
      />

      <label>Peso Muestra 5 (opcional)</label>

      <input
        name="m5"
        type="number"
        step="0.01"
        value={muestras.m5}
        onChange={handleChange}
      />

      <label>Peso Muestra 6 (opcional)</label>

      <input
        name="m6"
        type="number"
        step="0.01"
        value={muestras.m6}
        onChange={handleChange}
      />

      {/* PROMEDIO */}
      <label>Peso Promedio</label>

      <input
        type="number"
        value={promedio}
        readOnly
      />

      {/* BOTÓN */}
      <button onClick={guardar}>
        Guardar Registro
      </button>

    </div>
  );
}

export default ControlPesoHuevos;