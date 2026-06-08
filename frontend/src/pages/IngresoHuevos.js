import { useEffect, useState } from "react";

function IngresoHuevos() {
  // =========================
  // FECHA
  // =========================
  const [fecha, setFecha] = useState("");

  // =========================
  // LOTES
  // =========================
  const lotes = [
    "REP-260401-1600",
    "REP-260401-1601",
    "REP-260401-1602"
  ];

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
  const personas = ["Tomas Pérez", "María Gomez"];

  // =========================
  // CREAR FILA
  // =========================
  const crearFila = () => ({
    nido360: 0,
    nido30: 0,
    nido1: 0,
    piso360: 0,
    piso30: 0,
    piso1: 0
  });

  // =========================
  // CREAR CLASIFICACIÓN (ACTUALIZADO)
  // =========================
  const crearGrupo = () => ({
    id: Date.now() + Math.random(),
    abierto: true,
    tipo: "",
    lote: lotes[0],
    recolector: "",
    clasificador: "",
    peso: 0, // 👈 NUEVO CAMPO
    datos: {}
  });

  // =========================
  // ESTADO PRINCIPAL
  // =========================
  const [grupos, setGrupos] = useState([crearGrupo()]);

  // =========================
  // INIT FECHA
  // =========================
  useEffect(() => {
    const now = new Date();
    setFecha(now.toISOString().split("T")[0]);
  }, []);

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
    return (
      (fila?.nido360 || 0) * 360 +
      (fila?.nido30 || 0) * 30 +
      (fila?.nido1 || 0) * 1 +
      (fila?.piso360 || 0) * 360 +
      (fila?.piso30 || 0) * 30 +
      (fila?.piso1 || 0) * 1
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
    const totalGrupo = calcularTotalGrupo(grupo);

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
          </div>

          {/* BOTONES */}
          <div>
            <button onClick={() => toggleGrupo(grupo.id)}>
              {grupo.abierto ? "-" : "+"}
            </button>
            <button onClick={() => eliminarGrupo(grupo.id)}>X</button>
          </div>
        </div>

        {/* BODY */}
        {grupo.abierto && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>

              {/* RECOLECTOR */}
              <div>
                <label>Recolector</label>
                <select
                  value={grupo.recolector}
                  onChange={(e) => actualizarGrupo(grupo.id, "recolector", e.target.value)}
                >
                  <option value="">Seleccione</option>
                  {personas.map(p => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* CLASIFICADOR */}
              <div>
                <label>Clasificador</label>
                <select
                  value={grupo.clasificador}
                  onChange={(e) => actualizarGrupo(grupo.id, "clasificador", e.target.value)}
                >
                  <option value="">Seleccione</option>
                  {personas.map(p => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* 👇 NUEVO: PESO (solo Incubable) */}
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

{/* ========================= TABLA SEGÚN TIPO ========================= */}
{!grupo.tipo ? null : grupo.tipo === "Incubable" ? (

  /* ========================= INCUBABLE ========================= */
  <div style={{ marginTop: "15px", overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Tamaño</th>
          <th>Nido 336</th>
          <th>Nido 360</th>
          <th>Piso 336</th>
          <th>Piso 360</th>
          <th>Total Unidades</th>
        </tr>
      </thead>

      <tbody>
        {["Grande", "Mediano", "Pequeño", "Otros"].map(t => {
          const fila = grupo.datos?.[t] || {
            nido336: 0,
            nido360: 0,
            piso336: 0,
            piso360: 0
          };

          return (
            <tr key={t}>
              <td>{t}</td>

              <td>
                <input
                  type="number"
                  value={fila.nido336}
                  onChange={(e) =>
                    actualizarTabla(grupo.id, t, "nido336", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={fila.nido360}
                  onChange={(e) =>
                    actualizarTabla(grupo.id, t, "nido360", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={fila.piso336}
                  onChange={(e) =>
                    actualizarTabla(grupo.id, t, "piso336", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={fila.piso360}
                  onChange={(e) =>
                    actualizarTabla(grupo.id, t, "piso360", e.target.value)
                  }
                />
              </td>

              <td>{calcularTotalFila(fila, "incubable")}</td>
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

  /* ========================= COMERCIAL (ANTES “OTROS”) ========================= */
  <div style={{ marginTop: "15px", overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Tamaño</th>
          <th>Nido 360</th>
          <th>Nido 30</th>
          <th>Nido 1</th>
          <th>Piso 360</th>
          <th>Piso 30</th>
          <th>Piso 1</th>
          <th>Total Unidades</th>
        </tr>
      </thead>

      <tbody>
        {[
          "Extra Grande",
          "Grande",
          "Mediano",
          "Pequeño",
          "Pewee",
          "Sucio",
          "Quebrado",
          "Pálido",
          "Otros"
        ].map(t => {
          const fila = grupo.datos?.[t] || crearFila();

          return (
            <tr key={t}>
              <td>{t}</td>

              {["nido360", "nido30", "nido1", "piso360", "piso30", "piso1"].map(campo => (
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
  const guardar = () => {
    console.log({ fecha, clasificaciones: grupos });
    alert("Guardado");
  };

  return (
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
  );
}

export default IngresoHuevos;
