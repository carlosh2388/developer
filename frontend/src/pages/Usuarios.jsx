import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import CancelEditButton from "../components/CancelEditButton";

const emptyForm = {
  fullName: "",
  username: "",
  password: "",
  roleCode: "OPERATOR",
  status: "ACTIVE",
  personnelId: "",
};

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [quota, setQuota] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordUser, setPasswordUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmation: "" });
  const [userSearch, setUserSearch] = useState("");
  const filteredUsers = users.filter((user) => `${user.full_name} ${user.username} ${user.role_name} ${user.status}`.toLowerCase().includes(userSearch.toLowerCase()));
  const load = useCallback(async () => {
    try {
      const [u, r, q, p] = await Promise.all([
        api("/usuarios"),
        api("/usuarios/roles"),
        api("/usuarios/quota"),
        api("/personal"),
      ]);
      setUsers(u);
      setRoles(r);
      setQuota(q);
      setPersonnel(p);
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  function edit(user) {
    setEditing(user.id);
    setForm({
      fullName: user.full_name,
      username: user.username,
      password: "",
      roleCode: user.role_code,
      status: user.status,
      personnelId: user.personnel_id || "",
    });
  }
  function cancel() {
    setEditing(null);
    setForm(emptyForm);
  }
  async function save(event) {
    event.preventDefault();
    setMessage(null);
    try {
      if (editing)
        await api(`/usuarios/${editing}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      else
        await api("/usuarios", { method: "POST", body: JSON.stringify(form) });
      setMessage({
        type: "success",
        text: editing
          ? "Usuario actualizado correctamente."
          : "Usuario creado correctamente.",
      });
      cancel();
      load();
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    }
  }
  async function toggle(user) {
    const status = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (
      !window.confirm(
        status === "INACTIVE"
          ? `¿Dar de baja a ${user.full_name}? Sus sesiones se cerrarán.`
          : `¿Reactivar el acceso de ${user.full_name}?`,
      )
    )
      return;
    try {
      const result = await api(`/usuarios/${user.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setMessage({ type: "success", text: result.message });
      load();
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    }
  }
  async function resetPassword(event) {
    event.preventDefault();
    if (passwordForm.password.length < 8) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (passwordForm.password !== passwordForm.confirmation) {
      setMessage({ type: "error", text: "La confirmación de contraseña no coincide." });
      return;
    }
    try {
      const result = await api(`/usuarios/${passwordUser.id}/password`, {
        method: "PATCH",
        body: JSON.stringify({ password: passwordForm.password }),
      });
      setMessage({ type: "success", text: result.message });
      setPasswordUser(null);
      setPasswordForm({ password: "", confirmation: "" });
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    }
  }
  async function closeSession(user) {
    try {
      const result = await api(`/usuarios/${user.id}/session`, { method: "DELETE" });
      setMessage({ type: "success", text: result.message });
      load();
    } catch (e) { setMessage({ type: "error", text: e.message }); }
  }
  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CONFIGURACIÓN</p>
          <h1>Administración de usuarios</h1>
          <p>Gestiona accesos, roles y estados de las cuentas.</p>
        </div>
      </div>
      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}
      {quota && <div className="panel quota-summary">
        <strong>{quota.active_users} de {quota.max_users} usuarios activos</strong>
        <span>La cantidad máxima está definida por la licencia del cliente.</span>
      </div>}
      <div className="admin-grid">
        <form className="panel" onSubmit={save}>
          <h2>{editing ? "Modificar usuario" : "Nuevo usuario"}</h2>
          <label>
            Nombre completo
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              readOnly={Boolean(form.personnelId)}
              required
            />
          </label>
          <label>
            Empleado asociado (opcional)
            <select value={form.personnelId} onChange={(e) => { const personnelId = e.target.value; const employee = personnel.find((item) => item.id === personnelId); setForm({ ...form, personnelId, ...(employee ? { fullName: employee.fullName } : {}) }); }}>
              <option value="">Sin empleado asociado</option>
              {personnel.filter((employee) => employee.status === "ACTIVE" && (!users.some((user) => user.personnel_id === employee.id) || employee.id === form.personnelId)).map((employee) => <option key={employee.id} value={employee.id}>{employee.code} - {employee.fullName}</option>)}
            </select>
            <small>El puesto laboral no modifica los permisos del usuario.</small>
          </label>
          <label>
            Nombre de usuario
            <input
              value={form.username}
              minLength="3"
              maxLength="60"
              pattern="[A-Za-z0-9._-]+"
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
            <small>Letras, números, punto, guion o guion bajo.</small>
          </label>
          {!editing && (
            <label>
              Contraseña temporal
              <input
                type="password"
                minLength="8"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <small>Mínimo 8 caracteres.</small>
            </label>
          )}
          <label>
            Rol
            <select
              value={form.roleCode}
              onChange={(e) => setForm({ ...form, roleCode: e.target.value })}
            >
              {roles.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          {editing && (
            <label>
              Estado
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
                <option value="LOCKED">Bloqueado</option>
              </select>
            </label>
          )}
          <div className="edit-actions">
            <button>{editing ? "Guardar cambios" : "Crear usuario"}</button>
            <CancelEditButton editing={editing} onCancel={cancel}/>
          </div>
        </form>
        <section className="panel table-panel">
          <div className="panel-title">
            <h2>Usuarios registrados</h2>
            <span className="count-badge">{filteredUsers.length}</span>
          </div>
          <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Buscar usuario, rol o estado" style={{ width: "100%", padding: 9, marginBottom: 12, boxSizing: "border-box" }}/>
          {loading ? (
            <p>Cargando usuarios…</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Empleado</th>
                    <th>Estado</th>
                    <th>Último acceso</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.full_name}</strong>
                        <small>@{u.username}</small>
                      </td>
                      <td>{u.role_name}</td>
                      <td>{u.personnel_name || "Sin asociación"}</td>
                      <td>
                        <span className={`badge ${u.status.toLowerCase()}`}>
                          {u.status === "ACTIVE"
                            ? "Activo"
                            : u.status === "LOCKED"
                              ? "Bloqueado"
                              : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        {u.last_login_at
                          ? new Date(u.last_login_at).toLocaleString()
                          : "Sin acceso"}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button type="button" onClick={() => edit(u)}>
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setPasswordUser(u);
                              setPasswordForm({ password: "", confirmation: "" });
                            }}
                          >
                            Contraseña
                          </button>
                          {u.session_active && <button type="button" className="btn-secondary" onClick={() => closeSession(u)}>Cerrar sesión</button>}
                          <button
                            type="button"
                            className="btn-link danger"
                            style={u.status === "ACTIVE" ? { background: "#c62828", color: "#fff", border: 0, borderRadius: 5, padding: "6px 10px", fontWeight: 700 } : undefined}
                            onClick={() => toggle(u)}
                          >
                            {u.status === "ACTIVE" ? "Dar de baja" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      {passwordUser && (
        <div className="password-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setPasswordUser(null)}>
          <form className="password-modal" onSubmit={resetPassword}>
            <div className="password-modal-header">
              <div><p className="eyebrow">SEGURIDAD</p><h2>Cambiar contraseña</h2></div>
              <button type="button" className="modal-close" onClick={() => setPasswordUser(null)}>×</button>
            </div>
            <div className="selected-user"><strong>{passwordUser.full_name}</strong><span>@{passwordUser.username}</span></div>
            <label>Nueva contraseña<input type="password" minLength="8" autoComplete="new-password" value={passwordForm.password} onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })} required /><small>Mínimo 8 caracteres.</small></label>
            <label>Confirmar contraseña<input type="password" minLength="8" autoComplete="new-password" value={passwordForm.confirmation} onChange={(e) => setPasswordForm({ ...passwordForm, confirmation: e.target.value })} required /></label>
            <div className="form-actions"><button type="button" className="btn-secondary" onClick={() => setPasswordUser(null)}>Cancelar</button><button>Actualizar contraseña</button></div>
            <p className="modal-note">Las sesiones anteriores del usuario se cerrarán automáticamente.</p>
          </form>
        </div>
      )}
    </div>
  );
}
