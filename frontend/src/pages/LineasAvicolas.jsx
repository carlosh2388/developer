import { useState } from "react";
import ConfigRecordsTable from "../components/ConfigRecordsTable";
import { assertUniqueCode, useCatalogList } from "../hooks/useCatalogList";
import { api } from "../services/api";

export default function LineasAvicolas() {
  const list = useCatalogList("/lineas-avicolas");
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [estado, setEstado] = useState("ACTIVE");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function guardar(event) {
    event.preventDefault();
    try {
      assertUniqueCode(list.rows, codigo, "código de línea avícola", editingId);
      setSaving(true);
      await api(editingId ? `/lineas-avicolas/${editingId}` : "/lineas-avicolas", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({ codigo: codigo.trim().toUpperCase(), nombre: nombre.trim(), estado }),
      });
      await list.reload();
      setCodigo(""); setNombre(""); setEstado("ACTIVE"); setEditingId(null);
      alert(editingId ? "Línea avícola actualizada correctamente" : "Línea avícola guardada correctamente");
    } catch (error) { alert(error.message); }
    finally { setSaving(false); }
  }

  const input = { width: "100%", padding: 9, border: "1px solid #ccd5d0", borderRadius: 5, boxSizing: "border-box" };
  return <form onSubmit={guardar} style={{ position: "relative", maxWidth: 900, margin: "0 auto", padding: 20, fontFamily: "Arial" }}>
    <h2>Registro de Líneas Avícolas</h2>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 12, marginBottom: 18 }}>
      <label>Código
        <input required maxLength="30" value={codigo} onChange={(event) => setCodigo(event.target.value.toUpperCase())} placeholder="Ej. SN" style={input}/>
      </label>
      <label>Nombre de la línea
        <input required maxLength="120" value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Ej. Super Nick +" style={input}/>
      </label>
      <label>Estado
        <select value={estado} onChange={(event) => setEstado(event.target.value)} style={input}>
          <option value="ACTIVE">Activo</option><option value="INACTIVE">Inactivo</option>
        </select>
      </label>
    </div>
    <button disabled={saving} style={{ width: "100%", padding: 10, border: 0, borderRadius: 5, background: "#1976d2", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
      {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Guardar"}
    </button>
    <ConfigRecordsTable title="Líneas avícolas registradas" rows={list.rows} loading={list.loading} error={list.error} columns={[
      { key: "code", label: "Código" }, { key: "name", label: "Línea avícola" }, { key: "status", label: "Estado" },
    ]} onEdit={(row) => { setEditingId(row.id); setCodigo(row.code); setNombre(row.name); setEstado(row.status); }} onDeactivate={async (row) => {
      if (!window.confirm(`¿Deseas dar de baja la línea ${row.name}?`)) return;
      try { await api(`/lineas-avicolas/${row.id}`, { method: "PUT", body: JSON.stringify({ estado: "INACTIVE" }) }); await list.reload(); }
      catch (error) { alert(error.message); }
    }}/>
  </form>;
}
