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
  // OPCIONES CLASIFICACIÓN
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
  // CREAR FILA
  // =========================

  const crearFila = () => ({
    nido336: "",
    nido360: "",
    piso336: "",
    piso360: ""
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

    grande: crearFila(),

    mediano: crearFila(),

    pequeno: crearFila(),

    otros: crearFila()
  });

  // =========================
  // CLASIFICACIONES
  // =========================

  const [grupos, setGrupos] = useState([
    crearGrupo()
  ]);

  // =========================
  // FECHA INICIAL
  // =========================

  useEffect(() => {

    const now = new Date();

    setFecha(
      now.toISOString().split("T")[0]
    );

  }, []);

  // =========================
  // AGREGAR
  // =========================

  const agregarGrupo = () => {

    setGrupos(prev => [
      ...prev,
      crearGrupo()
    ]);

  };

  // =========================
  // ELIMINAR
  // =========================

  const eliminarGrupo = (id) => {

    setGrupos(prev =>
      prev.filter(
        grupo => grupo.id !== id
      )
    );

  };

  // =========================
  // TOGGLE
  // =========================

  const toggleGrupo = (id) => {

    setGrupos(prev =>
      prev.map(grupo =>
        grupo.id === id
          ? {
              ...grupo,
              abierto: !grupo.abierto
            }
          : grupo
      )
    );

  };

  // =========================
  // ACTUALIZAR CAMPO SIMPLE
  // =========================

  const actualizarGrupo = (
    id,
    campo,
    valor
  ) => {

    setGrupos(prev =>
      prev.map(grupo =>
        grupo.id === id
          ? {
              ...grupo,
              [campo]: valor
            }
          : grupo
      )
    );

  };

  // =========================
  // ACTUALIZAR TABLA
  // =========================

  const actualizarFila = (
    grupoId,
    categoria,
    campo,
    valor
  ) => {

    setGrupos(prev =>
      prev.map(grupo => {

        if (
          grupo.id !== grupoId
        ) {
          return grupo;
        }

        return {
          ...grupo,

          [categoria]: {
            ...grupo[categoria],
            [campo]: valor
          }
        };

      })
    );

  };

  // =========================
  // TOTAL FILA
  // =========================

  const calcularTotalFila = (
    fila
  ) => {

    const n336 =
      parseInt(
        fila.nido336
      ) || 0;

    const n360 =
      parseInt(
        fila.nido360
      ) || 0;

    const p336 =
      parseInt(
        fila.piso336
      ) || 0;

    const p360 =
      parseInt(
        fila.piso360
      ) || 0;

    return (
      (n336 * 336) +
      (n360 * 360) +
      (p336 * 336) +
      (p360 * 360)
    );

  };

  // =========================
  // TOTAL GENERAL
  // =========================

  const calcularTotalGrupo = (
    grupo
  ) => {

    return (
      calcularTotalFila(
        grupo.grande
      ) +
      calcularTotalFila(
        grupo.mediano
      ) +
      calcularTotalFila(
        grupo.pequeno
      ) +
      calcularTotalFila(
        grupo.otros
      )
    );

  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = () => {

    const data = {
      fecha,
      clasificaciones:
        grupos
    };

    console.log(data);

    alert(
      "Registro guardado correctamente"
    );

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
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap"
          }}
        >

          {/* IZQUIERDA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap"
            }}
          >

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

            {/* TOTAL GENERAL */}
            <div>

              <label>Total</label>

              <input
                type="number"
                value={totalGrupo}
                readOnly
              />

            </div>

          </div>

          {/* DERECHA BOTONES */}
          <div
            style={{
              display: "flex",
              gap: "6px"
            }}
          >

            <button
              type="button"
              onClick={() =>
                toggleGrupo(grupo.id)
              }
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
              onClick={() =>
                eliminarGrupo(grupo.id)
              }
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
            BODY (EXPANDIBLE)
        ========================= */}

        {grupo.abierto && (

          <>

            {/* =========================
                CLASIFICACIÓN
            ========================= */}

            <div style={{ marginTop: "15px" }}>

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

                <option value="">
                  Seleccione
                </option>

                {opcionesGrupo.map(op => (
                  <option key={op} value={op}>
                    {op.charAt(0).toUpperCase() + op.slice(1)}
                  </option>
                ))}

              </select>

            </div>

            {/* =========================
                TABLA 4x6
            ========================= */}

            <div
              style={{
                marginTop: "15px",
                overflowX: "auto"
              }}
            >

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "center"
                }}
              >

                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Nido 336</th>
                    <th>Nido 360</th>
                    <th>Piso 336</th>
                    <th>Piso 360</th>
                    <th>Total Unidades</th>
                  </tr>
                </thead>

                <tbody>

                  {/* GRANDE */}
                  <tr>
                    <td>Grande</td>

                    <td>
                      <input
                        type="number"
                        value={grupo.grande.nido336}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "grande",
                            "nido336",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={grupo.grande.nido360}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "grande",
                            "nido360",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={grupo.grande.piso336}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "grande",
                            "piso336",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={grupo.grande.piso360}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "grande",
                            "piso360",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      {calcularTotalFila(grupo.grande)}
                    </td>
                  </tr>

                  {/* MEDIANO */}
                  <tr>
                    <td>Mediano</td>

                    <td>
                      <input
                        type="number"
                        value={grupo.mediano.nido336}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "mediano",
                            "nido336",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={grupo.mediano.nido360}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "mediano",
                            "nido360",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={grupo.mediano.piso336}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "mediano",
                            "piso336",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={grupo.mediano.piso360}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "mediano",
                            "piso360",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      {calcularTotalFila(grupo.mediano)}
                    </td>
                  </tr>

                  {/* PEQUEÑO */}
                  <tr>
                    <td>Pequeño</td>

                    <td>
                      <input
                        type="number"
                        value={grupo.pequeno.nido336}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "pequeno",
                            "nido336",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={grupo.pequeno.nido360}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "pequeno",
                            "nido360",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={grupo.pequeno.piso336}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "pequeno",
                            "piso336",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={grupo.pequeno.piso360}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "pequeno",
                            "piso360",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      {calcularTotalFila(grupo.pequeno)}
                    </td>
                  </tr>

                  {/* OTROS (LIJADO, DEFORME, PRUEBAS) */}
                  <tr>
                    <td>Otros (lijado, deforme, pruebas)</td>

                    <td>
                      <input
                        type="number"
                        value={grupo.otros.nido336}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "otros",
                            "nido336",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={grupo.otros.nido360}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "otros",
                            "nido360",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={grupo.otros.piso336}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "otros",
                            "piso336",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={grupo.otros.piso360}
                        onChange={(e) =>
                          actualizarFila(
                            grupo.id,
                            "otros",
                            "piso360",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      {calcularTotalFila(grupo.otros)}
                    </td>
                  </tr>

                </tbody>

              </table>

            </div>

            {/* =========================
                RECOLECTOR / CLASIFICADOR
            ========================= */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginTop: "15px"
              }}
            >

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

          </>

        )}

      </div>

    );
  };

  // =========================
  // RENDER PRINCIPAL
  // =========================

  return (

    <div className="form-container">

      <h2>Ingreso de Huevos (Clasificación)</h2>

      {/* FECHA */}

      <label>Fecha</label>

      <input
        type="date"
        value={fecha}
        onChange={(e) =>
          setFecha(e.target.value)
        }
      />

      {/* AGREGAR CLASIFICACIÓN */}

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

      {/* LISTA */}

      {grupos.map(renderGrupo)}

      {/* GUARDAR */}

      <button onClick={guardar}>
        Guardar
      </button>

    </div>
  );
}

export default IngresoHuevos;
