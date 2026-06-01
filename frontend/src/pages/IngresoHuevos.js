import { useEffect, useState } from "react";

function IngresoHuevos() {

  // =========================
  // STATES BASE
  // =========================

  const [fecha, setFecha] = useState("");

  // =========================
  // OPCIONES
  // =========================

  const opcionesGrupo = [
    "incubable",
    "comercial",
    "sucio",
    "quebrado",
    "otros"
  ];

  const personas = [
    "Tomas Pérez",
    "María Gomez"
  ];

  // =========================
  // CREAR CLASIFICACIÓN
  // =========================

  const crearGrupo = () => ({
    id: Date.now() + Math.random(),

    tipo: "",

    lote: "REP-260401-1600",

    abierto: true,

    pequeno: 0,
    mediano: 0,
    grande: 0,
    otrosClasificacion: 0,

    recolector: "",
    clasificador: ""
  });

  // =========================
  // LISTA DE CLASIFICACIONES
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
  // AGREGAR CLASIFICACIÓN
  // =========================

  const agregarGrupo = () => {

    setGrupos(prev => [
      ...prev,
      crearGrupo()
    ]);

  };

  // =========================
  // ELIMINAR CLASIFICACIÓN
  // =========================

  const eliminarGrupo = (id) => {

    setGrupos(prev =>
      prev.filter(
        grupo => grupo.id !== id
      )
    );

  };

  // =========================
  // EXPANDIR / OCULTAR
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
  // ACTUALIZAR CAMPO
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
  // TOTAL POR CLASIFICACIÓN
  // =========================

  const calcularTotal = (grupo) => {

    return (
      (parseInt(grupo.pequeno) || 0) +
      (parseInt(grupo.mediano) || 0) +
      (parseInt(grupo.grande) || 0) +
      (parseInt(grupo.otrosClasificacion) || 0)
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

    alert(
      "Registro guardado correctamente"
    );

  };

  // =========================
  // RENDER CLASIFICACIÓN
  // =========================

  const renderGrupo = (
    grupo,
    index
  ) => {

    const total =
      calcularTotal(grupo);

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

        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px"
          }}
        >

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
              Clasificación #
              {index + 1}
            </h3>

            <div>

              <label>
                Lote
              </label>

              <input
                type="text"
                value={grupo.lote}
                readOnly
              />

            </div>

            <div>

              <label>
                Total
              </label>

              <input
                type="number"
                value={total}
                readOnly
              />

            </div>

          </div>

          <div
            style={{
              display: "flex",
              gap: "5px"
            }}
          >

            <button
              type="button"
              onClick={() =>
                toggleGrupo(
                  grupo.id
                )
              }
              style={{
                width: "30px",
                height: "30px"
              }}
            >
              {grupo.abierto
                ? "-"
                : "+"}
            </button>

            <button
              type="button"
              onClick={() =>
                eliminarGrupo(
                  grupo.id
                )
              }
              style={{
                width: "30px",
                height: "30px",
                background:
                  "#dc3545",
                color: "#fff",
                border: "none",
                cursor:
                  "pointer"
              }}
            >
              X
            </button>

          </div>

        </div>

        {/* BODY */}

        {grupo.abierto && (

          <>

            {/* CLASIFICACIÓN */}

            <div
              style={{
                marginTop: "15px"
              }}
            >

              <label>
                Clasificación
              </label>

              <select
                value={
                  grupo.tipo
                }
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

                {opcionesGrupo.map(
                  opcion => (
                    <option
                      key={
                        opcion
                      }
                      value={
                        opcion
                      }
                    >
                      {opcion
                        .charAt(
                          0
                        )
                        .toUpperCase() +
                        opcion.slice(
                          1
                        )}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* TAMAÑOS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: "10px",
                marginTop:
                  "15px"
              }}
            >

              <div>

                <label>
                  Pequeño
                </label>

                <input
                  type="number"
                  value={
                    grupo.pequeno
                  }
                  onChange={(
                    e
                  ) =>
                    actualizarGrupo(
                      grupo.id,
                      "pequeno",
                      e
                        .target
                        .value
                    )
                  }
                />

              </div>

              <div>

                <label>
                  Mediano
                </label>

                <input
                  type="number"
                  value={
                    grupo.mediano
                  }
                  onChange={(
                    e
                  ) =>
                    actualizarGrupo(
                      grupo.id,
                      "mediano",
                      e
                        .target
                        .value
                    )
                  }
                />

              </div>

              <div>

                <label>
                  Grande
                </label>

                <input
                  type="number"
                  value={
                    grupo.grande
                  }
                  onChange={(
                    e
                  ) =>
                    actualizarGrupo(
                      grupo.id,
                      "grande",
                      e
                        .target
                        .value
                    )
                  }
                />

              </div>

            </div>

            {/* OTROS */}

            <div
              style={{
                marginTop:
                  "10px"
              }}
            >

              <label>
                Otros (lijado,
                deforme,
                pruebas)
              </label>

              <input
                type="number"
                value={
                  grupo.otrosClasificacion
                }
                onChange={(
                  e
                ) =>
                  actualizarGrupo(
                    grupo.id,
                    "otrosClasificacion",
                    e.target
                      .value
                  )
                }
              />

            </div>

            {/* RECOLECTOR Y CLASIFICADOR */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "10px",
                marginTop:
                  "15px"
              }}
            >

              <div>

                <label>
                  Recolector
                </label>

                <select
                  value={
                    grupo.recolector
                  }
                  onChange={(
                    e
                  ) =>
                    actualizarGrupo(
                      grupo.id,
                      "recolector",
                      e
                        .target
                        .value
                    )
                  }
                >
                  <option value="">
                    Seleccione
                  </option>

                  {personas.map(
                    persona => (
                      <option
                        key={
                          persona
                        }
                        value={
                          persona
                        }
                      >
                        {
                          persona
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              <div>

                <label>
                  Clasificador
                </label>

                <select
                  value={
                    grupo.clasificador
                  }
                  onChange={(
                    e
                  ) =>
                    actualizarGrupo(
                      grupo.id,
                      "clasificador",
                      e
                        .target
                        .value
                    )
                  }
                >
                  <option value="">
                    Seleccione
                  </option>

                  {personas.map(
                    persona => (
                      <option
                        key={
                          persona
                        }
                        value={
                          persona
                        }
                      >
                        {
                          persona
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

          </>

        )}

      </div>

    );

  };

  // =========================
  // RENDER
  // =========================

  return (

    <div
      className="form-container"
    >

      <h2>
        Ingreso de Huevos
        (Clasificación)
      </h2>

      {/* FECHA */}

      <label>
        Fecha
      </label>

      <input
        type="date"
        value={fecha}
        onChange={(e) =>
          setFecha(
            e.target.value
          )
        }
      />

      {/* AGREGAR */}

      <div
        style={{
          margin:
            "15px 0"
        }}
      >

        <button
          type="button"
          onClick={
            agregarGrupo
          }
          style={{
            width: "40px",
            height: "40px",
            fontSize:
              "22px"
          }}
        >
          +
        </button>

      </div>

      {/* CLASIFICACIONES */}

      {grupos.map(
        renderGrupo
      )}

      {/* GUARDAR */}

      <button
        onClick={guardar}
      >
        Guardar
      </button>

    </div>

  );

}

export default IngresoHuevos;
