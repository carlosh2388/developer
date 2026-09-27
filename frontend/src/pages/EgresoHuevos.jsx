import { useEffect, useRef, useState } from "react";
import { eggGradeCode, eggGradeLabel, eggPackageDetail, post, saveOperation } from "../services/operations";
import { api } from "../services/api";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";
import OperationRecordsModal, { compareMovementDesc } from "../components/OperationRecordsModal";
import OperationPanel from "../components/OperationPanel";
import CancelEditButton from "../components/CancelEditButton";
import InlineAddActions from "../components/InlineAddActions";

const nonNegativeInteger = (value) => {
  const text = String(value ?? "");
  if (!/^\d*$/.test(text)) return null;
  return text === "" ? "" : Number(text);
};

const normalizedName = (value) => String(value || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

const eggWarehouseClassification = (warehouse) => {
  const name = normalizedName(`${warehouse?.code || ""} ${warehouse?.name || ""}`);
  if (name.includes("HUEVO COMERCIAL")) return "Comercial";
  if (name.includes("HUEVO INCUBABLE")) return "Incubable";
  return "";
};

function EgresoHuevos() {
  const { bodegas, clientes, localidades, opciones } = useOperationalCatalogs(["lotes", "personal", "vehiculos", "bodegas", "clientes", "localidades"]);

  // =====================================================
  // DATOS GENERALES
  // =====================================================

  const [egreso, setEgreso] = useState("");
  const [inventarioDisponible, setInventarioDisponible] = useState(null);
  const alertaInventarioMostrada = useRef(false);

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

  const [localidadSalida, setLocalidadSalida] =
    useState("");

  const [localidadDestino, setLocalidadDestino] =
    useState("");

  const [bodegaSalida, setBodegaSalida] =
    useState("");

  const [bodegaDestino, setBodegaDestino] =
    useState("");

  const esBodegaHuevos = (item) => Boolean(eggWarehouseClassification(item));
  const esLocalidad = (item, name) => normalizedName(item?.name).includes(normalizedName(name));
  const localidadesSalida = localidades
    .filter((item) => item.status !== "INACTIVE" && !esLocalidad(item, "Incubadora"))
    .sort((left, right) => String(left.name || "").localeCompare(String(right.name || ""), "es", { sensitivity: "base", numeric: true }));
  const localidadesDestino = localidades
    .filter((item) => item.status !== "INACTIVE" && !esLocalidad(item, "Granja"))
    .sort((left, right) => String(left.name || "").localeCompare(String(right.name || ""), "es", { sensitivity: "base", numeric: true }));
  const bodegasSalida = bodegas.filter((item) => item.status !== "INACTIVE"
    && esBodegaHuevos(item) && (!localidadSalida || String(item.locationId) === String(localidadSalida)));
  const bodegasDestino = bodegas.filter((item) => item.status !== "INACTIVE"
    && esBodegaHuevos(item) && (!localidadDestino || String(item.locationId) === String(localidadDestino)));
  const bodegaSalidaSeleccionada = bodegas.find((item) => item.code === bodegaSalida || item.id === bodegaSalida);
  const clasificacionForzada = eggWarehouseClassification(bodegaSalidaSeleccionada);
  const clientesDestino = clientes
    .filter((item) => item.status !== "INACTIVE")
    .sort((left, right) => String(left.commercialName || "").localeCompare(String(right.commercialName || ""), "es", { sensitivity: "base", numeric: true }));

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
    "Bueno (Piso)",
    "Mixto"
  ];

  // =====================================================
  // CREAR FILA INCUBADORA
  // =====================================================

const crearFilaIncubadora = () => ({
  existencias: 0,
  cajaB336: 0,
  cajaC360: 0,
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

    clasificacion: clasificacionForzada || "",

    color: "",

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
  const cargarEdicion = async (row) => { try {
    const data = await api(`/huevos/movimientos/${row.id}`);
    const grouped = new Map();
    data.detalles.forEach((item) => {
      const classification = item.grade_code.startsWith("INC_") ? "Incubable" : "Comercial";
      const key = classification === "Comercial" ? `Comercial|${item.color || ""}` : `${classification}|${item.flock_code}`;
      if (!grouped.has(key)) {
        const lot = crearLote(classification === "Comercial" ? "" : item.flock_code);
        lot.clasificacion = classification;
        if (classification === "Comercial") lot.color = item.color || "";
        grouped.set(key, lot);
      }
      const lot = grouped.get(key);
      const target = classification === "Comercial" ? lot.comercial : lot.incubadora;
      const quality = eggGradeLabel(item.grade_code);
      const current = target[quality] || {};
      target[quality] = {
        ...current, existencias: Number(current.existencias || 0) + Number(item.existing_units || 0),
        cajaB336: Number(current.cajaB336 || 0) + Number(item.boxes_trays_336 || 0),
        cajaC360: Number(current.cajaC360 || 0) + Number(item.boxes_cartons_360 || 0),
        bandeja84: Number(current.bandeja84 || 0) + Number(item.trays_84 || 0),
        carton30: Number(current.carton30 || 0) + Number(item.cartons_30 || 0),
        unidades: Number(current.unidades || 0) + Number(item.loose_units || 0),
      };
    });
    setEditingId(row.id); setFecha(String(data.movement_date).slice(0, 10)); setHora(String(data.movement_time || "").slice(0, 5));
    setFechaProduccion(String(data.production_date || "").slice(0, 10)); setEgreso(data.shipment_number || "");
    setBodegaSalida(data.source_warehouse_code || "");
    setLocalidadSalida(bodegas.find((item) => item.code === data.source_warehouse_code)?.locationId || "");
    if (data.customer_id) {
      setBodegaDestino(`CLIENTE:${data.customer_id}`);
      setLocalidadDestino("");
    } else {
      const destination = data.destination_warehouse_code || data.destination_name || "";
      setBodegaDestino(destination ? `BODEGA:${destination}` : "");
      setLocalidadDestino(bodegas.find((item) => item.code === destination)?.locationId || "");
    }
    setPlaca(data.vehicle_plate || ""); setPiloto(data.driver_name || ""); setLotes([...grouped.values()]);
  } catch (error) { alert(error.message); } };

  useEffect(() => { cargarSiguienteEnvio(); }, []);

  const cambiarLocalidadSalida = (value) => {
    setLocalidadSalida(value);
    setBodegaSalida("");
  };

  const cambiarLocalidadDestino = (value) => {
    setLocalidadDestino(value);
    setBodegaDestino("");
  };

  useEffect(() => {
    api("/huevos/existencias/resumen").then((data) => {
      const disponible = Number(data.availableUnits || 0) > 0;
      setInventarioDisponible(disponible);
      if (!disponible && !alertaInventarioMostrada.current) {
        alertaInventarioMostrada.current = true;
        alert("Inventario insuficiente para operar egresos.");
      }
    }).catch((error) => alert(error.message));
  }, []);

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

  const cargarExistencias = async (id, codigoLote, clasificacion) => {
    if (!clasificacion || (clasificacion !== "Comercial" && !codigoLote)) return;
    try {
      const params = new URLSearchParams();
      if (clasificacion === "Comercial") params.set("clasificacion", "Comercial");
      else params.set("lote", codigoLote);
      if (bodegaSalida) params.set("bodega", bodegaSalida);
      const query = params.toString();
      const saldos = await api(`/huevos/existencias?${query}`);
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
    const codigoLote = value === "Comercial" ? "" : (lotesDisponibles.includes(actual?.lote) ? actual.lote : "");
    setLotes(prev =>
      prev.map(l =>
        l.id === id
          ? {
              ...l,
              lote: codigoLote,
              clasificacion: value,
              color: value === "Comercial" ? l.color : ""
            }
          : l
      )
    );
    cargarExistencias(id, codigoLote, value);
  };

  useEffect(() => {
    if (!clasificacionForzada) return;
    setLotes((actuales) => {
      const actualizados = actuales.map((item) => ({
        ...item,
        clasificacion: clasificacionForzada,
        lote: clasificacionForzada === "Comercial" ? "" : item.lote,
        color: clasificacionForzada === "Comercial" ? item.color : "",
      }));
      return clasificacionForzada === "Comercial" ? actualizados.slice(0, 1) : actualizados;
    });
    (clasificacionForzada === "Comercial" ? lotes.slice(0, 1) : lotes).forEach((item) => cargarExistencias(
      item.id,
      clasificacionForzada === "Comercial" ? "" : item.lote,
      clasificacionForzada
    ));
  }, [clasificacionForzada]);

  useEffect(() => {
    lotes.forEach((item) => cargarExistencias(
      item.id,
      item.clasificacion === "Comercial" ? "" : item.lote,
      item.clasificacion
    ));
  }, [bodegaSalida]);

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
    const quantity = nonNegativeInteger(value);
    if (quantity === null) return;

    setLotes(prev =>
      prev.map(l =>

        l.id === loteId

          ? {
              ...l,

              incubadora: {
                ...l.incubadora,

                [fila]: {
                  ...l.incubadora[fila],

                  [campo]: quantity
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
    const quantity = nonNegativeInteger(value);
    if (quantity === null) return;
    setLotes(prev =>
      prev.map(l =>

        l.id === loteId

          ? {
              ...l,

              comercial: {
                ...l.comercial,

                [fila]: {
                  ...l.comercial[fila],

                  [campo]: quantity
                }
              }
            }

          : l
      )
    );
  };

  const handleColorComercial = (loteId, value) => {
    setLotes((prev) => prev.map((lote) => lote.id === loteId ? { ...lote, color: value } : lote));
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
      if (inventarioDisponible === false) {
        alert("Inventario insuficiente para operar egresos.");
        return;
      }
      if (!localidadSalida) throw new Error("Selecciona la localidad de salida.");
      if (!bodegaSalida) throw new Error("Selecciona la bodega de salida para validar las existencias.");
      if (lotes.some((item) => !item.clasificacion)) throw new Error("Selecciona la clasificación.");
      if (lotes.some((item) => item.clasificacion === "Incubable" && !item.lote)) throw new Error("Selecciona el lote para la clasificación Incubable.");
      if (lotes.some((item) => item.clasificacion === "Comercial" && !item.color)) throw new Error("Selecciona el color para la clasificación Comercial.");
      const detalles = lotes.flatMap((item) => {
        const source = item.clasificacion === "Comercial" ? item.comercial : item.incubadora;
        return Object.entries(source || {}).map(([calidad, datos]) => ({
          lote: item.clasificacion === "Comercial" ? undefined : item.lote, clasificacion: eggGradeCode(calidad, item.clasificacion),
          color: item.clasificacion === "Comercial" ? item.color : undefined,
          ...eggPackageDetail(datos),
        })).filter((d) => d.cajasBandejas336 + d.cajasCartones360 + d.bandejas84 + d.cartones30 + d.unidades > 0);
      });
      const destinoCliente = bodegaDestino.startsWith("CLIENTE:");
      const destinoBodega = bodegaDestino.startsWith("BODEGA:") ? bodegaDestino.slice("BODEGA:".length) : "";
      const clienteDestino = destinoCliente ? bodegaDestino.slice("CLIENTE:".length) : "";
      const bodegaDestinoSeleccionada = bodegasDestino.find((item) => item.code === destinoBodega || item.id === destinoBodega);
      const destinoClass = eggWarehouseClassification(bodegaDestinoSeleccionada);
      const tipoDestino = destinoCliente ? "CUSTOMER" : destinoClass === "Incubable" ? "INCUBATOR" : destinoClass === "Comercial" ? "FARM" : "OTHER";
      await saveOperation("/huevos/movimientos", { tipoMovimiento: "OUTPUT", fecha, hora, fechaProduccion,
        bodegaOrigen: bodegaSalida || undefined,
        bodegaDestino: destinoCliente ? undefined : (destinoBodega || undefined),
        clienteId: destinoCliente ? (clienteDestino || undefined) : undefined,
        tipoDestino,
        nombreDestino: destinoCliente
          ? clientesDestino.find((item) => String(item.id) === String(clienteDestino))?.commercialName
          : (destinoBodega || undefined),
        placa: placa || undefined,
        piloto: piloto || undefined, detalles }, editingId);
      alert(editingId ? "Egreso actualizado correctamente" : `Egreso ${egreso} registrado correctamente`);
      const now = new Date();
      setFecha(now.toISOString().split("T")[0]); setHora(now.toTimeString().slice(0, 5));
      setFechaProduccion(now.toISOString().split("T")[0]); setLocalidadSalida(""); setBodegaSalida(""); setLocalidadDestino(""); setBodegaDestino("");
      setPlaca(""); setNuevaPlaca(""); setMostrarNuevaPlaca(false);
      setPiloto(""); setNuevoPiloto(""); setMostrarNuevoPiloto(false);
      setLotes([crearLote()]); setEditingId(null);
      await cargarSiguienteEnvio();
    } catch (error) {
      alert(error.code === "INSUFFICIENT_EGG_STOCK" ? "Inventario insuficiente para operar egresos." : error.message);
    }
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
    { key: "movement_number", label: "Movimiento" },
    { key: "movement_date", label: "Fecha", render: (value) => String(value || "").slice(0, 10) },
    { key: "production_date", label: "Produccion", render: (value) => String(value || "").slice(0, 10) },
    { key: "location_names", label: "Localidad" },
    { key: "flock_codes", label: "Lote" },
    { key: "product_ids", label: "Id producto" },
    { key: "product_codes", label: "Codigo producto" },
    { key: "egg_colors", label: "Color" },
    { key: "product_descriptions", label: "Producto" },
    { key: "destination_name", label: "Destino" },
    { key: "status", label: "Estado", render: (value) => ({ POSTED: "Registrado", VOID: "Anulado" }[value] || value) },
  ]} rowFilter={(row) => row.movement_type === "OUTPUT"} sortRows={compareMovementDesc} onEdit={cargarEdicion}/>

    <div className="form-container egg-operation-form">

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

      {/* BODEGAS */}

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
          <select value={localidadSalida} onChange={(e) => cambiarLocalidadSalida(e.target.value)}>
            <option value="">Seleccione</option>
            {localidadesSalida.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>

        <div>
          <label>Bodega Salida</label>
          <select value={bodegaSalida} onChange={(e) => setBodegaSalida(e.target.value)}>
            <option value="">Seleccione</option>
            {bodegasSalida.map((item) => <option key={item.id} value={item.code}>{item.name}</option>)}
          </select>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 2fr",
          gap: "10px",
          marginTop: "10px"
        }}
      >
        <div>
          <label>Localidad Destino</label>
          <select value={localidadDestino} onChange={(e) => cambiarLocalidadDestino(e.target.value)}>
            <option value="">Seleccione</option>
            {localidadesDestino.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>

        <div>
          <label>Bodega Destino</label>
          <select value={bodegaDestino} onChange={(e) => setBodegaDestino(e.target.value)}>
            <option value="">Seleccione</option>
            {clientesDestino.map((item) => <option key={`cliente-${item.id}`} value={`CLIENTE:${item.id}`}>Cliente - {item.commercialName}</option>)}
            {bodegasDestino.map((item) => <option key={`bodega-${item.id}`} value={`BODEGA:${item.code}`}>Bodega - {item.name}</option>)}
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

            <div className="inline-add-row">

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

            <div className="inline-add-row">

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
            Clasificación de huevos
          </h2>

          {clasificacionForzada !== "Comercial" && <button
            type="button"
            onClick={
              agregarLote
            }
            style={smallButton}
          >
            +
          </button>}

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
                    loteItem.clasificacion === "Comercial" ? "250px 180px 180px 1fr" : "250px 220px 180px 1fr",
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
                    Clasificación
                  </label>

                  <select
                    value={
                      loteItem.clasificacion
                    }
                    disabled={Boolean(clasificacionForzada)}
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
                    <option value="">Seleccione</option>

                    <option value="Incubable">Incubable</option>
                    <option value="Comercial">Comercial</option>

                  </select>

                </div>

                {loteItem.clasificacion === "Comercial" && <div>
                  <label>Color</label>
                  <select value={loteItem.color} onChange={(e) => handleColorComercial(loteItem.id, e.target.value)}>
                    <option value="">Seleccione</option>
                    <option value="Blanco">Blanco</option>
                    <option value="Rojo">Rojo</option>
                  </select>
                </div>}

                {loteItem.clasificacion !== "Comercial" && <div>

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
                    {lotesDisponibles.map((lote) => <option key={lote} value={lote}>{lote}</option>)}

                  </select>

                </div>}

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
