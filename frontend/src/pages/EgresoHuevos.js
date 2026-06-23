import { useEffect, useState } from "react";

function EgresoHuevos() {

  // =====================================================
  // DATOS GENERALES
  // =====================================================

  const [egreso, setEgreso] = useState("");

  const [fecha, setFecha] = useState("");

  const [hora, setHora] = useState("");

  const [fechaProduccion, setFechaProduccion] =
    useState("");

  // =====================================================
  // BODEGAS
  // =====================================================

  const [bodegaSalida, setBodegaSalida] =
    useState("BA");

  const [bodegaDestino, setBodegaDestino] =
    useState("");

  // =====================================================
  // PLACAS
  // =====================================================

  const [placa, setPlaca] = useState("");

  const [nuevaPlaca, setNuevaPlaca] =
    useState("");

  const [mostrarNuevaPlaca,
    setMostrarNuevaPlaca] = useState(false);

  const [placas, setPlacas] = useState([
    "L-123ABC",
    "L-456DEF"
  ]);

  // =====================================================
  // PILOTOS
  // =====================================================

  const [piloto, setPiloto] = useState("");

  const [nuevoPiloto, setNuevoPiloto] =
    useState("");

  const [mostrarNuevoPiloto,
    setMostrarNuevoPiloto] = useState(false);

  const [pilotos, setPilotos] = useState([
    "Juan Pérez",
    "Carlos López"
  ]);

  // =====================================================
  // LOTES DISPONIBLES
  // =====================================================

  const lotesDisponibles = [
    "SL-001",
    "BL-001"
  ];

  // =====================================================
  // FILAS INCUBADORA
  // =====================================================

  const filasIncubadora = [
    "Grande (Nido)",
    "Mediano (Nido)",
    "Pequeño (Nido)",
    "Otros* (Nido)",
    "Otros* (Piso)"
  ];

  // =====================================================
  // FILAS COMERCIAL
  // =====================================================

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

  // =====================================================
  // CREAR FILA INCUBADORA
  // =====================================================

  const crearFilaIncubadora = () => ({
    existencias: 0,
    cajaBandejas336: 0,
    cajaCartones360: 0,
    bandeja84: 0,
    carton30: 0,
    unidades: 0
  });

  // =====================================================
  // CREAR FILA COMERCIAL
  // =====================================================

  const crearFilaComercial = () => ({
    existencias: 0,
    cajaCartones360: 0,
    carton30: 0,
    unidades: 0
  });

  // =====================================================
  // CREAR ESTRUCTURA INCUBADORA
  // =====================================================

  const crearIncubadora = () => {

    const obj = {};

    filasIncubadora.forEach((fila) => {
      obj[fila] = crearFilaIncubadora();
    });

    return obj;
  };

  // =====================================================
  // CREAR ESTRUCTURA COMERCIAL
  // =====================================================

  const crearComercial = () => {

    const obj = {};

    filasComercial.forEach((fila) => {
      obj[fila] = crearFilaComercial();
    });

    return obj;
  };

  // =====================================================
  // CREAR LOTE
  // =====================================================

  const crearLote = (
    codigo = "Lote 1"
  ) => ({

    id: Date.now() + Math.random(),

    lote: codigo,

    clasificacion: "",

    collapsed: false,

    incubadora: crearIncubadora(),

    comercial: crearComercial()

  });

  // =====================================================
  // LOTES
  // =====================================================

  const [lotes, setLotes] = useState([
    crearLote()
  ]);

  // =====================================================
  // FECHA Y HORA ACTUAL
  // =====================================================

  useEffect(() => {

    const now = new Date();

    const fechaActual =
      now.toISOString().split("T")[0];

    setFecha(fechaActual);

    setFechaProduccion(fechaActual);

    setHora(
      now.toTimeString().slice(0, 5)
    );

  }, []);

  // =====================================================
  // CAMBIAR LOTE
  // =====================================================

  const handleLote = (
    id,
    value
  ) => {

    setLotes(prev =>
      prev.map(l =>
        l.id === id
          ? {
              ...l,
              lote: value
            }
          : l
      )
    );
  };

  // =====================================================
  // CAMBIAR CLASIFICACION
  // =====================================================

  const handleClasificacion = (
    id,
    value
  ) => {

    setLotes(prev =>
      prev.map(l =>
        l.id === id
          ? {
              ...l,
              clasificacion: value
            }
          : l
      )
    );
  };

  // =====================================================
  // TOGGLE LOTE
  // =====================================================

  const toggleLote = (
    loteId
  ) => {

    setLotes(prev =>
      prev.map(l =>
        l.id === loteId
          ? {
              ...l,
              collapsed:
                !l.collapsed
            }
          : l
      )
    );
  };

  // =====================================================
  // AGREGAR LOTE
  // =====================================================

  const agregarLote = () => {

    setLotes(prev => [
      ...prev,
      crearLote()
    ]);
  };

  // =====================================================
  // ELIMINAR LOTE
  // =====================================================

  const eliminarLote = (
    id
  ) => {

    setLotes(prev =>
      prev.filter(
        l => l.id !== id
      )
    );
  };

  // =====================================================
  // ACTUALIZAR FILA INCUBADORA
  // =====================================================

  const handleIncubadora = (
    loteId,
    fila,
    campo,
    value
  ) => {

    setLotes(prev =>
      prev.map(l =>

        l.id === loteId

          ? {
              ...l,

              incubadora: {
                ...l.incubadora,

                [fila]: {
                  ...l.incubadora[fila],

                  [campo]: value
                }
              }
            }

          : l
      )
    );
  };

  // =====================================================
  // ACTUALIZAR FILA COMERCIAL
  // =====================================================

  const handleComercial = (
    loteId,
    fila,
    campo,
    value
  ) => {

    setLotes(prev =>
      prev.map(l =>

        l.id === loteId

          ? {
              ...l,

              comercial: {
                ...l.comercial,

                [fila]: {
                  ...l.comercial[fila],

                  [campo]: value
                }
              }
            }

          : l
      )
    );
  };

  // =====================================================
  // TOTAL FILA INCUBADORA
  // =====================================================

  const totalFilaIncubadora =
    (filaData) => {

      return (

        (parseInt(
          filaData.cajaBandejas336
        ) || 0) * 336 +

        (parseInt(
          filaData.cajaCartones360
        ) || 0) * 360 +

        (parseInt(
          filaData.bandeja84
        ) || 0) * 84 +

        (parseInt(
          filaData.carton30
        ) || 0) * 30 +

        (parseInt(
          filaData.unidades
        ) || 0)

      );
    };

  // =====================================================
  // TOTAL FILA COMERCIAL
  // =====================================================

  const totalFilaComercial =
    (filaData) => {

      return (

        (parseInt(
          filaData.cajaCartones360
        ) || 0) * 360 +

        (parseInt(
          filaData.carton30
        ) || 0) * 30 +

        (parseInt(
          filaData.unidades
        ) || 0)

      );
    };

  // =====================================================
  // VALIDAR EXISTENCIAS
  // =====================================================

  const tieneExistencias =
    (
      existencias,
      total
    ) => {

      return (
        Number(existencias) >=
        Number(total)
      );
    };

  // =====================================================
  // TOTAL GENERAL LOTE
  // =====================================================

  const calcularTotalLote =
    (lote) => {

      if (
        lote.clasificacion ===
        "INCUBADORA"
      ) {

        return filasIncubadora.reduce(
          (acc, fila) =>
            acc +
            totalFilaIncubadora(
              lote.incubadora[fila]
            ),
          0
        );
      }

      if (
        lote.clasificacion ===
        "COMERCIAL"
      ) {

        return filasComercial.reduce(
          (acc, fila) =>
            acc +
            totalFilaComercial(
              lote.comercial[fila]
            ),
          0
        );
      }

      return 0;
    };

  // =====================================================
  // AGREGAR PLACA
  // =====================================================

  const agregarPlaca = () => {

    if (!nuevaPlaca.trim())
      return;

    setPlacas([
      ...placas,
      nuevaPlaca
    ]);

    setPlaca(
      nuevaPlaca
    );

    setNuevaPlaca("");

    setMostrarNuevaPlaca(
      false
    );
  };

  // =====================================================
  // AGREGAR PILOTO
  // =====================================================

  const agregarPiloto = () => {

    if (
      !nuevoPiloto.trim()
    ) return;

    setPilotos([
      ...pilotos,
      nuevoPiloto
    ]);

    setPiloto(
      nuevoPiloto
    );

    setNuevoPiloto("");

    setMostrarNuevoPiloto(
      false
    );
  };

  // =====================================================
  // GUARDAR
  // =====================================================

  const guardar = () => {

    const data = {

      egreso,

      fecha,

      hora,

      fechaProduccion,

      bodegaSalida,

      bodegaDestino,

      placa,

      piloto,

      lotes

    };

    console.log(data);

    alert(
      "Egreso registrado correctamente"
    );
  };

  // =====================================================
  // BOTON PEQUEÑO
  // =====================================================

  const smallButton = {

    width: "28px",

    height: "28px",

    padding: "0",

    fontSize: "16px",

    lineHeight: "1",

    cursor: "pointer"
  };

  // =====================================================
  // TABLA INCUBADORA
  // =====================================================

  const renderTablaIncubadora = (
    lote
  ) => {

    return (

      <div
        style={{
          overflowX: "auto",
          marginTop: "15px"
        }}
      >

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
                background:
                  "#f5f5f5"
              }}
            >

              <th>
                Tamaño
              </th>

              <th>
                Existencias
              </th>

              <th>
                Caja de Bandejas 336
              </th>

              <th>
                Caja de Cartones 360
              </th>

              <th>
                Bandeja 84
              </th>

              <th>
                Cartón 30
              </th>

              <th>
                Unidades
              </th>

              <th>
                Total Unidades
              </th>

              <th>
                Estado
              </th>

            </tr>

          </thead>

          <tbody>

            {filasIncubadora.map(
              (fila) => {

                const row =
                  lote.incubadora[
                    fila
                  ];

                const total =
                  totalFilaIncubadora(
                    row
                  );

                const ok =
                  tieneExistencias(
                    row.existencias,
                    total
                  );

                return (

                  <tr
                    key={fila}
                  >

                    <td>
                      {fila}
                    </td>

                    <td>

                      <input
                        type="number"
                        value={
                          row.existencias
                        }
                        onChange={(
                          e
                        ) =>
                          handleIncubadora(
                            lote.id,
                            fila,
                            "existencias",
                            e.target
                              .value
                          )
                        }
                      />

                    </td>

                    <td>

                      <input
                        type="number"
                        value={
                          row.cajaBandejas336
                        }
                        onChange={(
                          e
                        ) =>
                          handleIncubadora(
                            lote.id,
                            fila,
                            "cajaBandejas336",
                            e.target
                              .value
                          )
                        }
                      />

                    </td>

                    <td>

                      <input
                        type="number"
                        value={
                          row.cajaCartones360
                        }
                        onChange={(
                          e
                        ) =>
                          handleIncubadora(
                            lote.id,
                            fila,
                            "cajaCartones360",
                            e.target
                              .value
                          )
                        }
                      />

                    </td>

                    <td>

                      <input
                        type="number"
                        value={
                          row.bandeja84
                        }
                        onChange={(
                          e
                        ) =>
                          handleIncubadora(
                            lote.id,
                            fila,
                            "bandeja84",
                            e.target
                              .value
                          )
                        }
                      />

                    </td>

                    <td>

                      <input
                        type="number"
                        value={
                          row.carton30
                        }
                        onChange={(
                          e
                        ) =>
                          handleIncubadora(
                            lote.id,
                            fila,
                            "carton30",
                            e.target
                              .value
                          )
                        }
                      />

                    </td>

                    <td>

                      <input
                        type="number"
                        value={
                          row.unidades
                        }
                        onChange={(
                          e
                        ) =>
                          handleIncubadora(
                            lote.id,
                            fila,
                            "unidades",
                            e.target
                              .value
                          )
                        }
                      />

                    </td>

                    <td
                      style={{
                        fontWeight:
                          "bold"
                      }}
                    >
                      {total}
                    </td>

                    <td
                      style={{
                        textAlign:
                          "center",
                        fontSize:
                          "22px",
                        color: ok
                          ? "green"
                          : "red"
                      }}
                    >
                      {ok
                        ? "✔"
                        : "✖"}
                    </td>

                  </tr>

                );
              }
            )}

          </tbody>


        </table>

      </div>

    );
  };

  // =====================================================
  // TABLA COMERCIAL
  // =====================================================

  const renderTablaComercial = (
    lote
  ) => {

    return (

      <div
        style={{
          overflowX: "auto",
          marginTop: "15px"
        }}
      >

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
                background:
                  "#f5f5f5"
              }}
            >

              <th>
                Tamaño
              </th>

              <th>
                Existencias
              </th>

              <th>
                Caja de Cartones 360
              </th>

              <th>
                Cartón 30
              </th>

              <th>
                Unidades
              </th>

              <th>
                Total Unidades
              </th>

              <th>
                Estado
              </th>

            </tr>

          </thead>

          <tbody>

            {filasComercial.map(
              (fila) => {

                const row =
                  lote.comercial[
                    fila
                  ];

                const total =
                  totalFilaComercial(
                    row
                  );

                const ok =
                  tieneExistencias(
                    row.existencias,
                    total
                  );

                return (

                  <tr
                    key={fila}
                  >

                    <td>
                      {fila}
                    </td>

                    <td>

                      <input
                        type="number"
                        value={
                          row.existencias
                        }
                        onChange={(
                          e
                        ) =>
                          handleComercial(
                            lote.id,
                            fila,
                            "existencias",
                            e.target
                              .value
                          )
                        }
                      />

                    </td>

                    <td>

                      <input
                        type="number"
                        value={
                          row.cajaCartones360
                        }
                        onChange={(
                          e
                        ) =>
                          handleComercial(
                            lote.id,
                            fila,
                            "cajaCartones360",
                            e.target
                              .value
                          )
                        }
                      />

                    </td>

                    <td>

                      <input
                        type="number"
                        value={
                          row.carton30
                        }
                        onChange={(
                          e
                        ) =>
                          handleComercial(
                            lote.id,
                            fila,
                            "carton30",
                            e.target
                              .value
                          )
                        }
                      />

                    </td>

                    <td>

                      <input
                        type="number"
                        value={
                          row.unidades
                        }
                        onChange={(
                          e
                        ) =>
                          handleComercial(
                            lote.id,
                            fila,
                            "unidades",
                            e.target
                              .value
                          )
                        }
                      />

                    </td>

                    <td
                      style={{
                        fontWeight:
                          "bold"
                      }}
                    >
                      {total}
                    </td>

                    <td
                      style={{
                        textAlign:
                          "center",
                        fontSize:
                          "22px",
                        color: ok
                          ? "green"
                          : "red"
                      }}
                    >
                      {ok
                        ? "✔"
                        : "✖"}
                    </td>

                  </tr>

                );
              }
            )}

          </tbody>

        </table>

      </div>

    );
  };

  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================

  return (

    <div className="form-container">

      <h2>Egreso de Huevos</h2>

      {/* FILA 1 */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap: "10px"
        }}
      >

        <div>

          <label># Envío</label>

          <input
            value={egreso}
            onChange={(e) =>
              setEgreso(
                e.target.value
              )
            }
          />

        </div>

        <div>

          <label>Fecha</label>

          <input
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(
                e.target.value
              )
            }
          />

        </div>

        <div>

          <label>Hora</label>

          <input
            type="time"
            value={hora}
            onChange={(e) =>
              setHora(
                e.target.value
              )
            }
          />

        </div>

      </div>

      {/* FILA 2 */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap: "10px",
          marginTop: "10px"
        }}
      >

        <div>

          <label>
            Localidad Salida
          </label>

          <select
            value={bodegaSalida}
            onChange={(e) =>
              setBodegaSalida(
                e.target.value
              )
            }
          >

            <option>Granja</option>

           </select>

        </div>

        <div>

          <label>
            Localidad Destino
          </label>

          <select
            value={bodegaDestino}
            onChange={(e) =>
              setBodegaDestino(
                e.target.value
              )
            }
          >

            <option value="">
              Seleccione
            </option>

            <option>Incubadora</option>
            <option>Otra</option>


          </select>

        </div>

        <div>

          <label>
            Fecha Producción
          </label>

          <input
            type="date"
            value={
              fechaProduccion
            }
            onChange={(e) =>
              setFechaProduccion(
                e.target.value
              )
            }
          />

        </div>

      </div>

      {/* FILA 3 */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "10px",
          marginTop: "10px"
        }}
      >

        {/* PLACA */}

        <div>

          <label>
            Placa Camión
          </label>

          <div
            style={{
              display: "flex",
              gap: "8px"
            }}
          >

            <select
              value={placa}
              onChange={(e) =>
                setPlaca(
                  e.target.value
                )
              }
            >

              <option value="">
                Seleccione
              </option>

              {placas.map(
                (p, i) => (

                  <option
                    key={i}
                    value={p}
                  >
                    {p}
                  </option>

                )
              )}

            </select>

            <button
              type="button"
              onClick={() =>
                setMostrarNuevaPlaca(
                  true
                )
              }
              style={smallButton}
            >
              +
            </button>

          </div>

          {mostrarNuevaPlaca && (

            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "8px"
              }}
            >

              <input
                value={
                  nuevaPlaca
                }
                onChange={(e) =>
                  setNuevaPlaca(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={
                  agregarPlaca
                }
              >
                Guardar
              </button>

            </div>

          )}

        </div>

        {/* PILOTO */}

        <div>

          <label>
            Piloto
          </label>

          <div
            style={{
              display: "flex",
              gap: "8px"
            }}
          >

            <select
              value={piloto}
              onChange={(e) =>
                setPiloto(
                  e.target.value
                )
              }
            >

              <option value="">
                Seleccione
              </option>

              {pilotos.map(
                (p, i) => (

                  <option
                    key={i}
                    value={p}
                  >
                    {p}
                  </option>

                )
              )}

            </select>

            <button
              type="button"
              onClick={() =>
                setMostrarNuevoPiloto(
                  true
                )
              }
              style={smallButton}
            >
              +
            </button>

          </div>

          {mostrarNuevoPiloto && (

            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "8px"
              }}
            >

              <input
                value={
                  nuevoPiloto
                }
                onChange={(e) =>
                  setNuevoPiloto(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={
                  agregarPiloto
                }
              >
                Guardar
              </button>

            </div>

          )}

        </div>

      </div>

      {/* LOTES */}

      <div
        style={{
          marginTop: "25px"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            marginBottom:
              "20px"
          }}
        >

          <h2
            style={{
              margin: 0
            }}
          >
            Lotes
          </h2>

          <button
            type="button"
            onClick={
              agregarLote
            }
            style={smallButton}
          >
            +
          </button>

        </div>

        {lotes.map(
          (loteItem) => (

            <div
              key={
                loteItem.id
              }
              style={{
                border:
                  "1px solid #ccc",
                padding:
                  "15px",
                borderRadius:
                  "8px",
                marginBottom:
                  "20px"
              }}
            >

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "220px 250px 180px 1fr",
                  gap: "20px",
                  alignItems:
                    "center",
                  borderBottom:
                    "1px solid #ddd",
                  paddingBottom:
                    "15px",
                  marginBottom:
                    "15px"
                }}
              >

                <div>

                  <label>
                    # Lote
                  </label>

                  <select
                    value={
                      loteItem.lote
                    }
                    onChange={(
                      e
                    ) =>
                      handleLote(
                        loteItem.id,
                        e.target
                          .value
                      )
                    }
                  >

                    {lotesDisponibles.map(
                      (
                        lote,
                        index
                      ) => (

                        <option
                          key={
                            index
                          }
                          value={
                            lote
                          }
                        >
                          {lote}
                        </option>

                      )
                    )}

                  </select>

                </div>

                <div>

                  <label>
                    Clasificación
                  </label>

                  <select
                    value={
                      loteItem.clasificacion
                    }
                    onChange={(
                      e
                    ) =>
                      handleClasificacion(
                        loteItem.id,
                        e.target
                          .value
                      )
                    }
                  >

                    <option value="">
                      Seleccione
                    </option>

                    <option value="INCUBADORA">
                      Lote de
                      Incubadora
                    </option>

                    <option value="COMERCIAL">
                      Lote Comercial
                    </option>

                  </select>

                </div>

                <div
                  style={{
                    fontWeight:
                      "bold",
                    fontSize:
                      "18px"
                  }}
                >
                  Total:{" "}
                  {calcularTotalLote(
                    loteItem
                  )}
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "flex-end",
                    gap: "10px"
                  }}
                >

                  <button
                    type="button"
                    onClick={() =>
                      toggleLote(
                        loteItem.id
                      )
                    }
                    style={
                      smallButton
                    }
                  >
                    {loteItem.collapsed
                      ? "+"
                      : "-"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      eliminarLote(
                        loteItem.id
                      )
                    }
                    style={{
                      ...smallButton,
                      background:
                        "#d9534f",
                      color:
                        "#fff",
                      border:
                        "none"
                    }}
                  >
                    x
                  </button>

                </div>

              </div>

              {!loteItem.collapsed && (

                <>

                  {loteItem.clasificacion ===
                    "" && (

                    <div
                      style={{
                        padding:
                          "20px",
                        background:
                          "#fafafa",
                        border:
                          "1px dashed #ccc",
                        borderRadius:
                          "8px"
                      }}
                    >
                      Seleccione una
                      clasificación.
                    </div>

                  )}

                  {loteItem.clasificacion ===
                    "INCUBADORA" &&
                    renderTablaIncubadora(
                      loteItem
                    )}

                  {loteItem.clasificacion ===
                    "COMERCIAL" &&
                    renderTablaComercial(
                      loteItem
                    )}

                </>

              )}

            </div>

          )
        )}

      </div>

      <button
        onClick={guardar}
        style={{
          marginTop: "20px"
        }}
      >
        Registrar Egreso
      </button>

    </div>

  );

}

export default EgresoHuevos;
