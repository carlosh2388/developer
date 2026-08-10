import { useEffect, useState } from "react";
import { saveOperation } from "../services/operations";
import { api } from "../services/api";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";
import OperationRecordsModal from "../components/OperationRecordsModal";
import OperationPanel from "../components/OperationPanel";

function ControlPesoHuevos() {
  const { opciones } = useOperationalCatalogs(["lotes"]);
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
  const cargarEdicion = async (row) => { try { const data = await api(`/controles/peso-huevos/${row.id}`); const editRows = data.muestras.map((item, index) => ({ id: index, pesoCaja: String(item.gross_box_weight_grams), material: item.packaging_type === "CARTONS_360" ? "Cartones 360" : "Bandejas 336", pesoMaterial: String(item.packaging_weight_grams), pesoUnitario: String(item.unit_weight_grams) })); setEditingId(row.id); setFecha(String(data.control_date).slice(0, 10)); setLote(data.flock_code); setSemana(data.week_number); setNumMuestras(editRows.length); setFilas(editRows); } catch (error) { alert(error.message); } };

  // =========================
  // FECHA AUTOMÁTICA
  // =========================

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];
    setFecha(hoy);
  }, []);

  // =========================
  // CREAR FILAS DINÁMICAS
  // =========================

  useEffect(() => {
    const nuevas = [];

    for (let i = 0; i < numMuestras; i++) {
      nuevas.push({
        id: i,
        pesoCaja: "",
        material: "",
        pesoMaterial: "",
        pesoUnitario: ""
      });
    }

    setFilas((actuales) => actuales.length === Number(numMuestras) ? actuales : nuevas);
  }, [numMuestras]);

  // =========================
  // ACTUALIZAR FILA
  // =========================

 const handleChange = (
  index,
  field,
  value
) => {

  const copy = [...filas];

  const fila = {
    ...copy[index]
  };

  fila[field] = value;

  // Material seleccionado
  if (fila.material === "Cartones 360") {

    fila.pesoMaterial = 1150;

  } else if (
    fila.material === "Bandejas 336"
  ) {

    fila.pesoMaterial = 1050;

  } else {

    fila.pesoMaterial = "";
  }

  // Calcular peso unitario
  const pesoCaja =
    parseFloat(fila.pesoCaja) || 0;

  const pesoMaterial =
    parseFloat(fila.pesoMaterial) || 0;

  const factor =
    fila.material === "Cartones 360"
      ? 360
      : fila.material === "Bandejas 336"
      ? 336
      : 0;

  fila.pesoUnitario =
    pesoCaja > pesoMaterial && factor > 0
      ? (
          (pesoCaja - pesoMaterial) /
          factor
        ).toFixed(2)
      : "";

  copy[index] = fila;

  setFilas(copy);
};

  // =========================
  // PROMEDIO GENERAL
  // =========================

  useEffect(() => {
    const vals = filas
      .map((f) => parseFloat(f.pesoUnitario))
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
    .map((f) => parseFloat(f.pesoUnitario))
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
  
  // =========================
  // GUARDAR
  // =========================

  const guardar = async () => {
    try {
      if (!fecha || !lote || Number(semana) <= 0) throw new Error("Selecciona fecha, lote y una semana válida.");
      if (!filas.length) throw new Error("Agrega al menos una muestra.");
      const invalida = filas.find((fila) => !fila.material || Number(fila.pesoCaja) <= Number(fila.pesoMaterial) || Number(fila.pesoUnitario) <= 0);
      if (invalida) throw new Error("El peso total de cada caja, en gramos, debe ser mayor que el peso del empaque vacío.");
      const muestras = filas.filter((fila) => Number(fila.pesoCaja) > 0).map((fila) => ({
        pesoCaja: Number(fila.pesoCaja), tipoEmpaque: fila.material === "Cartones 360" ? "CARTONS_360" : "TRAYS_336",
        pesoEmpaque: Number(fila.pesoMaterial), pesoUnitario: Number(fila.pesoUnitario),
      }));
      await saveOperation("/controles/peso-huevos", { fecha, lote, semana, pesoPromedio: promedio, uniformidad, muestras }, editingId);
      alert(editingId ? "Registro actualizado correctamente" : "Registro guardado correctamente");
      setEditingId(null);
      setFecha(new Date().toISOString().split("T")[0]);
      setLote("");
      setSemana("");
      setNumMuestras(0);
      setFilas([]);
      setPromedio(0);
      setUniformidad(0);
    } catch (error) { alert(error.message); }
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
            onChange={(e) => setSemana(e.target.value)}
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
      value={numMuestras}
      onChange={(e) =>
        setNumMuestras(
          Number(e.target.value)
        )
      }
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

      {filas.map((fila, i) => (
        <div key={i} style={rowStyle}>
          {/* PESO CAJA */}
          <div style={{ flex: 1 }}>
            <label>Peso total de la caja (g)</label>
            <input
              type="number"
              min={Number(fila.pesoMaterial || 0) + 0.01}
              step="0.01"
              placeholder="Ejemplo: 22500"
              value={fila.pesoCaja}
              onChange={(e) =>
                handleChange(i, "pesoCaja", e.target.value)
              }
              style={inputStyle}
            />
          </div>

          {/* MATERIAL */}
          <div style={{ flex: 1 }}>
            <label>Material de Empaque</label>
            <select
              value={fila.material}
              onChange={(e) =>
                handleChange(i, "material", e.target.value)
              }
              style={inputStyle}
            >
              <option value="">Seleccione</option>
              <option value="Cartones 360">
                Caja de Cartones 360
              </option>
              <option value="Bandejas 336">
                Caja de Bandejas 336
              </option>
            </select>
          </div>

          {/* PESO MATERIAL */}
          <div style={{ flex: 1 }}>
            <label>Peso Material (g)</label>
            <input value={fila.pesoMaterial} readOnly style={inputStyle} />
          </div>

          {/* PESO UNITARIO */}
          <div style={{ flex: 1 }}>
            <label>Peso Unitario</label>
            <input value={fila.pesoUnitario} readOnly style={inputStyle} />
            {fila.pesoCaja && Number(fila.pesoCaja) <= Number(fila.pesoMaterial) && <small style={{ color: "#b91c1c", display: "block" }}>Debe superar {fila.pesoMaterial} g.</small>}
          </div>
        </div>
      ))}

      {/* =========================
          GUARDAR
      ========================= */}

      <button
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
        Guardar Registro
      </button>
    </div>
  </OperationPanel>);
}

export default ControlPesoHuevos;
