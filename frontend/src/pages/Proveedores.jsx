import { useEffect, useState } from "react";
import { api } from "../services/api";
import ConfigRecordsTable from "../components/ConfigRecordsTable";
import { useCatalogList } from "../hooks/useCatalogList";
import CancelEditButton from "../components/CancelEditButton";
import { confirmAction } from "../services/notifications";

function Proveedores() {
  const list = useCatalogList("/proveedores");
  // =========================
  // STATES
  // =========================

  const [codigoProveedor, setCodigoProveedor] = useState("");
  const [nombreProveedor, setNombreProveedor] = useState("");

  const [nit, setNit] = useState("");
  const [direccion, setDireccion] = useState("");

  const [contacto, setContacto] = useState("");

  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [editingId, setEditingId] = useState(null);

  const cargarSiguienteCodigo = () => api("/proveedores/siguiente").then((data) => setCodigoProveedor(data.code)).catch((error) => alert(error.message));
  const cancelarEdicion = async () => { setEditingId(null); setNombreProveedor(""); setNit(""); setDireccion(""); setContacto(""); setTelefono(""); setCorreo(""); await cargarSiguienteCodigo(); };
  useEffect(() => { cargarSiguienteCodigo(); }, []);

  // =========================
  // TELÉFONO
  // =========================

  const handleTelefono = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 4) {
      value =
        value.slice(0, 4) +
        "-" +
        value.slice(4, 8);
    }

    setTelefono(value);
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api(editingId ? `/proveedores/${editingId}` : "/proveedores", { method: editingId ? "PUT" : "POST", body: JSON.stringify({
        nombre: nombreProveedor, nit, direccion, contacto, telefono, correo,
      }) });
      alert("Proveedor guardado correctamente");
      setCodigoProveedor(""); setNombreProveedor(""); setNit(""); setDireccion("");
      setContacto(""); setTelefono(""); setCorreo("");
      setEditingId(null);
      await list.reload();
      await cargarSiguienteCodigo();
    } catch (error) { alert(error.message); }
  };

  // =========================
  // ESTILOS
  // =========================

  const rowStyle = {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr 1fr",
    gap: "10px",
    marginBottom: "15px"
  };

  const doubleRowStyle = {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "10px",
    marginBottom: "15px"
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
      <h2>
        Registro de Proveedores
      </h2>

      {/* =========================
          FILA 1
      ========================= */}

      <div style={rowStyle}>
        <div>
          <label>
            Código de Proveedor
          </label>

          <input
            value={codigoProveedor}
            readOnly
            placeholder="PR01 Automático"
            style={inputStyle}
          />
        </div>

        <div>
          <label>Teléfono</label>

          <input
            value={telefono}
            onChange={
              handleTelefono
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label>Correo</label>

          <input
            type="email"
            value={correo}
            onChange={(e) =>
              setCorreo(
                e.target.value
              )
            }
            style={inputStyle}
          />
        </div>
      </div>

      {/* =========================
          FILA 2
      ========================= */}

      <div style={doubleRowStyle}>
        <div>
          <label>NIT</label>

          <input
            value={nit}
            onChange={(e) =>
              setNit(
                e.target.value
              )
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label>
            Nombre del Proveedor
          </label>

          <input
            value={nombreProveedor}
            onChange={(e) =>
              setNombreProveedor(
                e.target.value
              )
            }
            style={inputStyle}
          />
        </div>
      </div>

      {/* =========================
          FILA 3
      ========================= */}

      <div style={doubleRowStyle}>
        <div>
          <label>
            Dirección
          </label>

          <input
            value={direccion}
            onChange={(e) =>
              setDireccion(
                e.target.value
              )
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label>
            Nombre Contacto
          </label>

          <input
            value={contacto}
            onChange={(e) =>
              setContacto(
                e.target.value
              )
            }
            style={inputStyle}
          />
        </div>
      </div>

      {/* =========================
          GUARDAR
      ========================= */}

      <div className="edit-actions"><button
        type="submit"
        style={buttonStyle}
      >
        {editingId ? "Guardar cambios" : "Guardar"}
      </button><CancelEditButton editing={editingId} onCancel={cancelarEdicion}/></div>
      <ConfigRecordsTable title="Proveedores registrados" rows={list.rows} loading={list.loading} error={list.error} columns={[
        { key: "code", label: "Código" }, { key: "name", label: "Proveedor" }, { key: "taxId", label: "NIT" },
        { key: "contactName", label: "Contacto" }, { key: "phone", label: "Teléfono" }, { key: "email", label: "Correo" }, { key: "status", label: "Estado" },
      ]} onEdit={(row) => { setEditingId(row.id); setCodigoProveedor(row.code); setNombreProveedor(row.name); setNit(row.taxId || ""); setDireccion(row.address || ""); setContacto(row.contactName || ""); setTelefono(row.phone || ""); setCorreo(row.email || ""); }} onDeactivate={async (row) => {
        if (!(await confirmAction(`¿Deseas dar de baja al proveedor ${row.name}?`, { title: "Dar de baja proveedor", confirmLabel: "Sí, dar de baja" }))) return;
        try { await api(`/proveedores/${row.id}`, { method: "PUT", body: JSON.stringify({ estado: "INACTIVE" }) }); await list.reload(); alert("Proveedor dado de baja correctamente."); }
        catch (error) { alert(error.message); }
      }}/>
    </form>
  );
}

export default Proveedores;
