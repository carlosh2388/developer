import { useEffect, useState } from "react";

function ControlPesoAves() {
  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");
  const [lote, setLote] = useState("");

  const [etapa, setEtapa] = useState("");
  const [nuevaEtapa, setNuevaEtapa] = useState("");
  const [mostrarNuevaEtapa, setMostrarNuevaEtapa] = useState(false);

  const [semana] = useState(1);

  const [tamanoMuestra, setTamanoMuestra] = useState(0);

  const [uniformidad, setUniformidad] = useState(0);
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

// NUEVO
const [uniformidadHembras, setUniformidadHembras] =
  useState(0);

const [uniformidadMachos, setUniformidadMachos] =
  useState(0);

  // =========================
  // INIT
  // =========================

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];
    setFecha(hoy);

    setEtapas(["Crianza", "Producción"]);
  }, []);

  // =========================
  // PROMEDIO
  // =========================

  const calcularPromedio = (obj) => {
    let suma = 0;
    let count = 0;

    Object.values(obj).forEach((v) => {
      const n = parseFloat(v);
      if (!isNaN(n)) {
        suma += n;
        count++;
      }
    });

    return count ? suma / count : 0;
  };

  // =========================
  // DISTRIBUCIÓN MUESTRA
  // =========================

  const buildSamples = (total, setFn) => {
    const half = Math.floor(total / 2);

    const obj = {};

    for (let i = 1; i <= half; i++) obj[`m${i}`] = "";
    setFn(obj);
  };

  useEffect(() => {
    buildSamples(tamanoMuestra, setHembras);
    buildSamples(tamanoMuestra, setMachos);
  }, [tamanoMuestra]);

  // =========================
  // PROMEDIOS
  // =========================

useEffect(() => {
  setPromHembras(
    calcularPromedio(hembras)
  );
}, [hembras]);

useEffect(() => {
  const valores = Object.values(hembras)
    .map(Number)
    .filter((v) => !isNaN(v));

  if (!valores.length || !promHembras) {
    setUniformidadHembras(0);
    return;
  }

  const min = promHembras * 0.9;
  const max = promHembras * 1.1;

  const dentroRango =
    valores.filter(
      (v) =>
        v >= min &&
        v <= max
    ).length;

  setUniformidadHembras(
    (
      (dentroRango /
        valores.length) *
      100
    ).toFixed(2)
  );
}, [hembras, promHembras]);

useEffect(() => {
  setPromMachos(
    calcularPromedio(machos)
  );
}, [machos]);

useEffect(() => {
  const valores = Object.values(machos)
    .map(Number)
    .filter((v) => !isNaN(v));

  if (!valores.length || !promMachos) {
    setUniformidadMachos(0);
    return;
  }

  const min = promMachos * 0.9;
  const max = promMachos * 1.1;

  const dentroRango =
    valores.filter(
      (v) =>
        v >= min &&
        v <= max
    ).length;

  setUniformidadMachos(
    (
      (dentroRango /
        valores.length) *
      100
    ).toFixed(2)
  );
}, [machos, promMachos]);

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

    const ok = all.filter((n) => n >= min && n <= max).length;

    setUniformidad(((ok / all.length) * 100).toFixed(2));
  }, [hembras, machos, promedioGeneral]);

  // =========================
  // HANDLERS
  // =========================

  const handleH = (e) =>
    setHembras({ ...hembras, [e.target.name]: e.target.value });

  const handleM = (e) =>
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
  // RENDER INPUTS (FILAS DE 5)
  // =========================

  const renderInputs = (data, handler) => {
    const keys = Object.keys(data);
    const rows = [];

    for (let i = 0; i < keys.length; i += 5) {
      rows.push(keys.slice(i, i + 5));
    }

    return rows.map((row, i) => (
      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        {row.map((k) => (
          <input
            key={k}
            name={k}
            value={data[k]}
            onChange={handler}
            style={{ flex: 1, padding: 8 }}
          />
        ))}
      </div>
    ));
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
      machos,
      uniformidadHembras,
      uniformidadMachos
    });

    alert("Guardado");
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div style={{ maxWidth: 950, margin: "auto", fontFamily: "Arial" }}>
      <h2>Control Peso Aves</h2>

      {/* ================= FECHA / LOTE / SEMANA ================= */}
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label>Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>

        <div style={{ flex: 1 }}>
          <label># Lote</label>
          <select value={lote} onChange={(e) => setLote(e.target.value)}>
            <option value="">Seleccione</option>
            <option value="SL-001">SL-001</option>
            <option value="BL-001">BL-001</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label>Semana</label>
          <input value={semana} readOnly />
        </div>
      </div>

      {/* ================= ETAPA / MUESTRA / PROM / UNI ================= */}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <div style={{ flex: 2 }}>
          <label>Etapa</label>
          <div style={{ display: "flex", gap: 10 }}>
            <select value={etapa} onChange={(e) => setEtapa(e.target.value)}>
              <option value="">Seleccione</option>
              {etapas.map((e, i) => (
                <option key={i}>{e}</option>
              ))}
            </select>

            <button type="button" onClick={agregarEtapa}>+</button>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <label>Tamaño de la Muestra</label>
          <input
            type="number"
            value={tamanoMuestra}
            onChange={(e) => setTamanoMuestra(Number(e.target.value))}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label>Promedio General</label>
          <input value={promedioGeneral.toFixed(2)} readOnly />
        </div>

        <div style={{ flex: 1 }}>
          <label>% Uniformidad</label>
          <input value={uniformidad} readOnly />
        </div>
      </div>

      {/* ========================= HEMBRAS ========================= */}
      
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20
        }}
      >
        <h3 style={{ margin: 0 }}>Hembras</h3>
      
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span>
            Uniformidad: {uniformidadHembras}% |
            {" "}
            Prom: {promHembras.toFixed(2)}
          </span>
      
          <button
            type="button"
            onClick={() => setExpandH(!expandH)}
            style={{
              padding: "4px 10px",
              cursor: "pointer"
            }}
          >
            {expandH ? "-" : "+"}
          </button>
        </div>
      </div>
      
      {expandH && renderInputs(hembras, handleH)}

      {/* ========================= MACHOS ========================= */}
      
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20
        }}
      >
        <h3 style={{ margin: 0 }}>Machos</h3>
      
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span>
          Uniformidad: {uniformidadMachos}% |
          {" "}
          Prom: {promMachos.toFixed(2)}
        </span>
      
          <button
            type="button"
            onClick={() => setExpandM(!expandM)}
            style={{
              padding: "4px 10px",
              cursor: "pointer"
            }}
          >
            {expandM ? "-" : "+"}
          </button>
        </div>
      </div>
      
      {expandM && renderInputs(machos, handleM)}

      {/* ================= GUARDAR ================= */}
      <button onClick={guardar} style={{ marginTop: 20 }}>
        Guardar Registro
      </button>
    </div>
  );
}

export default ControlPesoAves;
