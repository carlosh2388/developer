import { useState } from "react";
import { api } from "../services/api";
import ConfigRecordsTable from "../components/ConfigRecordsTable";
import CancelEditButton from "../components/CancelEditButton";
import { useCatalogList } from "../hooks/useCatalogList";

const puestos = [["COLLECTOR", "Recolector"], ["CLASSIFIER", "Clasificador"], ["DRIVER", "Piloto"], ["OTHER", "Otro"]];

export default function Empleados() {
  const list = useCatalogList("/personal");
  const [editingId, setEditingId] = useState(null);
  const [codigo, setCodigo] = useState("Automático");
  const [nombre, setNombre] = useState("");
  const [roles, setRoles] = useState([]);
  const [estado, setEstado] = useState("ACTIVE");

  const toggleRole = (role) => setRoles((current) => current.includes(role) ? current.filter((item) => item !== role) : [...current, role]);
  const limpiar = () => { setEditingId(null); setCodigo("Automático"); setNombre(""); setRoles([]); setEstado("ACTIVE"); };
  const guardar = async (event) => {
    event.preventDefault();
    try {
      if (!roles.length) throw new Error("Selecciona al menos un puesto para el empleado.");
      const saved = await api(editingId ? `/personal/${editingId}` : "/personal", { method: editingId ? "PUT" : "POST", body: JSON.stringify({ nombreCompleto: nombre, roles, estado }) });
      alert(`Empleado ${saved.code} guardado correctamente`);
      limpiar(); await list.reload();
    } catch (error) { alert(error.message); }
  };

  return <div className="page-shell"><div className="page-heading"><div><p className="eyebrow">CONFIGURACIÓN</p><h1>Empleados</h1><p>Administra empleados y sus puestos operativos.</p></div></div>
    <div className="admin-grid"><form className="panel" onSubmit={guardar}><h2>{editingId ? "Modificar empleado" : "Nuevo empleado"}</h2>
      <label>Código<input value={codigo} readOnly /></label>
      <label>Nombre completo<input value={nombre} onChange={(e) => setNombre(e.target.value)} required /></label>
      <fieldset className="employee-roles"><legend>Puestos</legend>{puestos.map(([value, label]) => <label key={value}><input type="checkbox" checked={roles.includes(value)} onChange={() => toggleRole(value)} /> {label}</label>)}</fieldset>
      {editingId && <label>Estado<select value={estado} onChange={(e) => setEstado(e.target.value)}><option value="ACTIVE">Activo</option><option value="INACTIVE">Inactivo</option></select></label>}
      <div className="edit-actions"><button>{editingId ? "Guardar cambios" : "Guardar empleado"}</button><CancelEditButton editing={editingId} onCancel={limpiar}/></div>
    </form><section className="panel table-panel"><ConfigRecordsTable title="Empleados registrados" rows={list.rows} loading={list.loading} error={list.error} columns={[{ key: "code", label: "Código" },{ key: "fullName", label: "Empleado" },{ key: "roles", label: "Puestos", render: (value) => (value || []).map((role) => puestos.find(([code]) => code === role)?.[1] || role).join(", ") },{ key: "status", label: "Estado" }]} onEdit={(row) => { setEditingId(row.id); setCodigo(row.code); setNombre(row.fullName); setRoles(row.roles || []); setEstado(row.status); }} /></section></div>
  </div>;
}
