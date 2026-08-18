import { useMemo, useState } from "react";

const iconPaths = {
  dashboard: "M3 3h7v7H3zM14 3h7v4h-7zM14 11h7v10h-7zM3 14h7v7H3z",
  reports: "M4 20V10m5 10V4m6 16v-7m5 7V7",
  database: "M4 6c0-2 3.6-3 8-3s8 1 8 3-3.6 3-8 3-8-1-8-3Zm0 0v6c0 2 3.6 3 8 3s8-1 8-3V6M4 12v6c0 2 3.6 3 8 3s8-1 8-3v-6",
  controls: "M4 6h10M18 6h2M4 12h3m4 0h9M4 18h7m4 0h5M14 3v6M7 9v6m4 0v6",
  movements: "M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4",
  production: "M4 19V9l5 3V7l5 3V4l6 4v11zM8 19v-4h4v4",
  line: "M4 7h16M7 4v6m10-6v6M5 14h14v6H5z",
  flock: "M5 18c1-5 3-9 7-12 4 3 6 7 7 12M8 18h8M9 9l-3-2m9 2 3-2",
  warehouse: "M3 10 12 4l9 6v10H3zM7 20v-6h10v6M8 10h.01M12 10h.01M16 10h.01",
  product: "m4 8 8-4 8 4-8 4zM4 8v9l8 4 8-4V8M12 12v9",
  clients: "M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 1a3 3 0 1 0 0-6m5 15v-2a4 4 0 0 0-3-3.87",
  supplier: "M3 7h11v10H3zM14 10h4l3 3v4h-7zM7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  employee: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
  scale: "M12 3v4m-7 2h14M5 9l-3 6h6L5 9Zm14 0-3 6h6l-3-6ZM8 21h8m-4-14v14",
  egg: "M12 3c-3 0-6 6-6 11a6 6 0 0 0 12 0c0-5-3-11-6-11Z",
  foodIn: "M4 5h10v14H4zM14 9h3l3 4v6h-6M7 9h4m-4 4h4m7 7V9m-3 3 3-3 3 3",
  foodOut: "M4 5h10v14H4zM14 9h3l3 4v6h-6M7 9h4m-4 4h4m11-4v11m-3-3 3 3 3-3",
  add: "M12 5v14M5 12h14",
  remove: "M5 12h14",
  eggIn: "M9 4c-2 2-4 6-4 9a7 7 0 0 0 14 0c0-3-2-7-4-9M12 21V10m-4 4 4-4 4 4",
  eggOut: "M9 4c-2 2-4 6-4 9a7 7 0 0 0 14 0c0-3-2-7-4-9M12 9v12m-4-4 4 4 4-4",
  adjustIn: "M4 7h10M4 12h7M4 17h10m4-8v10m-4-4h8",
  adjustOut: "M4 7h10M4 12h7M4 17h10m1-2h7",
  breeder: "M5 16c0-5 3-10 8-10 3 0 5 2 5 5 0 4-4 7-8 7H5Zm8-10 2-3m3 8 3 1",
  admin: "M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6zM9 11h6m-3-3v6",
};

function MenuIcon({ name }) {
  return <svg className="menu-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={iconPaths[name] || iconPaths.dashboard}/></svg>;
}

const sections = [
  { id: "reports", title: "Reportes", icon: "reports", items: [["Producción por granja", "reportes", "production"]] },
  { id: "config", title: "Datos Maestros", icon: "database", items: [
    ["Líneas avícolas", "lineasAvicolas", "line"], ["Lotes", "lotes", "flock"], ["Bodegas", "bodegas", "warehouse"],
    ["Productos", "productos", "product"], ["Clientes", "clientes", "clients"], ["Proveedores", "proveedores", "supplier"], ["Empleados", "empleados", "employee"],
  ] },
  { id: "controls", title: "Controles", icon: "controls", items: [["Peso en aves", "controlPesoAves", "scale"], ["Peso en huevos", "controlPesoHuevos", "egg"]] },
  { id: "moves", title: "Movimientos", icon: "movements", items: [
    ["Ingreso de alimento", "IngresoAlimento", "foodIn"], ["Egreso de alimento", "EgresoAlimento", "foodOut"],
    ["Otros ingresos", "OtrosIngresos", "add"], ["Otros egresos", "EgresoInsumos", "remove"],
    ["Ingreso de huevos", "ingresoHuevos", "eggIn"], ["Egreso de huevos", "egresoHuevos", "eggOut"],
    ["Ajustes de entrada", "AjustesEntrada", "adjustIn"], ["Ajustes de salida", "AjusteSalida", "adjustOut"],
    ["Egreso de reproductores", "EgresoReproductores", "breeder"],
  ] },
];

export default function Sidebar({ setVista, vista, user, onLogout, onChangePassword }) {
  const canManageUsers = user.permissions?.includes("users.read");
  const activeSection = useMemo(() => sections.find((section) => section.items.some(([, key]) => key === vista))?.id || (vista === "usuarios" ? "admin" : null), [vista]);
  const [expanded, setExpanded] = useState(() => activeSection ? { [activeSection]: true } : {});
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  function navigate(key) { setVista(key); setMobileOpen(false); }
  function toggleSection(id) { if (collapsed) setCollapsed(false); setExpanded((current) => ({ ...current, [id]: !current[id] })); }

  return <>
    <button className="mobile-menu-trigger" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">☰</button>
    {mobileOpen && <button className="sidebar-overlay" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú"/>}
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-brand"><span className="brand-mark small">A</span><div className="brand-copy"><strong>AVINEXT</strong><small>Gestión avícola</small></div><button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expandir menú" : "Ocultar menú"}>{collapsed ? "›" : "‹"}</button><button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú">×</button></div>
      <nav className="menu">
        <button className={`nav-link home-link ${vista === "inicio" ? "selected" : ""}`} onClick={() => navigate("inicio")}><span className="nav-icon"><MenuIcon name="dashboard"/></span><span className="nav-label">Panel de Control</span></button>
        {sections.map((section) => <div className={`nav-section ${expanded[section.id] ? "open" : ""}`} key={section.id}>
          <button className="section-toggle" onClick={() => toggleSection(section.id)} aria-expanded={Boolean(expanded[section.id])}><span className="nav-icon"><MenuIcon name={section.icon}/></span><span className="nav-label">{section.title}</span><span className="chevron">⌄</span></button>
          <div className="section-items">{section.items.map(([label, key, icon]) => <button key={key} className={`nav-link ${vista === key ? "selected" : ""}`} onClick={() => navigate(key)}><span className="item-icon"><MenuIcon name={icon}/></span><span>{label}</span></button>)}</div>
        </div>)}
        {canManageUsers && <div className={`nav-section ${expanded.admin ? "open" : ""}`}><button className="section-toggle" onClick={() => toggleSection("admin")} aria-expanded={Boolean(expanded.admin)}><span className="nav-icon"><MenuIcon name="admin"/></span><span className="nav-label">Administración</span><span className="chevron">⌄</span></button><div className="section-items"><button className={`nav-link ${vista === "usuarios" ? "selected" : ""}`} onClick={() => navigate("usuarios")}><span className="item-icon"><MenuIcon name="clients"/></span><span>Usuarios y roles</span></button></div></div>}
      </nav>
      <div className="sidebar-user"><div className="avatar">{user.name?.charAt(0)}</div><div className="user-copy"><strong>{user.name}</strong><small>{user.role}</small></div><div className="sidebar-account-actions"><button title="Cambiar contraseña" onClick={onChangePassword}>Clave</button><button title="Cerrar sesión" onClick={onLogout}>Salir</button></div></div>
    </aside>
  </>;
}
