import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api";

const emptyClient = {
  name: "",
  taxId: "",
  contactEmail: "",
  contactPhone: "",
  status: "ACTIVE",
};
const emptyLicense = {
  organizationId: "",
  installationId: "",
  expiresAt: "",
  graceDays: 0,
  notes: "",
};
const statusLabels = {
  ACTIVE: "Activa",
  EXPIRING: "Por vencer",
  SUSPENDED: "Suspendida",
  EXPIRED: "Vencida",
  REVOKED: "Baja definitiva",
  INACTIVE: "Inactivo",
};
const keyStatusLabels = {
  ACTIVE: "Activa",
  REPLACED: "Reemplazada",
  EXPIRED: "Vencida",
  REVOKED: "Revocada",
};
const actionLabels = {
  ORGANIZATION_CREATED: "Cliente creado",
  ORGANIZATION_UPDATED: "Cliente actualizado",
  LICENSE_CREATED: "Licencia emitida",
  LICENSE_UPDATED: "Licencia actualizada",
  LICENSE_SUSPENDED: "Servicio suspendido",
  LICENSE_REVOKED: "Licencia dada de baja",
  LICENSE_ACTIVATED: "Instalación activada",
  LICENSE_KEY_REGENERATED: "Nueva clave generada",
};

function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (!data.user.isPlatformAdmin)
        throw new Error(
          "Esta cuenta no tiene acceso al control central de licencias.",
        );
      sessionStorage.setItem("avinext_platform_token", data.token);
      onLogin(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login">
      <form onSubmit={submit}>
        <div className="logo">A</div>
        <p className="overline">CONTROL CENTRAL</p>
        <h1>Administración AVINEXT</h1>
        <p className="muted">
          Gestiona clientes, instalaciones y vigencia del servicio.
        </p>
        {error && <div className="alert error">{error}</div>}
        <label>
          Usuario
          <input
            autoComplete="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>
        <button disabled={busy}>
          {busy ? "Validando…" : "Acceder al control central"}
        </button>
      </form>
    </main>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className="modal">
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="close" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Metrics({ organizations, licenses }) {
  return (
    <section className="metrics">
      <article>
        <span>Clientes activos</span>
        <strong>
          {organizations.filter((o) => o.status === "ACTIVE").length}
        </strong>
      </article>
      <article>
        <span>Licencias activas</span>
        <strong>
          {
            licenses.filter((l) => ["ACTIVE", "EXPIRING"].includes(l.status))
              .length
          }
        </strong>
      </article>
      <article>
        <span>Accesos suspendidos</span>
        <strong>
          {
            licenses.filter((l) =>
              ["SUSPENDED", "EXPIRED", "REVOKED"].includes(l.status),
            ).length
          }
        </strong>
      </article>
    </section>
  );
}

function LicensesView({ organizations, licenses, reload, notify }) {
  const activeOrganizations = organizations.filter(
    (o) => o.status === "ACTIVE",
  );
  const [form, setForm] = useState(emptyLicense);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [keyHistory, setKeyHistory] = useState(null);
  const [keyLicense, setKeyLicense] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  useEffect(() => {
    if (!form.organizationId && activeOrganizations[0])
      setForm((v) => ({ ...v, organizationId: activeOrganizations[0].id }));
  }, [activeOrganizations, form.organizationId]);
  async function create(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await api("/platform/licenses", {
        method: "POST",
        body: JSON.stringify(form),
      });
      notify(
        "key",
        `Clave emitida: ${result.licenseKey}. Guárdala ahora; no volverá a mostrarse.`,
      );
      setForm({
        ...emptyLicense,
        organizationId: activeOrganizations[0]?.id || "",
      });
      await reload();
    } catch (e) {
      notify("error", e.message);
    } finally {
      setBusy(false);
    }
  }
  async function saveEdit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await api(`/platform/licenses/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: editing.status,
          expiresAt: editing.expiresAt,
          graceDays: Number(editing.graceDays),
          notes: editing.notes,
        }),
      });
      notify("ok", result.message);
      setEditing(null);
      await reload();
    } catch (e) {
      notify("error", e.message);
    } finally {
      setBusy(false);
    }
  }
  async function changeStatus(item, status) {
    const text =
      status === "REVOKED"
        ? "dar de baja definitivamente esta licencia"
        : status === "SUSPENDED"
          ? "suspender el servicio"
          : "reactivar el servicio";
    if (!window.confirm(`¿Confirmas que deseas ${text}?`)) return;
    try {
      const result = await api(`/platform/licenses/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          expiresAt: item.expires_at,
          graceDays: item.grace_days,
          notes: item.notes,
        }),
      });
      notify("ok", result.message);
      await reload();
    } catch (e) {
      notify("error", e.message);
    }
  }
  async function regenerateKey(item) {
    if (
      !window.confirm(
        "¿Generar una nueva clave? La clave anterior dejará de servir para nuevas activaciones.",
      )
    )
      return;
    try {
      const result = await api(`/platform/licenses/${item.id}/regenerate-key`, {
        method: "POST",
      });
      notify(
        "key",
        `Nueva clave: ${result.licenseKey}. Cópiala ahora; no volverá a mostrarse.`,
      );
      await reload();
    } catch (e) {
      notify("error", e.message);
    }
  }
  async function showKeys(item) {
    try {
      setKeyLicense(item);
      setKeyHistory(await api(`/platform/licenses/${item.id}/keys`));
    } catch (e) {
      notify("error", e.message);
    }
  }
  async function copyKey(item) {
    await navigator.clipboard.writeText(item.licenseKey);
    setCopiedKey(item.id);
    window.setTimeout(() => setCopiedKey(null), 1800);
  }
  return (
    <>
      <Metrics organizations={organizations} licenses={licenses} />
      <div className="single-form">
        <form className="card" onSubmit={create}>
          <h2>Emitir nueva licencia</h2>
          <div className="form-grid">
            <label>
              Cliente
              <select
                value={form.organizationId}
                onChange={(e) =>
                  setForm({ ...form, organizationId: e.target.value })
                }
                required
              >
                <option value="">Seleccionar cliente</option>
                {activeOrganizations.map((o) => (
                  <option value={o.id} key={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Identificador de instalación
              <input
                placeholder="cliente-servidor-01"
                value={form.installationId}
                onChange={(e) =>
                  setForm({ ...form, installationId: e.target.value })
                }
                required
              />
            </label>
            <label>
              Fecha y hora de vencimiento
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm({ ...form, expiresAt: e.target.value })
                }
                required
              />
            </label>
            <label>
              Días de gracia
              <input
                type="number"
                min="0"
                max="90"
                value={form.graceDays}
                onChange={(e) =>
                  setForm({ ...form, graceDays: Number(e.target.value) })
                }
              />
            </label>
            <label className="wide">
              Observaciones
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Información opcional de la licencia"
              />
            </label>
          </div>
          <button disabled={busy}>Emitir licencia</button>
        </form>
      </div>
      <section className="card list">
        <div className="section-title">
          <div>
            <h2>Instalaciones administradas</h2>
            <p>{licenses.length} licencia(s) registrada(s)</p>
          </div>
        </div>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Instalación</th>
                <th>Estado</th>
                <th>Vencimiento</th>
                <th>Gracia</th>
                <th>Última validación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.organization_name}</strong>
                  </td>
                  <td>
                    <code>{item.installation_id}</code>
                  </td>
                  <td>
                    <span className={`pill ${item.status.toLowerCase()}`}>
                      {statusLabels[item.status]}
                    </span>
                  </td>
                  <td>{new Date(item.expires_at).toLocaleString()}</td>
                  <td>{item.grace_days} días</td>
                  <td>
                    {item.last_check_at
                      ? new Date(item.last_check_at).toLocaleString()
                      : "Sin conexión"}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => showKeys(item)}
                      >
                        Ver claves
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() =>
                          setEditing({
                            ...item,
                            expiresAt: toLocalInput(item.expires_at),
                            graceDays: item.grace_days,
                            notes: item.notes || "",
                          })
                        }
                      >
                        Editar
                      </button>
                      {["ACTIVE", "EXPIRING"].includes(item.status) && (
                        <button
                          type="button"
                          className="warning"
                          onClick={() => changeStatus(item, "SUSPENDED")}
                        >
                          Suspender
                        </button>
                      )}
                      {["SUSPENDED", "EXPIRED"].includes(item.status) && (
                        <button
                          type="button"
                          className="success"
                          onClick={() => changeStatus(item, "ACTIVE")}
                        >
                          Reactivar
                        </button>
                      )}
                      {item.status !== "REVOKED" && (
                        <button
                          type="button"
                          className="danger"
                          onClick={() => changeStatus(item, "REVOKED")}
                        >
                          Dar de baja
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!licenses.length && (
            <div className="empty">No hay licencias registradas.</div>
          )}
        </div>
      </section>
      {editing && (
        <Modal
          title="Editar vigencia de licencia"
          onClose={() => setEditing(null)}
        >
          <form onSubmit={saveEdit}>
            <div className="detail-box">
              <span>Cliente</span>
              <strong>{editing.organization_name}</strong>
              <span>Instalación</span>
              <code>{editing.installation_id}</code>
            </div>
            <label>
              Nuevo vencimiento
              <input
                type="datetime-local"
                value={editing.expiresAt}
                onChange={(e) =>
                  setEditing({ ...editing, expiresAt: e.target.value })
                }
                required
              />
            </label>
            <label>
              Días de gracia
              <input
                type="number"
                min="0"
                max="90"
                value={editing.graceDays}
                onChange={(e) =>
                  setEditing({ ...editing, graceDays: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Estado
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value })
                }
              >
                <option value="ACTIVE">Activa</option>
                <option value="EXPIRING">Por vencer</option>
                <option value="SUSPENDED">Suspendida</option>
                <option value="EXPIRED">Vencida</option>
                <option value="REVOKED">Baja definitiva</option>
              </select>
            </label>
            <label>
              Observaciones
              <textarea
                value={editing.notes}
                onChange={(e) =>
                  setEditing({ ...editing, notes: e.target.value })
                }
              />
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="warning"
                onClick={() => regenerateKey(editing)}
              >
                Generar nueva clave
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>
              <button disabled={busy}>Guardar cambios</button>
            </div>
          </form>
        </Modal>
      )}
      {keyHistory && (
        <Modal
          title="Historial de claves de activación"
          onClose={() => {
            setKeyHistory(null);
            setKeyLicense(null);
          }}
        >
          <div className="detail-box">
            <span>Cliente</span>
            <strong>{keyLicense?.organization_name}</strong>
            <span>Instalación</span>
            <code>{keyLicense?.installation_id}</code>
          </div>
          <div className="key-table-wrap">
            <table className="key-table">
              <thead>
                <tr><th>Clave</th><th>Estado</th><th>Generada</th><th>Acción</th></tr>
              </thead>
              <tbody>
                {keyHistory.map((item) => (
                  <tr key={item.id}>
                    <td><code>{item.licenseKey}</code></td>
                    <td><span className={`pill ${item.status.toLowerCase()}`}>{keyStatusLabels[item.status] || item.status}</span></td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td><button type="button" className="secondary" onClick={() => copyKey(item)}>{copiedKey === item.id ? "Copiada" : "Copiar"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!keyHistory.length && (
              <div className="empty">Las claves anteriores sólo se guardaron como hash y no pueden recuperarse. Genera una nueva clave para comenzar el historial cifrado.</div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

function ClientsView({ organizations, reload, notify }) {
  const [form, setForm] = useState(emptyClient);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = organizations.filter((o) =>
    `${o.name} ${o.tax_id || ""}`.toLowerCase().includes(search.toLowerCase()),
  );
  async function create(event) {
    event.preventDefault();
    try {
      await api("/platform/organizations", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(emptyClient);
      notify("ok", "Cliente registrado correctamente.");
      await reload();
    } catch (e) {
      notify("error", e.message);
    }
  }
  async function save(event) {
    event.preventDefault();
    try {
      const result = await api(`/platform/organizations/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(editing),
      });
      notify("ok", result.message);
      setEditing(null);
      await reload();
    } catch (e) {
      notify("error", e.message);
    }
  }
  async function toggle(item) {
    const status = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (
      !window.confirm(
        status === "INACTIVE"
          ? "¿Dar de baja al cliente? Sus licencias activas serán suspendidas."
          : "¿Reactivar al cliente? Las licencias deberán reactivarse individualmente.",
      )
    )
      return;
    try {
      const result = await api(`/platform/organizations/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: item.name,
          taxId: item.tax_id,
          contactEmail: item.contact_email,
          contactPhone: item.contact_phone,
          status,
        }),
      });
      notify("ok", result.message);
      await reload();
    } catch (e) {
      notify("error", e.message);
    }
  }
  return (
    <>
      <div className="forms client-layout">
        <form className="card" onSubmit={create}>
          <h2>Registrar cliente</h2>
          <label>
            Nombre o razón social
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            NIT / Identificación
            <input
              value={form.taxId}
              onChange={(e) => setForm({ ...form, taxId: e.target.value })}
            />
          </label>
          <label>
            Correo de contacto
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) =>
                setForm({ ...form, contactEmail: e.target.value })
              }
            />
          </label>
          <label>
            Teléfono
            <input
              value={form.contactPhone}
              onChange={(e) =>
                setForm({ ...form, contactPhone: e.target.value })
              }
            />
          </label>
          <button>Guardar cliente</button>
        </form>
        <section className="card list client-list">
          <div className="section-title">
            <div>
              <h2>Clientes registrados</h2>
              <p>{organizations.length} cliente(s)</p>
            </div>
            <input
              className="search"
              placeholder="Buscar cliente…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Licencias</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <small>{item.tax_id || "Sin identificación"}</small>
                    </td>
                    <td>
                      {item.contact_email || "—"}
                      <small>{item.contact_phone || ""}</small>
                    </td>
                    <td>
                      {item.active_licenses} activa(s) / {item.license_count}{" "}
                      total
                    </td>
                    <td>
                      <span className={`pill ${item.status.toLowerCase()}`}>
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() =>
                            setEditing({
                              id: item.id,
                              name: item.name,
                              taxId: item.tax_id || "",
                              contactEmail: item.contact_email || "",
                              contactPhone: item.contact_phone || "",
                              status: item.status,
                            })
                          }
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={
                            item.status === "ACTIVE" ? "danger" : "success"
                          }
                          onClick={() => toggle(item)}
                        >
                          {item.status === "ACTIVE"
                            ? "Dar de baja"
                            : "Reactivar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      {editing && (
        <Modal title="Editar cliente" onClose={() => setEditing(null)}>
          <form onSubmit={save}>
            <label>
              Nombre o razón social
              <input
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
                required
              />
            </label>
            <label>
              NIT / Identificación
              <input
                value={editing.taxId}
                onChange={(e) =>
                  setEditing({ ...editing, taxId: e.target.value })
                }
              />
            </label>
            <label>
              Correo
              <input
                type="email"
                value={editing.contactEmail}
                onChange={(e) =>
                  setEditing({ ...editing, contactEmail: e.target.value })
                }
              />
            </label>
            <label>
              Teléfono
              <input
                value={editing.contactPhone}
                onChange={(e) =>
                  setEditing({ ...editing, contactPhone: e.target.value })
                }
              />
            </label>
            <label>
              Estado
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value })
                }
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>
              <button>Guardar cambios</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function AuditView({ organizations, logs, loadAudit }) {
  const [filters, setFilters] = useState({ organizationId: "", action: "" });
  const actions = useMemo(
    () => [...new Set(logs.map((l) => l.action))],
    [logs],
  );
  function apply(event) {
    event.preventDefault();
    loadAudit(filters);
  }
  return (
    <>
      <form className="card filters" onSubmit={apply}>
        <div>
          <h2>Bitácora de auditoría</h2>
          <p>
            Historial de acciones administrativas realizadas en la plataforma.
          </p>
        </div>
        <label>
          Cliente
          <select
            value={filters.organizationId}
            onChange={(e) =>
              setFilters({ ...filters, organizationId: e.target.value })
            }
          >
            <option value="">Todos</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Acción
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          >
            <option value="">Todas</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {actionLabels[a] || a}
              </option>
            ))}
          </select>
        </label>
        <button>Aplicar filtros</button>
      </form>
      <section className="card list audit-list">
        <div className="section-title">
          <div>
            <h2>Actividad reciente</h2>
            <p>{logs.length} registro(s)</p>
          </div>
          <button className="secondary" onClick={() => loadAudit(filters)}>
            Actualizar
          </button>
        </div>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Acción</th>
                <th>Responsable</th>
                <th>Cliente</th>
                <th>Entidad</th>
                <th>Detalle</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>
                    <strong>{actionLabels[log.action] || log.action}</strong>
                  </td>
                  <td>
                    {log.actor_name || "Sistema"}
                    <small>
                      {log.actor_username ? `@${log.actor_username}` : ""}
                    </small>
                  </td>
                  <td>{log.organization_name || "—"}</td>
                  <td>{log.entity}</td>
                  <td>
                    <code>
                      {Object.keys(log.details || {}).length
                        ? JSON.stringify(log.details)
                        : "—"}
                    </code>
                  </td>
                  <td>{log.ip_address || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!logs.length && (
            <div className="empty">
              No hay eventos para los filtros seleccionados.
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function Dashboard({ user, onLogout }) {
  const [view, setView] = useState("licenses");
  const [organizations, setOrganizations] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [logs, setLogs] = useState([]);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const notify = (type, text) => {
    setNotice({ type, text });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const reload = useCallback(async () => {
    try {
      const [orgData, licenseData] = await Promise.all([
        api("/platform/organizations"),
        api("/platform/licenses"),
      ]);
      setOrganizations(orgData);
      setLicenses(licenseData);
    } catch (e) {
      notify("error", e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  const loadAudit = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (filters.action) params.set("action", filters.action);
      if (filters.organizationId)
        params.set("organizationId", filters.organizationId);
      setLogs(await api(`/platform/audit-logs?${params}`));
    } catch (e) {
      notify("error", e.message);
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  useEffect(() => {
    if (view === "audit") loadAudit();
  }, [view, loadAudit]);
  const titles = {
    licenses: ["Licencias", "Administra vigencia y acceso a la plataforma."],
    clients: [
      "Clientes",
      "Gestiona empresas, contactos y estado del servicio.",
    ],
    audit: ["Auditoría", "Consulta el historial de cambios y responsables."],
  };
  return (
    <div className="layout">
      <aside>
        <div className="side-brand">
          <div className="logo small">A</div>
          <div>
            <strong>AVINEXT</strong>
            <span>Control central</span>
          </div>
        </div>
        <nav>
          <button
            className={view === "licenses" ? "active" : ""}
            onClick={() => {
              setView("licenses");
              setNotice(null);
            }}
          >
            Licencias
          </button>
          <button
            className={view === "clients" ? "active" : ""}
            onClick={() => {
              setView("clients");
              setNotice(null);
            }}
          >
            Clientes
          </button>
          <button
            className={view === "audit" ? "active" : ""}
            onClick={() => {
              setView("audit");
              setNotice(null);
            }}
          >
            Auditoría
          </button>
        </nav>
        <div className="account">
          <span>{user.name}</span>
          <button onClick={onLogout}>Cerrar sesión</button>
        </div>
      </aside>
      <main className="content">
        <header>
          <div>
            <p className="overline">PLATAFORMA CENTRAL</p>
            <h1>{titles[view][0]}</h1>
            <p>{titles[view][1]}</p>
          </div>
          <span className="secure">● Servicio seguro</span>
        </header>
        {notice && <div className={`alert ${notice.type}`}>{notice.text}</div>}
        {loading ? (
          <div className="loading">Cargando información…</div>
        ) : view === "licenses" ? (
          <LicensesView
            organizations={organizations}
            licenses={licenses}
            reload={reload}
            notify={notify}
          />
        ) : view === "clients" ? (
          <ClientsView
            organizations={organizations}
            reload={reload}
            notify={notify}
          />
        ) : (
          <AuditView
            organizations={organizations}
            logs={logs}
            loadAudit={loadAudit}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  function logout() {
    sessionStorage.removeItem("avinext_platform_token");
    setUser(null);
  }
  useEffect(() => {
    if (sessionStorage.getItem("avinext_platform_token"))
      api("/auth/me")
        .then((data) =>
          data.user.isPlatformAdmin ? setUser(data.user) : logout(),
        )
        .catch(logout);
  }, []);
  return user ? (
    <Dashboard user={user} onLogout={logout} />
  ) : (
    <Login onLogin={setUser} />
  );
}
