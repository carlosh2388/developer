import { useState } from "react";
import { api } from "../services/api";
import { useReferenceValues } from "../hooks/useOperationalCatalogs";
import ConfigRecordsTable from "../components/ConfigRecordsTable";
import { assertUniqueCode, useCatalogList } from "../hooks/useCatalogList";

function Clientes() {
  const referencias = useReferenceValues(["CUSTOMER_REGION", "CUSTOMER_CATEGORY"]);
  const list = useCatalogList("/clientes");
  // =========================
  // STATES
  // =========================

  const [codigoCliente, setCodigoCliente] = useState("");
  const [nombreComercial, setNombreComercial] = useState("");
  const [contacto, setContacto] = useState("");

  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");

  const [region, setRegion] = useState("");
  const [categoria, setCategoria] = useState("");

  const [precioCajaSuperNick, setPrecioCajaSuperNick] = useState("");
  const [precioCajaBrownNick, setPrecioCajaBrownNick] = useState("");

  const [ubicaciones, setUbicaciones] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // =========================
  // UBICACIONES
  // =========================

  const agregarUbicacion = () => {
    setUbicaciones(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        nit: "",
        razonSocial: "",
        direccionFiscal: "",
        direccionEntrega: ""
      }
    ]);
  };

  const eliminarUbicacion = (id) => {
    setUbicaciones(prev =>
      prev.filter(u => u.id !== id)
    );
  };

  const handleUbicacionChange = (id, campo, value) => {
    setUbicaciones(prev =>
      prev.map(u =>
        u.id === id ? { ...u, [campo]: value } : u
      )
    );
  };

  // =========================
  // TELÉFONO
  // =========================

  const handleTelefono = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 4) {
      value = value.slice(0, 4) + "-" + value.slice(4, 8);
    }

    setTelefono(value);
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      assertUniqueCode(list.rows, codigoCliente, "código de cliente", editingId);
      await api(editingId ? `/clientes/${editingId}` : "/clientes", { method: editingId ? "PUT" : "POST", body: JSON.stringify({
        codigo: codigoCliente, telefono, correo, contacto, nombreComercial,
        region, categoria, precioCajaSuperNick, precioCajaBrownNick, ubicaciones,
      }) });
      alert("Cliente guardado correctamente");
      setCodigoCliente(""); setNombreComercial(""); setContacto(""); setTelefono(""); setCorreo(""); setUbicaciones([]);
      setEditingId(null);
      await list.reload();
    } catch (error) { alert(error.message); }
  };

  // =========================
  // ESTILOS
  // =========================

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    marginBottom: "15px"
  };

  const doubleRowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "15px"
  };

  const priceRow = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: "10px",
    alignItems: "end",
    marginBottom: "15px"
  };

  // 🔥 NUEVO: UNA SOLA LÍNEA PARA UBICACIÓN
  const ubicacionRow = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
    gap: "8px",
    alignItems: "end",
    marginBottom: "10px"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  };

  const deleteBtn = {
    padding: "8px 10px",
    background: "#d9534f",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    height: "42px"
  };

  // =========================
  // RENDER
  // =========================

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
        position: "relative",
        fontFamily: "Arial"
      }}
    >
      <h2>Registro de Clientes</h2>

      {/* CÓDIGO + TELÉFONO + CORREO */}
      <div style={rowStyle}>
        <div>
          <label>Código de Cliente</label>
          <input
            value={codigoCliente}
            onChange={(e) =>
              setCodigoCliente(e.target.value.toUpperCase())
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label>Teléfono</label>
          <input
            value={telefono}
            onChange={handleTelefono}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* NOMBRE COMERCIAL + CONTACTO */}
      <div style={doubleRowStyle}>
        <div>
          <label>Nombre Comercial</label>
          <input
            value={nombreComercial}
            onChange={(e) => setNombreComercial(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Nombre Contacto</label>
          <input
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* REGIÓN + CATEGORÍA */}
      <div style={doubleRowStyle}>
        <div>
          <label>Región</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={inputStyle}
          >
            <option value="">Seleccione</option>
            {(referencias.CUSTOMER_REGION || []).map((item) => <option key={item.valueCode} value={item.valueCode}>{item.label}</option>)}
          </select>
        </div>

        <div>
          <label>Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            style={inputStyle}
          >
            <option value="">Seleccione</option>
            {(referencias.CUSTOMER_CATEGORY || []).map((item) => <option key={item.valueCode} value={item.valueCode}>{item.label}</option>)}
          </select>
        </div>
      </div>

      {/* PRECIOS + BOTÓN */}
      <div style={priceRow}>
        <div>
          <label>Precio Caja Super Nick</label>
          <input
            type="number"
            value={precioCajaSuperNick}
            onChange={(e) => setPrecioCajaSuperNick(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Precio Caja Brown Nick</label>
          <input
            type="number"
            value={precioCajaBrownNick}
            onChange={(e) => setPrecioCajaBrownNick(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          type="button"
          onClick={agregarUbicacion}
          style={{
            ...buttonStyle,
            height: "42px"
          }}
        >
          Agregar Ubicación
        </button>
      </div>

      {/* 🔥 UBICACIÓN EN UNA SOLA LÍNEA */}
      {ubicaciones.map((u) => (
        <div key={u.id} style={ubicacionRow}>
          <input
            placeholder="NIT"
            value={u.nit}
            onChange={(e) =>
              handleUbicacionChange(u.id, "nit", e.target.value)
            }
            style={inputStyle}
          />

          <input
            placeholder="Razón Social"
            value={u.razonSocial}
            onChange={(e) =>
              handleUbicacionChange(u.id, "razonSocial", e.target.value)
            }
            style={inputStyle}
          />

          <input
            placeholder="Dirección Fiscal"
            value={u.direccionFiscal}
            onChange={(e) =>
              handleUbicacionChange(u.id, "direccionFiscal", e.target.value)
            }
            style={inputStyle}
          />

          <input
            placeholder="Dirección de Entrega"
            value={u.direccionEntrega}
            onChange={(e) =>
              handleUbicacionChange(u.id, "direccionEntrega", e.target.value)
            }
            style={inputStyle}
          />

          <button
            type="button"
            onClick={() => eliminarUbicacion(u.id)}
            style={deleteBtn}
          >
            X
          </button>
        </div>
      ))}

      {/* GUARDAR */}
      <button type="submit" style={buttonStyle}>
        {editingId ? "Guardar cambios" : "Guardar"}
      </button>
      <ConfigRecordsTable title="Clientes registrados" rows={list.rows} loading={list.loading} error={list.error} columns={[
        { key: "code", label: "Código" }, { key: "commercialName", label: "Cliente" }, { key: "contactName", label: "Contacto" },
        { key: "phone", label: "Teléfono" }, { key: "email", label: "Correo" }, { key: "regionCode", label: "Región" },
        { key: "categoryCode", label: "Categoría" }, { key: "status", label: "Estado" },
      ]} onEdit={(row) => {
        setEditingId(row.id); setCodigoCliente(row.code); setNombreComercial(row.commercialName); setContacto(row.contactName || "");
        setTelefono(row.phone || ""); setCorreo(row.email || ""); setRegion(row.regionCode || ""); setCategoria(row.categoryCode || "");
        setPrecioCajaSuperNick(row.superNickBoxPrice || ""); setPrecioCajaBrownNick(row.brownNickBoxPrice || "");
        setUbicaciones((row.addresses || []).map((item) => ({ id: item.id, nit: item.tax_id || "", razonSocial: item.legal_name || "", direccionFiscal: item.fiscal_address || "", direccionEntrega: item.delivery_address || "" })));
      }} onDeactivate={async (row) => {
        if (!window.confirm(`¿Deseas dar de baja al cliente ${row.commercialName}?`)) return;
        try { await api(`/clientes/${row.id}`, { method: "PUT", body: JSON.stringify({ estado: "INACTIVE" }) }); await list.reload(); }
        catch (error) { alert(error.message); }
      }}/>
    </form>
  );
}

export default Clientes;
