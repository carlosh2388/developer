import { useEffect, useState } from "react";
import { eggGradeCode, eggGradeLabel, eggPackageDetail, saveOperation } from "../services/operations";
import { api } from "../services/api";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";
import OperationRecordsModal from "../components/OperationRecordsModal";
import OperationPanel from "../components/OperationPanel";

function IngresoHuevos() {
  const { opciones, personal = [] } = useOperationalCatalogs(["lotes", "personal"]);
  // =========================
  // FECHA
  // =========================
  const [fecha, setFecha] = useState("");

  // =========================
  // LOTES
  // =========================
  const lotes = opciones("lotes").map((x) => x.value);

  // =========================
  // TIPOS CLASIFICACIÓN (ACTUALIZADO)
  // =========================
  const opcionesGrupo = [
    "Incubable",
    "Comercial"
  ];

  // =========================
  // PERSONAS
  // =========================
  const personalDisponible = personal.filter((item) => item.status !== "INACTIVE");
  const recolectores = personalDisponible.filter((item) => (item.roles || []).includes("COLLECTOR"));
  const clasificadores = personalDisponible.filter((item) => (item.roles || []).includes("CLASSIFIER"));

  // =========================
  // CREAR FILA
  // =========================
  const crearFila = () => ({
    cajaC360: 0,
    carton30: 0,
    unidades: 0
  });

  // =========================
  // CREAR CLASIFICACIÓN
  // =========================
  const crearGrupo = () => ({
    id: Date.now() + Math.random(),
    abierto: true,
    tipo: "",
    lote: lotes[0],
    recolector: "",
    clasificador: "",
    peso: 0, 
    datos: {}
  });

  // =========================
  // ESTADO PRINCIPAL
  // =========================
  const [grupos, setGrupos] = useState([crearGrupo()]);
  const [editingId, setEditingId] = useState(null);
  const cargarEdicion = async (row) => { try { const data = await api(`/huevos/movimientos/${row.id}`); setEditingId(row.id); setFecha(String(data.movement_date).slice(0, 10)); setGrupos(data.detalles.map((item) => ({ id: crypto.randomUUID(), abierto: true, tipo: item.grade_code.startsWith("INC_") ? "Incubable" : "Comercial", lote: item.flock_code, recolector: item.collector_id || "", clasificador: item.classifier_id || "", peso: item.total_weight_grams || 0, datos: { [eggGradeLabel(item.grade_code)]: { cajaB336: item.boxes_trays_336, cajaC360: item.boxes_cartons_360, bandeja84: item.trays_84, carton30: item.cartons_30, unidades: item.loose_units } } }))); } catch (error) { alert(error.message); } };

  // =========================
  // INIT FECHA
  // =========================
  useEffect(() => {
    const now = new Date();
    setFecha(now.toISOString().split("T")[0]);
  }, []);

  // Los catálogos llegan después del primer render. Sin esta sincronización el
  // navegador podía mostrar el primer lote aunque el estado aún fuera undefined.
  useEffect(() => {
    if (!lotes.length) return;
    setGrupos((actuales) => actuales.map((grupo) => grupo.lote ? grupo : { ...grupo, lote: lotes[0] }));
  }, [lotes.join("|")]);

  // =========================
  // CRUD
  // =========================
  const agregarGrupo = () => {
    setGrupos(prev => [...prev, crearGrupo()]);
  };

  const eliminarGrupo = (id) => {
    setGrupos(prev => prev.filter(g => g.id !== id));
  };

  const toggleGrupo = (id) => {
    setGrupos(prev =>
      prev.map(g =>
        g.id === id ? { ...g, abierto: !g.abierto } : g
      )
    );
  };

  const actualizarGrupo = (id, campo, valor) => {
    setGrupos(prev =>
      prev.map(g =>
        g.id === id ? { ...g, [campo]: valor } : g
      )
    );
  };

  const actualizarTabla = (grupoId, tamaño, campo, valor) => {
    setGrupos(prev =>
      prev.map(g => {
        if (g.id !== grupoId) return g;
        return {
          ...g,
          datos: {
            ...g.datos,
            [tamaño]: {
              ...g.datos?.[tamaño],
              [campo]: Number(valor)
            }
          }
        };
      })
    );
  };

  // =========================
  // TOTAL
  // =========================
  const calcularTotalFila = (fila, tipo) => {
    if (tipo === "Incubable") {
      return (
        (Number(fila?.cajaB336) || 0) * 336 +
        (Number(fila?.cajaC360) || 0) * 360 +
        (Number(fila?.bandeja84) || 0) * 84 +
        (Number(fila?.carton30) || 0) * 30 +
        (Number(fila?.unidades) || 0) * 1
      );
    }
  
    // COMERCIAL
    return (
      (fila?.cajaC360 || 0) * 360 +
      (fila?.carton30 || 0) * 30 +
      (fila?.unidades || 0) * 1     
    );
  };

  const calcularTotalGrupo = (grupo) => {
    const tipos = grupo.datos || {};
    let total = 0;
  
    Object.keys(tipos).forEach(k => {
      total += calcularTotalFila(tipos[k], grupo.tipo);
    });
  
    return total;
  };

  // =========================
  // RENDER GRUPO
  // =========================
  const renderGrupo = (grupo) => {

    const filasComercial = [
  "Extra-Grande-Mediano (Nido)",
  "Pequeño (Nido)",
  "Pewee (Nido)",
  "Sucio (Nido)",
  "Quebrado (Nido)",
  "Pálido Rojo (Nido)",
  "Con Sangre (Nido)",
  "Sucio (Piso)",
  "Quebrado (Piso)",
  "Bueno (Piso)"
];

const calcularSubTotal = (grupo, filtro) => {
  const tipos = grupo.datos || {};
  let total = 0;

  Object.keys(tipos).forEach(k => {
    if (k.includes(filtro)) {
      total += calcularTotalFila(tipos[k], "Comercial");
    }
  });

  return total;
};
    
    
    const totalGrupo = calcularTotalGrupo(grupo);
    const totalNido = calcularSubTotal(grupo, "(Nido)");
    const totalPiso = calcularSubTotal(grupo, "(Piso)");


    
    
    return (
      <div key={grupo.id} style={{ border: "1px solid #ddd", padding: 15, marginBottom: 15 }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>

          <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>

            {/* CLASIFICACIÓN */}
            <div>
              <label>Clasificación</label>
              <select
                value={grupo.tipo}
                onChange={(e) => actualizarGrupo(grupo.id, "tipo", e.target.value)}
              >
                <option value="">Seleccione</option>
                {opcionesGrupo.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>

            {/* LOTE */}
            <div>
              <label>Lote</label>
              <select
                value={grupo.lote}
                onChange={(e) => actualizarGrupo(grupo.id, "lote", e.target.value)}
              >
                {lotes.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* TOTAL */}
            <div>
              <label>Total</label>
              <div>{totalGrupo}</div>
            </div>

            {/* NIDO (solo Comercial) */}
            {grupo.tipo === "Comercial" && (
              <div>
                <label>Nido</label>
                <div>{totalNido}</div>
              </div>
            )}
            
            {/* PISO (solo Comercial) */}
            {grupo.tipo === "Comercial" && (
              <div>
                <label>Piso</label>
                <div>{totalPiso}</div>
              </div>
            )}
            
          </div>

          {/* BOTONES */}
            <div style={{ display: "flex", gap: "6px" }}>
            
              {/* BOTÓN TOGGLE (+ / -) */}
              <button
                type="button"
                onClick={() => toggleGrupo(grupo.id)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: grupo.abierto ? "#f0ad4e" : "#5bc0de",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px"
                }}
                title={grupo.abierto ? "Colapsar" : "Expandir"}
              >
                {grupo.abierto ? "−" : "+"}
              </button>
            
              {/* BOTÓN ELIMINAR (X) */}
              <button
                type="button"
                onClick={() => eliminarGrupo(grupo.id)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: "#d9534f",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px"
                }}
                title="Eliminar grupo"
              >
                X
              </button>
            
            </div>
        </div>

        {/* BODY */}
        {grupo.abierto && (
          <>
            {grupo.tipo && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>

              {/* RECOLECTOR */}
              <div>
                <label>Recolector</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <select value={grupo.recolector} onChange={(e) => actualizarGrupo(grupo.id, "recolector", e.target.value)}>
                    <option value="">Seleccione</option>
                    {recolectores.map((empleado) => <option key={empleado.id} value={empleado.id}>{empleado.fullName}</option>)}
                  </select>
                </div>
                {!recolectores.length && <small style={{ color: "#92400e" }}>No hay recolectores activos. Regístralos en Configuración → Empleados.</small>}
              </div>

              {/* CLASIFICADOR */}
              <div>
                <label>Clasificador</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <select value={grupo.clasificador} onChange={(e) => actualizarGrupo(grupo.id, "clasificador", e.target.value)}>
                    <option value="">Seleccione</option>
                    {clasificadores.map((empleado) => <option key={empleado.id} value={empleado.id}>{empleado.fullName}</option>)}
                  </select>
                </div>
                {!clasificadores.length && <small style={{ color: "#92400e" }}>No hay clasificadores activos. Regístralos en Configuración → Empleados.</small>}
              </div>

              {/* PESO (solo Incubable) */}
              {grupo.tipo === "Incubable" && (
                <div>
                  <label>Peso (gramos)</label>
                  <input
                    type="number"
                    step="1"
                    value={grupo.peso}
                    onChange={(e) =>
                      actualizarGrupo(grupo.id, "peso", parseInt(e.target.value || 0))
                    }
                  />
                </div>
              )}
            </div>
           )}

{/* ========================= TABLA SEGÚN TIPO ========================= */}
{!grupo.tipo ? null : grupo.tipo === "Incubable" ? (

  /* ========================= INCUBABLE ========================= */
 
  <div style={{ marginTop: "15px", overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Tamaño</th>
          <th>Caja de Bandejas 336</th>
          <th>Caja de Cartones 360</th>
          <th>Bandeja 84</th>
          <th>Cartón 30</th>
          <th>Unidades</th>
          <th>Total Unidades</th>
        </tr>
      </thead>
      
      <tbody>
        {["Grande (Nido)", "Mediano (Nido)", "Pequeño (Nido)", "Otros* (Nido)", "Otros* (Piso)"].map(t => {
          const fila = grupo.datos?.[t] || {
            cajaB336: 0,
            cajaC360: 0,
            bandeja84: 0,
            carton30: 0,
            unidades: 0
          };
      
          const total =
            (Number(fila.cajaB336) || 0) * 336 +
            (Number(fila.cajaC360) || 0) * 360 +
            (Number(fila.bandeja84) || 0) * 84 +
            (Number(fila.carton30) || 0) * 30 +
            (Number(fila.unidades) || 0) * 1;
      
          return (
            <tr key={t}>
              <td>{t}</td>
      
              {/* Caja B 336 */}
              <td>
                <input
                  type="number"
                  value={fila.cajaB336}
                  onChange={(e) =>
                    actualizarTabla(grupo.id, t, "cajaB336", e.target.value)
                  }
                />
              </td>
      
              {/* Caja C 360 */}
              <td>
                <input
                  type="number"
                  value={fila.cajaC360}
                  onChange={(e) =>
                    actualizarTabla(grupo.id, t, "cajaC360", e.target.value)
                  }
                />
              </td>
      
              {/* Bandeja 84 */}
              <td>
                <input
                  type="number"
                  value={fila.bandeja84}
                  onChange={(e) =>
                    actualizarTabla(grupo.id, t, "bandeja84", e.target.value)
                  }
                />
              </td>
      
              {/* Cartón 30 */}
              <td>
                <input
                  type="number"
                  value={fila.carton30}
                  onChange={(e) =>
                    actualizarTabla(grupo.id, t, "carton30", e.target.value)
                  }
                />
              </td>
      
              {/* Unidades */}
              <td>
                <input
                  type="number"
                  value={fila.unidades}
                  onChange={(e) =>
                    actualizarTabla(grupo.id, t, "unidades", e.target.value)
                  }
                />
              </td>
      
              {/* Total */}
              <td>{total}</td>
            </tr>
          );
        })}
      </tbody>
    </table>

    {/* NOTA FINAL */}
    <div style={{ marginTop: 10, fontWeight: "bold" }}>
      Otros = Pruebas, Lijado, Deforme y Traslúcido
    </div>
  </div>

) : (

  /* ========================= COMERCIAL ========================= */
  <div style={{ marginTop: "15px", overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Tamaño</th>
          <th>Caja de Cartones 360</th>
          <th>Cartón 30</th>
          <th>Unidades</th>
          <th>Total Unidades</th>
        </tr>
      </thead>

      <tbody>
        {[
          "Extra-Grande-Mediano (Nido)",
          "Pequeño (Nido)",
          "Pewee (Nido)",
          "Sucio (Nido)",
          "Quebrado (Nido)",
          "Pálido Rojo (Nido)",
          "Con Sangre (Nido)",
          "Sucio (Piso)",
          "Quebrado (Piso)",    
          "Bueno (Piso)"
        ].map(t => {
          const fila = grupo.datos?.[t] || crearFila();

          return (
            <tr key={t}>
              <td>{t}</td>

              {["cajaC360", "carton30", "unidades"].map(campo => (
                <td key={campo}>
                  <input
                    type="number"
                    value={fila[campo]}
                    onChange={(e) =>
                      actualizarTabla(grupo.id, t, campo, e.target.value)
                    }
                  />
                </td>
              ))}

              <td>{calcularTotalFila(fila, "normal")}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}


                
          </>
        )}
      </div>
    );
  };

  // =========================
  // GUARDAR
  // =========================
  const guardar = async () => {
    try {
      const gruposConDatos = grupos.filter((grupo) => Object.values(grupo.datos || {}).some((datos) => {
        const cantidades = eggPackageDetail(datos);
        return cantidades.cajasBandejas336 + cantidades.cajasCartones360 + cantidades.bandejas84 + cantidades.cartones30 + cantidades.unidades > 0;
      }));
      if (!gruposConDatos.length) throw new Error("Ingresa al menos una cantidad de huevos.");
      if (gruposConDatos.some((grupo) => !grupo.lote)) throw new Error("Selecciona el lote en todos los grupos que contienen cantidades.");
      const detalles = grupos.flatMap((grupo) => Object.entries(grupo.datos || {}).map(([calidad, datos]) => ({
        lote: grupo.lote, clasificacion: eggGradeCode(calidad, grupo.tipo), recolectorId: grupo.recolector || undefined,
        clasificadorId: grupo.clasificador || undefined, pesoTotalGramos: Number(grupo.peso) || undefined,
        ...eggPackageDetail(datos),
      })).filter((d) => d.cajasBandejas336 + d.cajasCartones360 + d.bandejas84 + d.cartones30 + d.unidades > 0));
      await saveOperation("/huevos/movimientos", { tipoMovimiento: "INPUT", fecha, detalles }, editingId);
      alert(editingId ? "Ingreso actualizado correctamente" : "Ingreso de huevos guardado correctamente"); setGrupos([crearGrupo()]); setFecha(new Date().toISOString().split("T")[0]); setEditingId(null);
    } catch (error) { alert(error.message); }
  };

  return (<OperationPanel maxWidth={1100}><OperationRecordsModal title="Ingresos de huevos" path="/huevos/movimientos" annulPath={(row) => `/operaciones/huevos/${row.id}/anular`} dateField="movement_date" columns={[
    { key: "movement_number", label: "Movimiento" },
    { key: "movement_date", label: "Fecha", render: (value) => String(value || "").slice(0, 10) },
    { key: "flock_codes", label: "Lote" },
    { key: "grade_labels", label: "Clasificaciones" },
    { key: "collector_names", label: "Recolector", render: (value) => value || "Sin recolector" },
    { key: "classifier_names", label: "Clasificador", render: (value) => value || "Sin clasificador" },
    { key: "line_count", label: "Detalles" },
    { key: "total_units", label: "Total unidades", render: (value) => Number(value || 0).toLocaleString("es-GT") },
    { key: "status", label: "Estado", render: (value) => ({ POSTED: "Registrado", VOID: "Anulado" }[value] || value) },
  ]} rowFilter={(row) => row.movement_type === "INPUT"} onEdit={cargarEdicion}/>
    <div>
      <h2>Ingreso Huevos</h2>

      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />

      <button onClick={agregarGrupo}>+</button>

      {grupos.map(renderGrupo)}

      <button onClick={guardar}>Guardar</button>
    </div>
  </OperationPanel>);
}

export default IngresoHuevos;
