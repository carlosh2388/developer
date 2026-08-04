import { useState } from "react";

function EgresoAlimento() {

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [galeraSeleccionada, setGaleraSeleccionada] =
    useState("");

  const galeras = [
    "Crianza",
    "Galera 1",
    "Galera 2",
    "Galera 3",
    "Galera 4",
    "Galera 5"
  ];

  const alimentosOptions = [
    "Preinicio",
    "Inicio",
    "Desarrollo",
    "Crecimiento",
    "Prepostura",
    "Fase 1",
    "Fase 2"
  ];

  const aditivosDisponibles = [
    "AD01",
    "AD02"
  ];

  const medicamentosDisponibles = [
    "MD01",
    "MD02"
  ];

  const vacunasDisponibles = [
    "VA01",
    "VA02"
  ];

  const crearFila = (
    tipo = "Alimento"
  ) => ({
    id: Date.now() + Math.random(),

    tipo,

    alimento: "",
    vacuna: "",
    cantidad: "",

    aditivos:
      tipo === "Alimento"
        ? [""]
        : [],

    medicamentos:
      tipo === "Alimento"
        ? [""]
        : []
  });

  const crearGrupoGalera = (galera) => ({
    id: Date.now() + Math.random(),
    galera,
    filas: []
  });

  const [grupos, setGrupos] = useState([]);

  const agregarGrupoGalera = () => {

    if (!galeraSeleccionada) {
      alert("Seleccione una galera");
      return;
    }

    setGrupos(prev => [
      ...prev,
      crearGrupoGalera(galeraSeleccionada)
    ]);

    setGaleraSeleccionada("");
  };

  const agregarFila = (
    grupoId,
    tipo
  ) => {

    setGrupos(prev =>
      prev.map(g =>
        g.id === grupoId
          ? {
              ...g,
              filas: [
                ...g.filas,
                crearFila(tipo)
              ]
            }
          : g
      )
    );
  };

  const eliminarFila = (grupoId, filaId) => {

    setGrupos(prev =>
      prev.map(g =>
        g.id === grupoId
          ? {
              ...g,
              filas: g.filas.filter(
                f => f.id !== filaId
              )
            }
          : g
      )
    );
  };

  const handleChange = (
    grupoId,
    filaId,
    campo,
    valor
  ) => {

    setGrupos(prev =>
      prev.map(g => {

        if (g.id !== grupoId) return g;

        return {
          ...g,
          filas: g.filas.map(f =>
            f.id === filaId
              ? {
                  ...f,
                 [campo]: valor
                }
              : f
          )
        };
      })
    );
  };

  const agregarAditivoFila = (
    grupoId,
    filaId
  ) => {

    setGrupos(prev =>
      prev.map(g => {

        if (g.id !== grupoId) return g;

        return {
          ...g,
          filas: g.filas.map(f =>
            f.id === filaId
              ? {
                  ...f,
                  aditivos: [
                    ...(f.aditivos || []),
                    ""
                  ]
                }
              : f
          )
        };
      })
    );
  };

  const agregarMedicamentoFila = (
    grupoId,
    filaId
  ) => {

    setGrupos(prev =>
      prev.map(g => {

        if (g.id !== grupoId) return g;

        return {
          ...g,
          filas: g.filas.map(f =>
            f.id === filaId
              ? {
                  ...f,
                  medicamentos: [
                    ...(f.medicamentos || []),
                    ""
                  ]
                }
              : f
          )
        };
      })
    );
  };

  const cambiarAditivo = (
    grupoId,
    filaId,
    index,
    valor
  ) => {

    setGrupos(prev =>
      prev.map(g => {

        if (g.id !== grupoId) return g;

        return {
          ...g,
          filas: g.filas.map(f => {

            if (f.id !== filaId)
              return f;

            const copia = [
              ...f.aditivos
            ];

            copia[index] = valor;

            return {
              ...f,
              aditivos: copia
            };
          })
        };
      })
    );
  };

  const cambiarMedicamento = (
    grupoId,
    filaId,
    index,
    valor
  ) => {

    setGrupos(prev =>
      prev.map(g => {

        if (g.id !== grupoId) return g;

        return {
          ...g,
          filas: g.filas.map(f => {

            if (f.id !== filaId)
              return f;

            const copia = [
              ...f.medicamentos
            ];

            copia[index] = valor;

            return {
              ...f,
              medicamentos: copia
            };
          })
        };
      })
    );
  };

  const guardar = (e) => {

    e.preventDefault();

    console.log({
      fecha,
      movimientos: grupos
    });

    alert("Registro guardado correctamente");
  };

  const inputStyle = {
    width: "100%",
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "4px"
  };

  const btnAdd = {
    padding: "10px 15px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  };

  const btnDelete = {
    padding: "6px 10px",
    background: "#d9534f",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >
      <h2>Salida de Alimento</h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "end",
          marginBottom: "20px"
        }}
      >
        <div>
          <label>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(e.target.value)
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label>Galera</label>
          <select
            value={galeraSeleccionada}
            onChange={(e) =>
              setGaleraSeleccionada(
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="">
              Seleccione
            </option>

            {galeras.map(g => (
              <option
                key={g}
                value={g}
              >
                {g}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={agregarGrupoGalera}
          style={btnAdd}
        >
          +
        </button>
      </div>

      <form onSubmit={guardar}>
        {grupos.map(grupo => (
          <div
            key={grupo.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "20px"
            }}
          >
            <h3>{grupo.galera}</h3>

            <div
              style={{
                marginBottom: "15px"
              }}
            >
              <button
                type="button"
                onClick={() =>
                  agregarFila(
                    grupo.id,
                    "Alimento"
                  )
                }
                style={btnAdd}
              >
                Alimento
              </button>

              <button
                type="button"
                onClick={() =>
                  agregarFila(
                    grupo.id,
                    "Vacuna"
                  )
                }
                style={{
                  ...btnAdd,
                  marginLeft: "10px"
                }}
              >
                Vacuna
              </button>
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse"
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f5f5f5"
                  }}
                >
                  <th>
                    Alimento / Vacuna
                  </th>

                  <th>
                    Cantidad
                  </th>

                  <th>
                    Aditivo
                  </th>

                  <th>
                    Medicamento
                  </th>

                  <th>
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>

                {grupo.filas.map(fila => (
                  <tr key={fila.id}>

                    <td>

                      {fila.tipo ===
                      "Vacuna" ? (

                        <select
                          value={
                            fila.vacuna
                          }
                          onChange={(e) =>
                            handleChange(
                              grupo.id,
                              fila.id,
                              "vacuna",
                              e.target.value
                            )
                          }
                          style={inputStyle}
                        >
                          <option value="">
                            Seleccione
                          </option>

                          {vacunasDisponibles.map(v => (
                            <option
                              key={v}
                              value={v}
                            >
                              {v}
                            </option>
                          ))}
                        </select>

                      ) : (

                        <select
                          value={
                            fila.alimento
                          }
                          onChange={(e) =>
                            handleChange(
                              grupo.id,
                              fila.id,
                              "alimento",
                              e.target.value
                            )
                          }
                          style={inputStyle}
                        >
                          <option value="">
                            Seleccione
                          </option>

                          {alimentosOptions.map(a => (
                            <option
                              key={a}
                              value={a}
                            >
                              {a}
                            </option>
                          ))}
                        </select>

                      )}

                    </td>

                    <td>
                      <input
                        type="number"
                        value={
                          fila.cantidad
                        }
                        onChange={(e) =>
                          handleChange(
                            grupo.id,
                            fila.id,
                            "cantidad",
                            e.target.value
                          )
                        }
                        style={inputStyle}
                      />
                    </td>

                    <td>
                      {fila.tipo !==
                      "Alimento" ? (
                        "No aplica"
                      ) : (
                        <div>
                          {(fila.aditivos || []).map(
                            (
                              aditivo,
                              index
                            ) => (
                              <div
                                key={index}
                                style={{
                                  marginBottom:
                                    "5px"
                                }}
                              >
                                <select
                                  value={
                                    aditivo
                                  }
                                  onChange={(e) =>
                                    cambiarAditivo(
                                      grupo.id,
                                      fila.id,
                                      index,
                                      e.target
                                        .value
                                    )
                                  }
                                  style={
                                    inputStyle
                                  }
                                >
                                  <option value="">
                                    Seleccione
                                  </option>

                                  {aditivosDisponibles.map(
                                    a => (
                                      <option
                                        key={a}
                                        value={a}
                                      >
                                        {a}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>
                            )
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              agregarAditivoFila(
                                grupo.id,
                                fila.id
                              )
                            }
                          >
                            +
                          </button>

                        </div>
                      )}
                    </td>

                    <td>
                      {fila.tipo !==
                      "Alimento" ? (
                        "No aplica"
                      ) : (
                        <div>
                          {(fila.medicamentos || []).map(
                            (
                              med,
                              index
                            ) => (
                              <div
                                key={index}
                                style={{
                                  marginBottom:
                                    "5px"
                                }}
                              >
                                <select
                                  value={med}
                                  onChange={(e) =>
                                    cambiarMedicamento(
                                      grupo.id,
                                      fila.id,
                                      index,
                                      e.target
                                        .value
                                    )
                                  }
                                  style={
                                    inputStyle
                                  }
                                >
                                  <option value="">
                                    Seleccione
                                  </option>

                                  {medicamentosDisponibles.map(
                                    m => (
                                      <option
                                        key={m}
                                        value={m}
                                      >
                                        {m}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>
                            )
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              agregarMedicamentoFila(
                                grupo.id,
                                fila.id
                              )
                            }
                          >
                            +
                          </button>

                        </div>
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          eliminarFila(
                            grupo.id,
                            fila.id
                          )
                        }
                        style={btnDelete}
                      >
                        X
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        ))}

        <button
          type="submit"
          style={btnAdd}
        >
          Guardar
        </button>
      </form>
    </div>
  );
}

export default EgresoAlimento;
