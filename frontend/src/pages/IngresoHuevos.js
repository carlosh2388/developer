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
  // TIPOS CLASIFICACIÓN
  // =========================

  const opcionesGrupo = [
    "incubable",
    "comercial",
    "sucio",
    "quebrado",
    "otros"
  ];

  // =========================
  // PERSONAS
  // =========================

  const personas = [
    "Tomas Pérez",
    "María Gomez"
  ];

  // =========================
  // TIPOS TABLA INCUBABLE
  // =========================

  const tamanosIncubable = [
    "Grande",
    "Mediano",
    "Pequeño",
    "Otros"
  ];

  // =========================
  // TIPOS TABLA NO INCUBABLE (10x8)
  // =========================

  const tamanosCompleto = [
    "Extra Grande",
    "Grande",
    "Mediano",
    "Pequeño",
    "Pewee",
    "Sucio",
    "Quebrado",
    "Pálido",
    "Otros"
  ];

  // =========================
  // FACTORES COLUMNAS
  // =========================

  const factores = {
    nido360: 360,
    nido30: 30,
    nido1: 1,
    piso360: 360,
    piso30: 30,
    piso1: 1
  };

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
  // CREAR CLASIFICACIÓN
  // =========================

  const crearGrupo = () => ({
    id: Date.now() + Math.random(),

    abierto: true,

    tipo: "",

    lote: lotes[0],

    recolector: "",

    clasificador: "",

    datos: {}
  });

  // =========================
  // ESTADO PRINCIPAL
  // =========================

  const [grupos, setGrupos] = useState([
    crearGrupo()
  ]);

  // =========================
  // INIT FECHA
  // =========================

  useEffect(() => {
    const now = new Date();
    setFecha(now.toISOString().split("T")[0]);
  }, []);

  // =========================
  // AGREGAR
  // =========================

  const agregarGrupo = () => {
    setGrupos(prev => [...prev, crearGrupo()]);
  };

  // =========================
  // ELIMINAR
  // =========================

  const eliminarGrupo = (id) => {
    setGrupos(prev =>
      prev.filter(g => g.id !== id)
    );
  };

  // =========================
  // TOGGLE
  // =========================

  const toggleGrupo = (id) => {
    setGrupos(prev =>
      prev.map(g =>
        g.id === id
          ? { ...g, abierto: !g.abierto }
          : g
      )
    );
  };

  // =========================
  // UPDATE SIMPLE
  // =========================

  const actualizarGrupo = (id, campo, valor) => {
    setGrupos(prev =>
      prev.map(g =>
        g.id === id
          ? { ...g, [campo]: valor }
          : g
      )
    );
  };

  // =========================
  // UPDATE TABLA
  // =========================

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
  // TOTAL POR FILA
  // =========================

  const calcularTotalFila = (fila) => {

    const n360 = (fila?.nido360 || 0) * factores.nido360;
    const n30 = (fila?.nido30 || 0) * factores.nido30;
    const n1 = (fila?.nido1 || 0) * factores.nido1;

    const p360 = (fila?.piso360 || 0) * factores.piso360;
    const p30 = (fila?.piso30 || 0) * factores.piso30;
    const p1 = (fila?.piso1 || 0) * factores.piso1;

    return n360 + n30 + n1 + p360 + p30 + p1;
  };

  // =========================
  // TOTAL GRUPO
  // =========================

  const calcularTotalGrupo = (grupo) => {

    const tipos = grupo.datos || {};

    let total = 0;

    Object.keys(tipos).forEach(k => {
      total += calcularTotalFila(tipos[k]);
    });

    return total;
  };

  // =========================
  // RENDER GRUPO
  // =========================

  const renderGrupo = (grupo, index) => {

    const totalGrupo = calcularTotalGrupo(grupo);

    return (

      <div
        key={grupo.id}
        style={{
          border: "1px solid #ddd",
          borderRadius: "6px",
          padding: "15px",
          marginBottom: "15px"
        }}
      >

        {/* =========================
            HEADER
        ========================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "10px",
            flexWrap: "wrap"
          }}
        >

          {/* IZQUIERDA */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "15px",
              flexWrap: "wrap"
            }}
          >

            {/* TITULO */}
            <h3
              style={{
                margin: 0,
                fontWeight: "400"
              }}
            >
              Clasificación #{index + 1}
            </h3>

            {/* LOTE */}
            <div>
              <label>Lote</label>

              <select
                value={grupo.lote}
                onChange={(e) =>
                  actualizarGrupo(
                    grupo.id,
                    "lote",
                    e.target.value
                  )
                }
              >
                {lotes.map(l => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* TOTAL (NO EDITABLE) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column"
              }}
            >
            
              <label>Total</label>
            
              <div
                style={{
                  padding: "6px 10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  minWidth: "80px",
                  textAlign: "center",
                  background: "#f8f8f8",
                  fontWeight: "500"
                }}
              >
                {totalGrupo}
              </div>
            
            </div>

          </div>

          {/* DERECHA: BOTONES */}
          <div
            style={{
              display: "flex",
              gap: "6px"
            }}
          >

            <button
              type="button"
              onClick={() => toggleGrupo(grupo.id)}
              style={{
                width: "30px",
                height: "30px",
                fontSize: "16px"
              }}
            >
              {grupo.abierto ? "-" : "+"}
            </button>

            <button
              type="button"
              onClick={() => eliminarGrupo(grupo.id)}
              style={{
                width: "30px",
                height: "30px",
                background: "red",
                color: "white",
                border: "none",
                cursor: "pointer"
              }}
            >
              X
            </button>

          </div>

        </div>

        {/* =========================
            BODY
        ========================= */}

        {grupo.abierto && (

          <>

            {/* =========================
                FILA SUPERIOR (CLASIFICACIÓN + PERSONAS)
            ========================= */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "10px",
                marginTop: "15px",
                alignItems: "end"
              }}
            >

              {/* CLASIFICACIÓN */}
              <div>
                <label>Clasificación</label>

                <select
                  value={grupo.tipo}
                  onChange={(e) =>
                    actualizarGrupo(
                      grupo.id,
                      "tipo",
                      e.target.value
                    )
                  }
                >
                  <option value="">Seleccione</option>

                  {opcionesGrupo.map(op => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>

              {/* RECOLECTOR */}
              <div>
                <label>Recolector</label>

                <select
                  value={grupo.recolector}
                  onChange={(e) =>
                    actualizarGrupo(
                      grupo.id,
                      "recolector",
                      e.target.value
                    )
                  }
                >
                  <option value="">Seleccione</option>
                  {personas.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* CLASIFICADOR */}
              <div>
                <label>Clasificador</label>

                <select
                  value={grupo.clasificador}
                  onChange={(e) =>
                    actualizarGrupo(
                      grupo.id,
                      "clasificador",
                      e.target.value
                    )
                  }
                >
                  <option value="">Seleccione</option>
                  {personas.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

            </div>

{/* =========================
    TABLA SEGÚN TIPO
========================= */}


{!grupo.tipo ? null : grupo.tipo === "incubable" ? (

  /* =========================
      TABLA 4x6 INCUBABLE
  ========================= */

  <div style={{ marginTop: "15px", overflowX: "auto" }}>

    <table style={{ width: "100%", borderCollapse: "collapse" }}>

      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>Tamaño</th>
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

          const total =
            (Number(fila.nido336) || 0) * 336 +
            (Number(fila.nido360) || 0) * 360 +
            (Number(fila.piso336) || 0) * 336 +
            (Number(fila.piso360) || 0) * 360;

          return (
            <tr key={t}>

              {/* TAMAÑO */}
              <td style={{ textAlign: "left" }}>
                {t}
              </td>

              {/* NIDO 336 */}
              <td>
                <input
                  type="number"
                  value={fila.nido336}
                  onChange={(e) =>
                    actualizarTabla(
                      grupo.id,
                      t,
                      "nido336",
                      e.target.value
                    )
                  }
                />
              </td>

              {/* NIDO 360 */}
              <td>
                <input
                  type="number"
                  value={fila.nido360}
                  onChange={(e) =>
                    actualizarTabla(
                      grupo.id,
                      t,
                      "nido360",
                      e.target.value
                    )
                  }
                />
              </td>

              {/* PISO 336 */}
              <td>
                <input
                  type="number"
                  value={fila.piso336}
                  onChange={(e) =>
                    actualizarTabla(
                      grupo.id,
                      t,
                      "piso336",
                      e.target.value
                    )
                  }
                />
              </td>

              {/* PISO 360 */}
              <td>
                <input
                  type="number"
                  value={fila.piso360}
                  onChange={(e) =>
                    actualizarTabla(
                      grupo.id,
                      t,
                      "piso360",
                      e.target.value
                    )
                  }
                />
              </td>

              {/* TOTAL UNIDADES */}
              <td>
                {total}
              </td>

            </tr>
          );
        })}
      </tbody>

    </table>

  </div>

) : (

  /* =========================
      TABLA 10x8 COMPLETA
  ========================= */

  <div style={{ marginTop: "15px", overflowX: "auto" }}>

    <table style={{ width: "100%", borderCollapse: "collapse" }}>

      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>Tamaño</th>
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
              <td style={{ textAlign: "left" }}>{t}</td>

              {["nido360", "nido30", "nido1", "piso360", "piso30", "piso1"].map(campo => (
                <td key={campo}>
                  <input
                    type="number"
                    value={fila[campo]}
                    onChange={(e) =>
                      actualizarTabla(
                        grupo.id,
                        t,
                        campo,
                        e.target.value
                      )
                    }
                  />
                </td>
              ))}

              <td>
                {calcularTotalFila(fila)}
              </td>

            </tr>
          );
        })}
      </tbody>

    </table>

  </div>

)}

            {/* =========================
                AJUSTES DE ESTILO (ALINEACIÓN)
            ========================= */}

            <style>
              {`
                th {
                  text-align: center;
                  padding: 6px;
                  font-weight: 600;
                }

                td {
                  padding: 4px;
                  text-align: center;
                }

                td:first-child {
                  text-align: left;
                  font-weight: 500;
                }

                input {
                  width: 70px;
                }

                select {
                  width: 100%;
                }
              `}
            </style>

          </>

        )}

      </div>
    );
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = () => {

    const data = {
      fecha,
      clasificaciones: grupos
    };

    console.log(data);

    alert("Registro guardado correctamente");
  };

  // =========================
  // RENDER PRINCIPAL
  // =========================

  return (

    <div className="form-container">

      <h2>Ingreso de Huevos (Clasificación Avanzada)</h2>

      {/* FECHA */}

      <div style={{ marginBottom: "10px" }}>
        <label>Fecha</label>

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      {/* AGREGAR GRUPO */}

      <div style={{ margin: "15px 0" }}>
        <button
          type="button"
          onClick={agregarGrupo}
          style={{
            width: "40px",
            height: "40px",
            fontSize: "22px"
          }}
        >
          +
        </button>
      </div>

      {/* LISTA DE CLASIFICACIONES */}

      {grupos.map(renderGrupo)}

      {/* GUARDAR */}

      <button
        onClick={guardar}
        style={{
          marginTop: "20px",
          padding: "10px 20px"
        }}
      >
        Guardar
      </button>

    </div>
  );
}

export default IngresoHuevos;
