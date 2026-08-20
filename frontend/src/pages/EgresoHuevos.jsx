import { useEffect, useState } from "react";
import { eggGradeCode, eggGradeLabel, eggPackageDetail, post, saveOperation } from "../services/operations";
import { api } from "../services/api";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";
import OperationRecordsModal from "../components/OperationRecordsModal";
import OperationPanel from "../components/OperationPanel";
import CancelEditButton from "../components/CancelEditButton";
import InlineAddActions from "../components/InlineAddActions";

function EgresoHuevos() {
  const { bodegas, localidades, opciones } = useOperationalCatalogs(["lotes", "personal", "vehiculos", "bodegas", "localidades"]);

  // =====================================================
  // DATOS GENERALES
  // =====================================================

  const [egreso, setEgreso] = useState("");

  const cargarSiguienteEnvio = () => api("/huevos/envios/siguiente")
    .then((data) => setEgreso(data.shipmentNumber))
    .catch((error) => alert(error.message));

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

  const [localidadSalida, setLocalidadSalida] = useState("");
  const [localidadDestino, setLocalidadDestino] = useState("");

  const localidadesActivas = localidades.filter((item) => item.status !== "INACTIVE");
  const bodegasSalida = bodegas.filter((item) => item.status !== "INACTIVE" && String(item.locationId) === String(localidadSalida));
  const bodegasDestino = bodegas.filter((item) => item.status !== "INACTIVE" && String(item.locationId) === String(localidadDestino));

  // =====================================================
  // PLACAS
  // =====================================================

  const [placa, setPlaca] = useState("");

  const [nuevaPlaca, setNuevaPlaca] =
    useState("");

  const [mostrarNuevaPlaca,
    setMostrarNuevaPlaca] = useState(false);

  const [placasNuevas, setPlacasNuevas] = useState([]);
  const placas = [...opciones("vehiculos", "plate", "plate").map((x) => x.value), ...placasNuevas];

  // =====================================================
  // PILOTOS
  // =====================================================

  const [piloto, setPiloto] = useState("");

  const [nuevoPiloto, setNuevoPiloto] =
    useState("");

  const [mostrarNuevoPiloto,
    setMostrarNuevoPiloto] = useState(false);

  const [pilotosNuevos, setPilotosNuevos] = useState([]);
  const pilotos = [...opciones("personal", "id", "fullName").map((x) => x.label), ...pilotosNuevos];

  // =====================================================
  // LOTES DISPONIBLES
  // =====================================================

  const lotesDisponibles = opciones("lotes").map((x) => x.value);

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
  cajaC360: 0,
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
    codigo = ""
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
  const [editingId, setEditingId] = useState(null);
  const cargarEdicion = async (row) => { try { const data = await api(`/huevos/movimientos/${row.id}`); const editLots = data.detalles.map((item) => { const classification = item.grade_code.startsWith("INC_") ? "Incubable" : "Comercial"; const lot = crearLote(item.flock_code); lot.clasificacion = classification; const target = classification === "Comercial" ? lot.comercial : lot.incubadora; target[eggGradeLabel(item.grade_code)] = { existencias: item.existing_units, cajaBandejas336: item.boxes_trays_336, cajaCartones360: item.boxes_cartons_360, cajaC360: item.boxes_cartons_360, bandeja84: item.trays_84, carton30: item.cartons_30, unidades: item.loose_units }; return lot; }); setEditingId(row.id); setFecha(String(data.movement_date).slice(0, 10)); setHora(String(data.movement_time || "").slice(0, 5)); setFechaProduccion(String(data.production_date || "").slice(0, 10)); setEgreso(data.shipment_number || ""); setBodegaSalida(data.source_warehouse_code || ""); setBodegaDestino(data.destination_warehouse_code || data.destination_name || ""); setPlaca(data.vehicle_plate || ""); setPiloto(data.driver_name || ""); setLotes(editLots); } catch (error) { alert(error.message); } };

  useEffect(() => { cargarSiguienteEnvio(); }, []);

  useEffect(() => {
    const selected = bodegas.find((item) => item.code === bodegaSalida || item.id === bodegaSalida);
    if (selected?.locationId) setLocalidadSalida(String(selected.locationId));
  }, [bodegas, bodegaSalida]);

  useEffect(() => {
    const selected = bodegas.find((item) => item.code === bodegaDestino || item.id === bodegaDestino);
    if (selected?.locationId) setLocalidadDestino(String(selected.locationId));
  }, [bodegas, bodegaDestino]);

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

  // El catálogo llega después del primer render. Se debe guardar en el estado
  // el mismo lote que el select muestra visualmente.
  useEffect(() => {
    if (!lotesDisponibles.length) return;
    setLotes((actuales) => actuales.map((item) =>
      lotesDisponibles.includes(item.lote) ? item : { ...item, lote: lotesDisponibles[0] }
    ));
  }, [lotesDisponibles.join("|")]);

  // =====================================================
  // CAMBIAR LOTE
  // =====================================================

  const cargarExistencias = async (id, codigoLote, clasificacion) => {
    if (!codigoLote || !clasificacion) return;
    try {
      const saldos = await api(`/huevos/existencias?lote=${encodeURIComponent(codigoLote)}`);
      setLotes((actuales) => actuales.map((item) => {
        if (item.id !== id) return item;
        const campo = clasificacion === "Comercial" ? "comercial" : "incubadora";
        const actualizado = { ...item[campo] };
        Object.keys(actualizado).forEach((calidad) => {
          const codigo = eggGradeCode(calidad, clasificacion);
          const saldo = saldos.find((registro) => registro.grade_code === codigo);
          actualizado[calidad] = { ...actualizado[calidad], existencias: Number(saldo?.available_units || 0) };
        });
        return { ...item, [campo]: actualizado };
      }));
    } catch (error) { alert(`No fue posible consultar las existencias: ${error.message}`); }
  };

  const handleLote = (
    id,
    value
  ) => {

    const actual = lotes.find((item) => item.id === id);
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
    cargarExistencias(id, value, actual?.clasificacion);
  };

  // =====================================================
  // CAMBIAR CLASIFICACION
  // =====================================================

  const handleClasificacion = (
    id,
    value
  ) => {

    const actual = lotes.find((item) => item.id === id);
    const codigoLote = lotesDisponibles.includes(actual?.lote) ? actual.lote : (lotesDisponibles[0] || "");
    setLotes(prev =>
      prev.map(l =>
        l.id === id
          ? {
              ...l,
              lote: codigoLote,
              clasificacion: value
            }
          : l
      )
    );
    cargarExistencias(id, codigoLote, value);
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
        filaData.cajaB336
      ) || 0) * 336 +

      (parseInt(
        filaData.cajaC360
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
        filaData.cajaC360
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
        "Incubable"
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
        "Comercial"
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
const calcularSubTotal = (
  lote,
  filtro
) => {

  const origen =
    lote.clasificacion ===
    "Incubable"
      ? lote.incubadora
      : lote.comercial;

  let total = 0;

  Object.keys(origen).forEach(
    (key) => {

      if (
        key.includes(filtro)
      ) {

        total +=
          lote.clasificacion ===
          "Incubable"

            ? totalFilaIncubadora(
                origen[key]
              )

            : totalFilaComercial(
                origen[key]
              );
      }

    }
  );

  return total;
};
  // =====================================================
  // AGREGAR PLACA
  // =====================================================

  const agregarPlaca = async () => {

    if (!nuevaPlaca.trim())
      return;

    try { await post("/vehiculos", { placa: nuevaPlaca, estado: "ACTIVE" }); }
    catch (error) { alert(error.message); return; }
    setPlacasNuevas((current) => [...current, nuevaPlaca]);

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

  const agregarPiloto = async () => {

    if (
      !nuevoPiloto.trim()
    ) return;

    try { await post("/personal", { codigo: `PIL-${Date.now().toString().slice(-6)}`, nombreCompleto: nuevoPiloto, roles: ["DRIVER"] }); }
    catch (error) { alert(error.message); return; }
    setPilotosNuevos((current) => [...current, nuevoPiloto]);

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

  const guardar = async () => {
    try {
      const detalles = lotes.flatMap((item) => {
        const source = item.clasificacion === "Comercial" ? item.comercial : item.incubadora;
        return Object.entries(source || {}).map(([calidad, datos]) => ({
          lote: item.lote, clasificacion: eggGradeCode(calidad, item.clasificacion),
          ...eggPackageDetail(datos),
        })).filter((d) => d.cajasBandejas336 + d.cajasCartones360 + d.bandejas84 + d.cartones30 + d.unidades > 0);
      });
      await saveOperation("/huevos/movimientos", { tipoMovimiento: "OUTPUT", fecha, hora, fechaProduccion,
        bodegaOrigen: bodegaSalida || undefined, bodegaDestino: bodegaDestino || undefined,
        nombreDestino: bodegaDestino || undefined, placa: placa || undefined,
        piloto: piloto || undefined, detalles }, editingId);
      alert(editingId ? "Egreso actualizado correctamente" : `Egreso ${egreso} registrado correctamente`);
      const now = new Date();
      setFecha(now.toISOString().split("T")[0]); setHora(now.toTimeString().slice(0, 5));
      setFechaProduccion(now.toISOString().split("T")[0]); setLocalidadSalida(""); setBodegaSalida(""); setLocalidadDestino(""); setBodegaDestino("");
      setPlaca(""); setNuevaPlaca(""); setMostrarNuevaPlaca(false);
      setPiloto(""); setNuevoPiloto(""); setMostrarNuevoPiloto(false);
      setLotes([crearLote()]); setEditingId(null);
      await cargarSiguienteEnvio();
    } catch (error) { alert(error.message); }
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
                        readOnly
                        aria-label={`Existencia disponible de ${fila}`}
                      />

                    </td>

                    <td>

                      <input
                        type="number"
                        value={
                          row.cajaB336
                        }
                        onChange={(
                          e
                        ) =>
                          handleIncubadora(
                            lote.id,
                            fila,
                            "cajaB336",
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
                          row.cajaC360
                        }
                        onChange={(
                          e
                        ) =>
                          handleIncubadora(
                            lote.id,
                            fila,
                            "cajaC360",
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
                        readOnly
                        aria-label={`Existencia disponible de ${fila}`}
                      />

                    </td>

                    <td>

                      <input
                        type="number"
                        value={
                          row.cajaC360
                        }
                        onChange={(
                          e
                        ) =>
                          handleComercial(
                            lote.id,
                            fila,
                            "cajaC360",
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

  return (<OperationPanel><OperationRecordsModal title="Egresos de huevos" path="/huevos/movimientos" annulPath={(row) => `/operaciones/huevos/${row.id}/anular`} dateField="movement_date" columns={[
    { key: "movement_number", label: "Movimiento" }, { key: "movement_date", label: "Fecha" }, { key: "production_date", label: "Producción" }, { key: "destination_name", label: "Destino" }, { key: "status", label: "Estado" },
  ]} rowFilter={(row) => row.movement_type === "OUTPUT"} onEdit={cargarEdicion}/>

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
            readOnly
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

      {/* LOCALIDAD Y BODEGA DE SALIDA */}

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

        <div>
          <label>Localidad Salida</label>
          <select
            value={localidadSalida}
            onChange={(e) => { setLocalidadSalida(e.target.value); setBodegaSalida(""); }}
          >
            <option value="">Seleccione</option>
            {localidadesActivas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>

        <div>
          <label>Bodega Salida</label>
          <select value={bodegaSalida} onChange={(e) => setBodegaSalida(e.target.value)} disabled={!localidadSalida}>
            <option value="">Seleccione</option>
            {bodegasSalida.map((item) => <option key={item.id} value={item.code}>{item.name}</option>)}
          </select>
        </div>

      </div>

      {/* LOCALIDAD Y BODEGA DE DESTINO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
          marginTop: "10px"
        }}
      >
        <div>
          <label>Localidad Destino</label>
          <select
            value={localidadDestino}
            onChange={(e) => { setLocalidadDestino(e.target.value); setBodegaDestino(""); }}
          >
            <option value="">Seleccione</option>
            {localidadesActivas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>

        <div>
          <label>Bodega Destino</label>
          <select value={bodegaDestino} onChange={(e) => setBodegaDestino(e.target.value)} disabled={!localidadDestino}>
            <option value="">Seleccione</option>
            {bodegasDestino.map((item) => <option key={item.id} value={item.code}>{item.name}</option>)}
          </select>
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

              <InlineAddActions onSave={agregarPlaca} onCancel={() => { setMostrarNuevaPlaca(false); setNuevaPlaca(""); }} />

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

              <InlineAddActions onSave={agregarPiloto} onCancel={() => { setMostrarNuevoPiloto(false); setNuevoPiloto(""); }} />

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
                    <option value="">Seleccione</option>
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

<option value="Incubable">
  Incubable
</option>

<option value="Comercial">
  Comercial
</option>

                  </select>

                </div>

<div
  style={{
    display: "flex",
    gap: "20px",
    alignItems: "center"
  }}
>
  <div
    style={{
      fontWeight: "bold",
      fontSize: "18px"
    }}
  >
    Total:
    {calcularTotalLote(
      loteItem
    )}
  </div>

  {loteItem.clasificacion ===
    "Comercial" && (
    <>
      <div>
        Nido:
        {calcularSubTotal(
          loteItem,
          "(Nido)"
        )}
      </div>

      <div>
        Piso:
        {calcularSubTotal(
          loteItem,
          "(Piso)"
        )}
      </div>
    </>
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
                    "Incubable" &&
                    renderTablaIncubadora(
                      loteItem
                    )}

                  {loteItem.clasificacion ===
                    "Comercial" &&
                    renderTablaComercial(
                      loteItem
                    )}

                </>

              )}

              <div
  style={{
    marginTop: "10px",
    fontWeight: "bold"
  }}
>
  Otros = Pruebas, Lijado, Deforme y Traslúcido
</div>
            </div>

          )
        )}

      </div>

      <div className="edit-actions"><button onClick={guardar}>
        {editingId ? "Guardar cambios" : "Registrar Egreso"}
      </button><CancelEditButton editing={editingId} onCancel={() => { const now = new Date(); setEditingId(null); setFecha(now.toISOString().split("T")[0]); setHora(now.toTimeString().slice(0, 5)); setFechaProduccion(now.toISOString().split("T")[0]); setLocalidadSalida(""); setBodegaSalida(""); setLocalidadDestino(""); setBodegaDestino(""); setPlaca(""); setPiloto(""); setLotes([crearLote()]); cargarSiguienteEnvio(); }}/></div>

    </div>

  </OperationPanel>);

}

export default EgresoHuevos;
