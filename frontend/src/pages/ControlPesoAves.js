import { useEffect, useState } from "react";

function ControlPesoAves() {
  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");
  const [lote] = useState("REP-260401-1600");

  const [etapa, setEtapa] = useState("");
  const [nuevaEtapa, setNuevaEtapa] = useState("");
  const [mostrarNuevaEtapa, setMostrarNuevaEtapa] = useState(false);

  const [semana] = useState(1);
  const [uniformidad, setUniformidad] = useState("");

  const [tamanoMuestra, setTamanoMuestra] = useState(20);

  const [promedioGeneral, setPromedioGeneral] = useState(0);

  const [etapas, setEtapas] = useState([]);

  const [expandH, setExpandH] = useState(true);
  const [expandM, setExpandM] = useState(true);

  // =========================
  // PESOS
  // =========================

  const [hembras, setHembras] = useState({});
  const [machos, setMachos] = useState({});

  const [promHembras, setPromHembras] = useState(0);
  const [promMachos, setPromMachos] = useState(0);

  // =========================
  // INIT
  // =========================

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];
    setFecha(hoy);

    setEtapas(["Crianza", "Levante", "Producción"]);
  }, []);

  // =========================
  // HELPERS
  // =========================

  const calcularPromedio = (obj) => {
    const vals = Object.values(obj);
    let suma = 0;
    let count = 0;

    vals.forEach((v) => {
      const n = parseFloat(v);
      if (!isNaN(n)) {
        suma += n;
        count++;
      }
    });

    return count ? suma / count : 0;
  };

  const generarInputs = (base, setFn, size) => {
    const obj = {};
    for (let i = 1; i <= size; i++) obj[`m${i}`] = base[`m${i}`] || "";
    setFn(obj);
  };

  // =========================
  // EFECTO TAMANO MUESTRA
  // =========================

  useEffect(() => {
    generarInputs(hembras, setHembras, tamanoMuestra);
    generarInputs(machos, setMachos, tamanoMuestra);
  }, [tamanoMuestra]);

  // =========================
  // PROMEDIOS
  // =========================

  useEffect(() => {
    setPromHembras(calcularPromedio(hembras));
  }, [hembras]);

  useEffect(() => {
    setPromMachos(calcularPromedio(machos));
  }, [machos]);

  useEffect(() => {
    const g =
      (parseFloat(promHembras) + parseFloat(promMachos)) / 2 || 0;

    setPromedioGeneral(g);
  }, [promHembras, promMachos]);

  // =========================
  // UNIFORMIDAD (±10%)
  // =========================

  useEffect(() => {
    const all = [...Object.values(hembras), ...Object.values(machos)]
      .map(Number)
      .filter((n) => !isNaN(n));

    if (!all.length || !promedioGeneral) {
      setUniformidad(0);
      return;
    }

    const min = promedioGeneral * 0.9;
    const max = promedioGeneral * 1.1;

    const dentro = all.filter((n) => n >= min && n <= max).length;

    setUniformidad(((dentro / all.length) * 100).toFixed(2));
  }, [hembras, machos, promedioGeneral]);

  // =========================
  // HANDLERS
  // =========================

  const handleChangeH = (e) =>
    setHembras({ ...hembras, [e.target.name]: e.target.value });

  const handleChangeM = (e) =>
    setMachos({ ...machos, [e.target.name]: e.target.value });

  // =========================
  // ETAPA
  // =========================

  const agregarEtapa = () => {
    if (!mostrarNuevaEtapa) return setMostrarNuevaEtapa(true);
    if (!nuevaEtapa.trim()) return;

    setEtapas([...etapas, nuevaEtapa]);
    setEtapa(nuevaEtapa);
    setNuevaEtapa("");
    setMostrarNuevaEtapa(false);
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = () => {
    console.log({
      fecha,
      lote,
      semana,
      etapa,
      tamanoMuestra,
      promedioGeneral,
      uniformidad,
      hembras,
      machos
    });

    alert("Guardado");
  };

  // =========================
  // RENDER GRID 5
  // =========================

  const renderInputs = (data, handler) => {
    const keys = Object.keys(data);

    const rows = [];
    for (let i = 0; i < keys.length; i += 5) {
      rows.push(keys.slice(i, i + 5));
    }

    return rows.map((row, i) => (
      <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        {row.map((k) => (
          <input
            key={k}
            name={k}
            value={data[k]}
            onChange={handler}
            style={{ flex: 1, padding: "8px" }}
          />
        ))}
      </div>
    ));
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div style={{ maxWidth: 950, margin: "auto", fontFamily: "Arial" }}>
      <h2>Control Peso Aves</h2>

      {/* HEADER */}
      <div style={{ display: "flex", gap: 10 }}>
        <input value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <input value={lote} readOnly />
        <input value={semana} readOnly />
      </div>

      {/* ETAPA */}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <select value={etapa} onChange={(e) => setEtapa(e.target.value)}>
          <option value="">Seleccione</option>
          {etapas.map((e, i) => (
            <option key={i}>{e}</option>
          ))}
        </select>

        <button onClick={agregarEtapa} type="button">+</button>

        <input
          type="number"
          value={tamanoMuestra}
          onChange={(e) => setTamanoMuestra(Number(e.target.value))}
        />

        <input value={promedioGeneral.toFixed(2)} readOnly />

        <input value={uniformidad} readOnly />
      </div>

      {/* HEMBRAS */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>
          Hembras{" "}
          <button onClick={() => setExpandH(!expandH)} type="button">
            {expandH ? "-" : "+"}
          </button>
        </h3>
        <span>Prom: {promHembras.toFixed(2)}</span>
      </div>

      {expandH && renderInputs(hembras, handleChangeH)}

      {/* MACHOS */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>
          Machos{" "}
          <button onClick={() => setExpandM(!expandM)} type="button">
            {expandM ? "-" : "+"}
          </button>
        </h3>
        <span>Prom: {promMachos.toFixed(2)}</span>
      </div>

      {expandM && renderInputs(machos, handleChangeM)}

      <button onClick={guardar} style={{ marginTop: 20 }}>
        Guardar
      </button>
    </div>
  );
}

export default ControlPesoAves;
