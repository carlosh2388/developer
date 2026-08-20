import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useReferenceValues } from "../hooks/useOperationalCatalogs";
import ConfigRecordsTable from "../components/ConfigRecordsTable";
import { useCatalogList } from "../hooks/useCatalogList";
import CancelEditButton from "../components/CancelEditButton";
import InlineAddActions from "../components/InlineAddActions";
import { confirmAction } from "../services/notifications";

function Lotes() {
  const referencias = useReferenceValues(["CURRENCY"]);
  const list = useCatalogList("/lotes");
  // =========================
  // STATES
  // =========================

  const [lote, setLote] = useState("");
  const [fecha, setFecha] = useState("");

  const [lineas, setLineas] = useState([]);
  const [lotesDisponibles, setLotesDisponibles] = useState([]);

  const [galeras, setGaleras] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [linea, setLinea] = useState("");
  const [galera, setGalera] = useState("");

  // PROVEEDOR Y ORIGEN
  const [proveedor, setProveedor] = useState("");
  const [origen, setOrigen] = useState("");

  const [nuevaGalera, setNuevaGalera] = useState("");
  const [mostrarNuevaGalera, setMostrarNuevaGalera] = useState(false);

  const [hembras, setHembras] = useState(0);
  const [machos, setMachos] = useState(0);
  const [cantidadImportada, setCantidadImportada] = useState(0);

  // COSTOS
  const [costoUnitario, setCostoUnitario] = useState(0);
  const [costoTotal, setCostoTotal] = useState(0);
  const [moneda, setMoneda] = useState("GTQ");

  const [estado, setEstado] = useState("Activo");
  const [editingId, setEditingId] = useState(null);
  const cancelarEdicion = () => { setEditingId(null); setLote(""); setLinea(""); setGalera(""); setProveedor(""); setOrigen(""); setHembras(0); setMachos(0); setCostoUnitario(0); setMoneda("GTQ"); setEstado("Activo"); setNuevaGalera(""); setMostrarNuevaGalera(false); setFechaActual(); };

  // =========================
  // FECHA ACTUAL
  // =========================

  const setFechaActual = () => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    setFecha(today);
  };

  // =========================
  // AGREGAR GALERA
  // =========================

  const agregarGalera = async () => {
    if (!nuevaGalera.trim()) return;
    try {
      const nueva = await api("/galeras", { method: "POST", body: JSON.stringify({
        nombre: nuevaGalera.trim(), estado: "ACTIVE",
      }) });
      setGaleras((current) => [...current, nueva].sort((a, b) =>
        String(a.name || a).localeCompare(String(b.name || b), "es", { numeric: true })
      ));
      setGalera(nueva.id); setNuevaGalera(""); setMostrarNuevaGalera(false);
    } catch (error) { alert(error.message); }
  };

  // =========================
  // CÁLCULOS
  // =========================

  useEffect(() => {
    const total =
      Number(hembras) + Number(machos);

    setCantidadImportada(total);

    setCostoTotal(
      total * Number(costoUnitario || 0)
    );
  }, [hembras, machos, costoUnitario]);

  // =========================
  // INIT
  // =========================

  useEffect(() => {
    setFechaActual();
    Promise.allSettled([api("/lineas-avicolas"), api("/galeras"), api("/proveedores"), api("/lotes/siguientes")])
      .then(([lines, houses, suppliers, nextFlocks]) => {
        if (lines.status === "fulfilled") setLineas([...lines.value].sort((a, b) => String(a.name || a.code || "").localeCompare(String(b.name || b.code || ""), "es", { sensitivity: "base", numeric: true })));
        if (houses.status === "fulfilled") setGaleras([...houses.value].sort((a, b) =>
          String(a.name || a).localeCompare(String(b.name || b), "es", { numeric: true })
        ));
        if (suppliers.status === "fulfilled") setProveedores([...suppliers.value].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es", { sensitivity: "base", numeric: true })));
        if (nextFlocks.status === "fulfilled") setLotesDisponibles(nextFlocks.value);
        const failed = [lines, houses, suppliers, nextFlocks].find((result) => result.status === "rejected");
        if (failed) alert(failed.reason.message);
      });
  }, []);

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!linea) throw new Error("Selecciona primero una línea avícola.");
      if (!lote) throw new Error("No se pudo obtener el siguiente correlativo para la línea seleccionada.");
      const saved = await api(editingId ? `/lotes/${editingId}` : "/lotes", { method: editingId ? "PUT" : "POST", body: JSON.stringify({ ...(editingId ? { codigo: lote } : {}), fechaRecepcion: fecha,
        lineaAvicolaId: linea, galeraId: galera || undefined, proveedorId: proveedor || undefined, paisOrigen: origen,
        cantidadHembras: Number(hembras), cantidadMachos: Number(machos), costoUnitario: Number(costoUnitario),
        moneda, estado: estado === "Activo" ? "ACTIVE" : "INACTIVE" }) });
      alert(`Lote ${saved.code} guardado correctamente`);
      setLote("");
      setLinea("");
      setGalera("");
      setProveedor("");
      setOrigen("");
      setHembras(0);
      setMachos(0);
      setCostoUnitario(0);
      setMoneda("GTQ");
      setEstado("Activo");
      setNuevaGalera("");
      setMostrarNuevaGalera(false);
      setFechaActual();
      setEditingId(null);
      const [, nextFlocks] = await Promise.all([list.reload(), api("/lotes/siguientes")]);
      setLotesDisponibles(nextFlocks);
    } catch (error) { alert(error.message); }
  };

  const seleccionarLinea = (lineId) => {
    setLinea(lineId);
    if (editingId) return;
    const siguiente = lotesDisponibles.find((item) => item.poultryLineId === lineId);
    setLote(siguiente?.code || "");
  };

  // =========================
  // ESTILOS
  // =========================

  const styles = {
    form: {
      position: "relative",
      maxWidth: "1100px",
      margin: "0 auto",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      fontFamily: "Arial"
    },

    row: {
      display: "flex",
      gap: "15px",
      width: "100%",
      alignItems: "flex-end"
    },

    field: {
      flex: 1,
      display: "flex",
      flexDirection: "column"
    },

    input: {
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      fontSize: "14px",
      width: "100%",
      boxSizing: "border-box"
    },

    button: {
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      backgroundColor: "#1976d2",
      color: "#fff",
      cursor: "pointer",
      fontSize: "14px"
    },

    addButton: {
      width: "42px",
      height: "42px",
      border: "none",
      borderRadius: "5px",
      backgroundColor: "#1976d2",
      color: "#fff",
      cursor: "pointer",
      fontSize: "20px",
      fontWeight: "bold",
      flexShrink: 0
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Registro de Lotes</h2>

      {/* LÍNEA - LOTE - FECHA - ESTADO */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label>Línea</label>
          <select
            value={linea}
            disabled={Boolean(editingId)}
            onChange={(e) => seleccionarLinea(e.target.value)}
            style={styles.input}
          >
            <option value="">Seleccione</option>
            {lineas.filter((v) => editingId || v.status === "ACTIVE").map((v) => (
              <option key={v.id} value={v.id}>
                {v.code} - {v.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label># Lote</label>
          <input
            value={lote}
            readOnly={!editingId}
            onChange={(e) => setLote(e.target.value.toUpperCase())}
            placeholder="Seleccione primero la línea"
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            style={styles.input}
          >
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
        </div>
      </div>

      {/* GALERA */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label>Galera</label>

          <div style={styles.row}>
            <select
              value={galera}
              onChange={(e) => setGalera(e.target.value)}
              style={styles.input}
            >
              <option value="">Seleccione</option>

              {galeras.map((g) => (
                <option key={g.id || g} value={g.id || g}>
                  {g.name || g}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setMostrarNuevaGalera(true)}
              style={styles.addButton}
            >
              +
            </button>
          </div>
          {mostrarNuevaGalera && (
            <div className="inline-add-row">
              <input value={nuevaGalera} onChange={(e) => setNuevaGalera(e.target.value)}
                style={styles.input} placeholder="Nueva galera" />
              <InlineAddActions onSave={agregarGalera} onCancel={() => { setMostrarNuevaGalera(false); setNuevaGalera(""); }} />
            </div>
          )}
        </div>
      </div>

      {/* PROVEEDOR Y ORIGEN */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label>Proveedor</label>

          <select
            value={proveedor}
            onChange={(e) =>
              setProveedor(e.target.value)
            }
            style={styles.input}
          >
            <option value="">Seleccione</option>
            {proveedores.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}
          </select>
        </div>

        <div style={styles.field}>
          <label>Origen</label>

          <select
            value={origen}
            onChange={(e) =>
              setOrigen(e.target.value)
            }
            style={styles.input}
          >
            <option value="">Seleccione</option>
            <option value="Estados Unidos">
              Estados Unidos
            </option>
            <option value="Canada">Canada</option>
            <option value="Mexico">Mexico</option>
          </select>
        </div>
      </div>

      {/* HEMBRAS MACHOS */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label>Cantidad Hembras</label>

          <input
            type="number"
            value={hembras}
            onChange={(e) =>
              setHembras(e.target.value)
            }
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Cantidad Machos</label>

          <input
            type="number"
            value={machos}
            onChange={(e) =>
              setMachos(e.target.value)
            }
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Total Importado</label>

          <input
            value={cantidadImportada}
            readOnly
            style={styles.input}
          />
        </div>
      </div>

      {/* COSTOS */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label>Costo Unitario</label>

          <input
            type="number"
            step="0.01"
            value={costoUnitario}
            onChange={(e) =>
              setCostoUnitario(e.target.value)
            }
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Costo Total</label>

          <input
            value={Number(costoTotal).toFixed(2)}
            readOnly
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Moneda</label>

          <select
            value={moneda}
            onChange={(e) =>
              setMoneda(e.target.value)
            }
            style={styles.input}
          >
            <option value="">Seleccione</option>
            {(referencias.CURRENCY || []).map((item) => <option key={item.valueCode} value={item.valueCode}>{item.label}</option>)}
          </select>
        </div>
      </div>

      <div className="edit-actions"><button
        type="submit"
        style={styles.button}
      >
        {editingId ? "Guardar cambios" : "Guardar"}
      </button><CancelEditButton editing={editingId} onCancel={cancelarEdicion}/></div>
      <ConfigRecordsTable title="Lotes registrados" rows={list.rows} loading={list.loading} error={list.error} dateField="receivedOn" columns={[
        { key: "code", label: "Lote" }, { key: "receivedOn", label: "Recepción" }, { key: "originCountry", label: "Origen" },
        { key: "femaleCount", label: "Hembras" }, { key: "maleCount", label: "Machos" }, { key: "unitCost", label: "Costo unitario" },
        { key: "currencyCode", label: "Moneda" }, { key: "status", label: "Estado" },
      ]} onEdit={(row) => {
        setEditingId(row.id); setLote(row.code); setFecha(row.receivedOn?.slice(0, 10) || ""); setLinea(row.poultryLineId || "");
        setGalera(row.houseId || ""); setProveedor(row.supplierId || ""); setOrigen(row.originCountry || "");
        setHembras(row.femaleCount || 0); setMachos(row.maleCount || 0); setCostoUnitario(row.unitCost || 0);
        setMoneda(row.currencyCode || "GTQ"); setEstado(row.status === "INACTIVE" ? "Inactivo" : "Activo");
      }} onDeactivate={async (row) => {
        if (!(await confirmAction(`¿Deseas dar de baja el lote ${row.code}?`, { title: "Dar de baja lote", confirmLabel: "Sí, dar de baja" }))) return;
        try { await api(`/lotes/${row.id}`, { method: "PUT", body: JSON.stringify({ estado: "INACTIVE" }) }); await list.reload(); alert("Lote dado de baja correctamente."); }
        catch (error) { alert(error.message); }
      }}/>
    </form>
  );
}

export default Lotes;
