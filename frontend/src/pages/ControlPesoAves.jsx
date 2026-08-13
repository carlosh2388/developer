import { useEffect, useState } from "react";
import { post, saveOperation } from "../services/operations";
import { api } from "../services/api";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";
import OperationRecordsModal from "../components/OperationRecordsModal";
import OperationPanel from "../components/OperationPanel";
import { calculateFlockWeek } from "../utils/flockWeek";

function ControlPesoAves() {
  const { opciones, errors, lotes } = useOperationalCatalogs(["lotes", "etapas"]);
  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");
  const [lote, setLote] = useState("");

  const [etapa, setEtapa] = useState("");
  const [nuevaEtapa, setNuevaEtapa] = useState("");
  const [mostrarNuevaEtapa, setMostrarNuevaEtapa] = useState(false);

  const [semana, setSemana] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const cargarEdicion = async (row) => { try { const data = await api(`/controles/peso-aves/${row.id}`); setEditingId(row.id); setFecha(String(data.control_date).slice(0, 10)); setLote(data.flock_code); setEtapa(data.stage_code || ""); setSemana(data.week_number); setTamanoMuestra(data.sample_size); const female = {}, male = {}; data.muestras.forEach((item) => (item.sex === "F" ? female : male)[item.sample_number] = String(item.weight_grams)); setHembras(female); setMachos(male); } catch (error) { alert(error.message); } };

  const [tamanoMuestra, setTamanoMuestra] = useState(0);

  const [uniformidad, setUniformidad] = useState(0);
  const [promedioGeneral, setPromedioGeneral] = useState(0);

  const [etapasNuevas, setEtapasNuevas] = useState([]);
  const etapas = [...opciones("etapas"), ...etapasNuevas];

  const [expandH, setExpandH] = useState(true);
  const [expandM, setExpandM] = useState(true);

// =========================
// PESOS
// =========================

const [hembras, setHembras] = useState({});
const [machos, setMachos] = useState({});

const [promHembras, setPromHembras] = useState(0);
  const [promMachos, setPromMachos] = useState(0);

  useEffect(() => {
    if (!lote) { setSemana(""); return; }
    const registroLote = lotes.find((item) => item.code === lote);
    setSemana(calculateFlockWeek(registroLote?.receivedOn));
  }, [lote, lotes]);

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

  const agregarEtapa = async () => {
    if (!mostrarNuevaEtapa) return setMostrarNuevaEtapa(true);
    if (!nuevaEtapa.trim()) return;

    const codigo = `ETA-${Date.now().toString().slice(-6)}`;
    let creada;
    try { creada = await post("/etapas-produccion", { codigo, nombre: nuevaEtapa, estado: "ACTIVE" }); }
    catch (error) { alert(error.message); return; }
    setEtapasNuevas((current) => [...current, { value: creada.code || codigo, label: creada.name || nuevaEtapa }]);
    setEtapa(codigo);
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

  const guardar = async () => {
    try {
      const muestras = [...Object.values(hembras).map((pesoGramos) => ({ sexo: "F", pesoGramos: Number(pesoGramos) })),
        ...Object.values(machos).map((pesoGramos) => ({ sexo: "M", pesoGramos: Number(pesoGramos) }))].filter((x) => x.pesoGramos > 0);
      await saveOperation("/controles/peso-aves", { fecha, lote, semana, etapa, promedioHembras: promHembras,
        promedioMachos: promMachos, promedioGeneral, uniformidadHembras, uniformidadMachos, uniformidadGeneral: uniformidad, muestras }, editingId);
      alert(editingId ? "Control actualizado correctamente" : "Control de peso guardado correctamente");
      setEditingId(null);
      setFecha(new Date().toISOString().split("T")[0]);
      setLote("");
      setEtapa("");
      setSemana(1);
      setTamanoMuestra(0);
      setHembras({});
      setMachos({});
      setPromHembras(0);
      setPromMachos(0);
      setPromedioGeneral(0);
      setUniformidadHembras(0);
      setUniformidadMachos(0);
      setUniformidad(0);
    } catch (error) { alert(error.message); }
  };

  // =========================
  // RENDER
  // =========================

  return (<OperationPanel maxWidth={1000}><OperationRecordsModal title="Controles de peso de aves" path="/controles/peso-aves" annulPath={(row) => `/operaciones/peso-aves/${row.id}/anular`} dateField="control_date" columns={[
    { key: "control_date", label: "Fecha", render: (value) => String(value || "").slice(0, 10) },
    { key: "flock_code", label: "Lote", render: (value, row) => value || row.flockCode || "Sin lote" },
    { key: "week_number", label: "Semana" }, { key: "sample_size", label: "Muestras" }, { key: "overall_average_grams", label: "Promedio" }, { key: "overall_uniformity", label: "Uniformidad" }, { key: "status", label: "Estado" },
  ]} onEdit={cargarEdicion}/>
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
            {opciones("lotes").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          {errors.lotes && <small style={{ color: "#b91c1c", display: "block" }}>No se pudieron cargar los lotes: {errors.lotes}</small>}
          {!errors.lotes && opciones("lotes").length === 0 && <small style={{ color: "#92400e", display: "block" }}>No existen lotes activos. Registra primero un lote en Configuración → Lotes.</small>}
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
              {etapas.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>

            <button type="button" onClick={agregarEtapa}>+</button>
          </div>
          {mostrarNuevaEtapa && <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input autoFocus value={nuevaEtapa} onChange={(event) => setNuevaEtapa(event.target.value)} placeholder="Nombre de la nueva etapa" />
            <button type="button" onClick={agregarEtapa}>Guardar etapa</button>
            <button type="button" onClick={() => { setMostrarNuevaEtapa(false); setNuevaEtapa(""); }}>Cancelar</button>
          </div>}
          {errors.etapas && <small style={{ color: "#b91c1c", display: "block" }}>No se pudieron cargar las etapas: {errors.etapas}</small>}
          {!errors.etapas && etapas.length === 0 && !mostrarNuevaEtapa && <small style={{ color: "#92400e", display: "block" }}>No existen etapas activas. Presiona + para registrar la primera.</small>}
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
  </OperationPanel>);
}

export default ControlPesoAves;
