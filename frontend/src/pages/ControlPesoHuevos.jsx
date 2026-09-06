import { useEffect, useState } from "react";
import { saveOperation } from "../services/operations";
import { api } from "../services/api";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";
import OperationRecordsModal from "../components/OperationRecordsModal";
import OperationPanel from "../components/OperationPanel";
import { calculateFlockWeek } from "../utils/flockWeek";
import CancelEditButton from "../components/CancelEditButton";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

const weightStatistics = (weights) => {
  const sorted = [...weights].sort((a, b) => a - b);
  const average = weights.reduce((sum, value) => sum + value, 0) / weights.length;
  const variance = weights.reduce((sum, value) => sum + ((value - average) ** 2), 0) / weights.length;
  const deviation = Math.sqrt(variance);
  const frequency = new Map();
  weights.forEach((value) => frequency.set(value, (frequency.get(value) || 0) + 1));
  const mode = [...frequency.entries()].sort((left, right) => right[1] - left[1] || left[0] - right[0])[0][0];
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  const classCount = Math.max(1, Math.ceil(1 + 3.322 * Math.log10(weights.length)));
  const range = sorted.at(-1) - sorted[0];
  const width = range === 0 ? 1 : range / classCount;
  const classes = Array.from({ length: range === 0 ? 1 : classCount }, (_, index) => {
    const from = sorted[0] + width * index;
    const to = index === classCount - 1 ? sorted.at(-1) : sorted[0] + width * (index + 1);
    const count = weights.filter((value) => value >= from && (index === classCount - 1 || value < to)).length;
    return { from, to, count };
  });
  return { average, deviation, mode, median, minimum: sorted[0], maximum: sorted.at(-1), range, classes };
};

const formatDateTime = (value) => value ? new Intl.DateTimeFormat("es-GT", {
  dateStyle: "medium", timeStyle: "short",
}).format(new Date(value)) : "Sin información";

const weightReportHtml = ({ fecha, lote, semana, weights, uniformidad, operatorName, operatedAt, printedBy, printedAt }) => {
  const stats = weightStatistics(weights);
  const sampleRows = Array.from({ length: Math.ceil(weights.length / 5) }, (_, row) =>
    `<tr><td>${row + 1}</td>${Array.from({ length: 5 }, (_, column) => `<td>${weights[row * 5 + column] ?? ""}</td>`).join("")}</tr>`
  ).join("");
  const maxFrequency = Math.max(1, ...stats.classes.map((item) => item.count));
  const classRows = stats.classes.map((item, index) => `<tr><td>${index + 1}</td><td>${item.from.toFixed(2)} – ${item.to.toFixed(2)}</td><td>${item.count}</td></tr>`).join("");
  const chartWidth = 620; const chartHeight = 190; const baseline = 155; const slot = chartWidth / stats.classes.length;
  const bars = stats.classes.map((item, index) => {
    const height = Math.max(3, item.count / maxFrequency * 120); const x = index * slot + slot * 0.25;
    return `<g><rect x="${x}" y="${baseline - height}" width="${slot * 0.5}" height="${height}" fill="#14779c"/><text x="${x + slot * 0.25}" y="${baseline - height - 6}" text-anchor="middle">${item.count}</text><text x="${x + slot * 0.25}" y="176" text-anchor="middle">${item.from.toFixed(1)}</text></g>`;
  }).join("");
  const chart = `<svg class="chart" viewBox="0 0 ${chartWidth} ${chartHeight}" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="${baseline}" x2="${chartWidth}" y2="${baseline}" stroke="#555"/>${bars}</svg>`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>Boleta peso huevos ${escapeHtml(lote)}</title><style>
    @page{size:A4;margin:12mm 12mm 20mm}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{font:12px Arial;color:#17212b;margin:0;padding-bottom:34px}.header{display:grid;grid-template-columns:120px 1fr 210px;align-items:center;border-bottom:2px solid #173c5e;padding-bottom:8px}.header img{width:90px;max-height:55px;object-fit:contain}.header h1{font-size:17px;text-align:center;margin:0}.farm{text-align:right;font-weight:bold;line-height:1.45}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.meta div,.stat,.audit div{border-bottom:1px solid #aaa;padding:5px}.audit{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}.content{display:grid;grid-template-columns:1.25fr 1fr;gap:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #aaa;padding:4px;text-align:center}th{background:#edf2f6}.stats{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:12px}.chart{display:block;width:100%;height:190px;margin-top:8px}.download-footer{position:fixed;left:0;right:0;bottom:0;border-top:1px solid #777;padding-top:6px;display:flex;justify-content:space-between;font-size:10px}.actions{margin:15px 0;text-align:right}@media print{.actions{display:none}}
  </style></head><body><div class="actions"><button onclick="window.print()">Imprimir / Guardar PDF</button></div><div class="header"><img src="${location.origin}/igag-logo.jpeg"><h1>REPORTE DE MUESTREO DE HUEVO</h1><div class="farm">Industria Genética<br>Avícola de Guatemala, S.A.</div></div>
  <div class="meta"><div><b>Fecha:</b> ${escapeHtml(fecha)}</div><div><b>Lote:</b> ${escapeHtml(lote)}</div><div><b>Semana:</b> ${escapeHtml(semana)}</div><div><b># Muestras:</b> ${weights.length}</div><div><b>Promedio:</b> ${stats.average.toFixed(2)} g</div><div><b>Uniformidad:</b> ${Number(uniformidad).toFixed(2)}%</div></div>
  <div class="audit"><div><b>Operado por:</b> ${escapeHtml(operatorName || "Sin información")}</div><div><b>Fecha y hora de operación:</b> ${escapeHtml(formatDateTime(operatedAt))}</div></div>
  <div class="content"><table><thead><tr><th>M</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th></tr></thead><tbody>${sampleRows}</tbody></table><div><div class="stats"><div class="stat"><b>Mínimo:</b> ${stats.minimum.toFixed(2)}</div><div class="stat"><b>Máximo:</b> ${stats.maximum.toFixed(2)}</div><div class="stat"><b>Media:</b> ${stats.average.toFixed(2)}</div><div class="stat"><b>Mediana:</b> ${stats.median.toFixed(2)}</div><div class="stat"><b>Moda:</b> ${stats.mode.toFixed(2)}</div><div class="stat"><b>Rango:</b> ${stats.range.toFixed(2)}</div><div class="stat"><b>Desviación:</b> ${stats.deviation.toFixed(2)}</div><div class="stat"><b>Coef. Var.:</b> ${stats.average ? (stats.deviation / stats.average * 100).toFixed(2) : "0.00"}%</div></div><table><thead><tr><th>Clase</th><th>Rango</th><th># Huevos</th></tr></thead><tbody>${classRows}</tbody></table></div></div><h3 style="text-align:center">Distribución de pesos</h3>${chart}<div class="download-footer"><span><b>Descargado por:</b> ${escapeHtml(printedBy || "Sin información")}</span><span><b>Fecha y hora de descarga:</b> ${escapeHtml(formatDateTime(printedAt))}</span></div></body></html>`;
};

function ControlPesoHuevos({ user }) {
  const { opciones, lotes } = useOperationalCatalogs(["lotes"]);
  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");
  const [lote, setLote] = useState("");
  const [semana, setSemana] = useState("");

  const [numMuestras, setNumMuestras] = useState(0);

  const [promedio, setPromedio] = useState(0);
  const [uniformidad, setUniformidad] = useState(0);

  const [filas, setFilas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [auditData, setAuditData] = useState({});
  const cargarEdicion = async (row) => { try { const data = await api(`/controles/peso-huevos/${row.id}`); const editRows = data.muestras.map((item, index) => ({ id: index, pesoHuevo: String(item.egg_weight_grams ?? item.unit_weight_grams ?? "") })); setEditingId(row.id); setFecha(String(data.control_date).slice(0, 10)); setLote(data.flock_code); setSemana(data.week_number); setNumMuestras(editRows.length); setFilas(editRows); setAuditData({ farmName: data.farm_name, operatorName: data.operator_name, operatedAt: data.operated_at }); } catch (error) { alert(error.message); } };

  // =========================
  // FECHA AUTOMÁTICA
  // =========================

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];
    setFecha(hoy);
  }, []);

  useEffect(() => {
    if (!lote) { setSemana(""); return; }
    const registroLote = lotes.find((item) => item.code === lote);
    setSemana(calculateFlockWeek(registroLote?.receivedOn));
  }, [lote, lotes]);

  // =========================
  // CREAR FILAS DINÁMICAS
  // =========================

  useEffect(() => {
    setFilas((actuales) => Array.from({ length: Number(numMuestras) }, (_, index) =>
      actuales[index] || { id: index, pesoHuevo: "" }
    ));
  }, [numMuestras]);

  // =========================
  // ACTUALIZAR FILA
  // =========================

  const handleChange = (index, value) => {
    setFilas((actuales) => actuales.map((fila, currentIndex) =>
      currentIndex === index ? { ...fila, pesoHuevo: value } : fila
    ));
  };

  // =========================
  // PROMEDIO GENERAL
  // =========================

  useEffect(() => {
    const vals = filas
      .map((f) => parseFloat(f.pesoHuevo))
      .filter((v) => !isNaN(v));

    const avg =
      vals.length > 0
        ? vals.reduce((a, b) => a + b, 0) /
          vals.length
        : 0;

    setPromedio(avg.toFixed(2));
  }, [filas]);


  // =========================
// UNIFORMIDAD ±10%
// =========================

useEffect(() => {
  const valores = filas
    .map((f) => parseFloat(f.pesoHuevo))
    .filter((v) => !isNaN(v));

  const prom = parseFloat(promedio);

  if (!valores.length || !prom) {
    setUniformidad(0);
    return;
  }

  const min = prom * 0.9;
  const max = prom * 1.1;

  const dentroRango = valores.filter(
    (v) => v >= min && v <= max
  ).length;

  setUniformidad(
    (
      (dentroRango / valores.length) *
      100
    ).toFixed(2)
  );
}, [filas, promedio]);

  const datosBoleta = (overrides = {}) => {
    if (!fecha || !lote || Number(semana) <= 0) throw new Error("Selecciona fecha, lote y una semana válida.");
    if (!filas.length) throw new Error("Agrega al menos una muestra.");
    const weights = filas.map((fila) => Number(fila.pesoHuevo));
    if (weights.some((weight) => !Number.isFinite(weight) || weight <= 0)) {
      throw new Error("Completa todas las muestras con pesos mayores que cero.");
    }
    const average = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
    const withinRange = weights.filter((weight) => weight >= average * 0.9 && weight <= average * 1.1).length;
    return {
      fecha, lote, semana, weights, uniformidad: withinRange * 100 / weights.length,
      operatorName: auditData.operatorName || user?.name || user?.fullName || user?.username,
      operatedAt: auditData.operatedAt || new Date().toISOString(),
      printedBy: user?.name || user?.fullName || user?.username,
      printedAt: new Date().toISOString(),
      ...overrides,
    };
  };

  const mostrarBoleta = (data, reportWindow = window.open("", "_blank")) => {
    if (!reportWindow) { alert("El navegador bloqueó la boleta. Habilita las ventanas emergentes e intenta nuevamente."); return; }
    reportWindow.document.open();
    reportWindow.document.write(weightReportHtml(data));
    reportWindow.document.close();
    reportWindow.focus();
  };

  const imprimirBoleta = () => {
    try { mostrarBoleta(datosBoleta()); }
    catch (error) { alert(error.message); }
  };
  
  // =========================
  // GUARDAR
  // =========================

  const guardar = async () => {
    let reportWindow;
    try {
      const operatedAt = new Date().toISOString();
      const reportData = datosBoleta({
        operatorName: user?.name || user?.fullName || user?.username,
        operatedAt,
      });
      const invalida = filas.find((fila) => !Number.isFinite(Number(fila.pesoHuevo)) || Number(fila.pesoHuevo) <= 0);
      if (invalida) throw new Error("El peso de cada huevo debe ser mayor que cero.");
      const muestras = filas.map((fila) => ({ pesoHuevoGramos: Number(fila.pesoHuevo) }));
      reportWindow = window.open("", "_blank");
      await saveOperation("/controles/peso-huevos", { fecha, lote, semana, pesoPromedio: promedio, uniformidad, muestras }, editingId);
      alert(editingId ? "Registro actualizado correctamente" : "Registro guardado correctamente");
      mostrarBoleta(reportData, reportWindow);
      setEditingId(null);
      setFecha(new Date().toISOString().split("T")[0]);
      setLote("");
      setSemana("");
      setNumMuestras(0);
      setFilas([]);
      setPromedio(0);
      setUniformidad(0);
      setAuditData({});
    } catch (error) { if (reportWindow && !reportWindow.document.body?.innerHTML) reportWindow.close(); alert(error.message); }
  };

  // =========================
  // ESTILOS
  // =========================

  const inputStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  };

  const rowStyle = {
    display: "flex",
    gap: "10px",
    marginBottom: "15px"
  };

  // =========================
  // RENDER
  // =========================

  return (<OperationPanel maxWidth={950}><OperationRecordsModal title="Controles de peso de huevos" path="/controles/peso-huevos" annulPath={(row) => `/operaciones/peso-huevos/${row.id}/anular`} dateField="control_date" columns={[
    { key: "control_date", label: "Fecha", render: (value) => String(value || "").slice(0, 10) },
    { key: "flock_code", label: "Lote", render: (value, row) => value || row.flockCode || "Sin lote" },
    { key: "week_number", label: "Semana" }, { key: "sample_size", label: "Muestras" }, { key: "average_weight_grams", label: "Promedio" }, { key: "uniformity_percentage", label: "Uniformidad" }, { key: "status", label: "Estado" },
  ]} onEdit={cargarEdicion}/>
    <div
      style={{
        maxWidth: "900px",
        margin: "auto",
        fontFamily: "Arial",
        padding: "20px"
      }}
    >
      <h2>Control Peso Huevos</h2>

      {/* =========================
          FECHA / LOTE / SEMANA
      ========================= */}

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label>Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ flex: 1 }}>
          <label># Lote</label>
        
          <select
            value={lote}
            onChange={(e) =>
              setLote(e.target.value)
            }
            style={inputStyle}
          >
            <option value="">
              Seleccione
            </option>
        
            {opciones("lotes").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label>Semana</label>
          <input
            type="number"
            value={semana}
            readOnly
            style={inputStyle}
          />
        </div>
      </div>

{/* =========================
    MUESTRAS + PROMEDIO + UNIFORMIDAD
========================= */}

<div style={rowStyle}>
  <div style={{ flex: 1 }}>
    <label>Número de Muestras</label>

    <input
      type="number"
      min="1"
      step="1"
      value={numMuestras}
      onKeyDown={(e) => { if (["-", "+", ".", ",", "e", "E"].includes(e.key)) e.preventDefault(); }}
      onChange={(e) => { if (/^\d*$/.test(e.target.value)) setNumMuestras(Math.max(0, Number(e.target.value || 0))); }}
      style={inputStyle}
    />
  </div>

  <div style={{ flex: 1 }}>
    <label>Peso Promedio</label>

    <input
      value={promedio}
      readOnly
      style={inputStyle}
    />
  </div>

  <div style={{ flex: 1 }}>
    <label>Uniformidad (%)</label>

    <input
      value={uniformidad}
      readOnly
      style={inputStyle}
    />
  </div>
</div>

      {/* =========================
          TABLA DINÁMICA
      ========================= */}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(120px, 1fr))", gap: "10px", marginBottom: "15px" }}>
      {filas.map((fila, i) => (
          <div key={i}>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={`Muestra ${i + 1}`}
              value={fila.pesoHuevo}
              onKeyDown={(e) => { if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault(); }}
              onChange={(e) => { if (/^\d*(?:\.\d*)?$/.test(e.target.value)) handleChange(i, e.target.value); }}
              style={inputStyle}
              aria-label={`Peso en gramos de muestra ${i + 1}`}
            />
          </div>
      ))}
      </div>

      {/* =========================
          GUARDAR
      ========================= */}

      <div className="edit-actions"><button
        onClick={guardar}
        style={{
          padding: "10px 20px",
          backgroundColor: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: 15
        }}
      >
        {editingId ? "Guardar cambios" : "Guardar Registro"}
      </button><button
        type="button"
        onClick={imprimirBoleta}
        disabled={!editingId}
        title={!editingId ? "Disponible al editar un registro guardado" : "Imprimir o guardar la boleta como PDF"}
        style={{ marginTop: 15, opacity: editingId ? 1 : 0.55, cursor: editingId ? "pointer" : "not-allowed" }}
      >Imprimir Boleta PDF</button><CancelEditButton editing={editingId} onCancel={() => { setEditingId(null); setAuditData({}); setLote(""); setSemana(""); setNumMuestras(0); setFilas([]); setFecha(new Date().toISOString().split("T")[0]); }}/></div>
    </div>
  </OperationPanel>);
}

export default ControlPesoHuevos;
