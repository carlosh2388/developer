import { useMemo, useState } from "react";

const sections = [
  { id: "reports", title: "Reportes", icon: "▤", items: [["Producción por granja","reportes"]] },
  { id: "config", title: "Configuración", icon: "⚙", items: [["Líneas avícolas","lineasAvicolas"],["Lotes","lotes"],["Bodegas","bodegas"],["Productos","productos"],["Clientes","clientes"],["Proveedores","proveedores"],["Empleados","empleados"]] },
  { id: "controls", title: "Controles", icon: "✓", items: [["Peso en aves","controlPesoAves"],["Peso en huevos","controlPesoHuevos"]] },
  { id: "moves", title: "Movimientos", icon: "↔", items: [["Ingreso de alimento","IngresoAlimento"],["Egreso de alimento","EgresoAlimento"],["Otros ingresos","IngresoInsumos"],["Otros egresos","EgresoInsumos"],["Ingreso de huevos","ingresoHuevos"],["Egreso de huevos","egresoHuevos"],["Ajustes de entrada","AjustesEntrada"],["Ajustes de salida","AjusteSalida"],["Egreso de reproductores","EgresoReproductores"]] },
];

export default function Sidebar({ setVista, vista, user, onLogout, onChangePassword }) {
  const canManageUsers = user.permissions?.includes("users.read");
  const activeSection = useMemo(() => sections.find(section => section.items.some(([,key]) => key === vista))?.id || (vista === "usuarios" ? "admin" : null), [vista]);
  const [expanded, setExpanded] = useState(() => activeSection ? { [activeSection]: true } : {});
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  function navigate(key) { setVista(key); setMobileOpen(false); }
  function toggleSection(id) { if (collapsed) setCollapsed(false); setExpanded(current => ({ ...current, [id]: !current[id] })); }

  return <>
    <button className="mobile-menu-trigger" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">☰</button>
    {mobileOpen && <button className="sidebar-overlay" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" />}
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-brand"><span className="brand-mark small">A</span><div className="brand-copy"><strong>AVINEXT</strong><small>Gestión avícola</small></div><button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expandir menú" : "Ocultar menú"}>{collapsed ? "›" : "‹"}</button><button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú">×</button></div>
      <nav className="menu">
        <button className={`nav-link home-link ${vista === "inicio" ? "selected" : ""}`} onClick={() => navigate("inicio")}><span className="nav-icon">⌂</span><span className="nav-label">Resumen</span></button>
        {sections.map(section => <div className={`nav-section ${expanded[section.id] ? "open" : ""}`} key={section.id}><button className="section-toggle" onClick={() => toggleSection(section.id)} aria-expanded={Boolean(expanded[section.id])}><span className="nav-icon">{section.icon}</span><span className="nav-label">{section.title}</span><span className="chevron">⌄</span></button><div className="section-items">{section.items.map(([label,key]) => <button key={key} className={`nav-link ${vista === key ? "selected" : ""}`} onClick={() => navigate(key)}><span className="item-dot"/><span>{label}</span></button>)}</div></div>)}
        {canManageUsers && <div className={`nav-section ${expanded.admin ? "open" : ""}`}><button className="section-toggle" onClick={() => toggleSection("admin")} aria-expanded={Boolean(expanded.admin)}><span className="nav-icon">♙</span><span className="nav-label">Administración</span><span className="chevron">⌄</span></button><div className="section-items"><button className={`nav-link ${vista === "usuarios" ? "selected" : ""}`} onClick={() => navigate("usuarios")}><span className="item-dot"/><span>Usuarios y roles</span></button></div></div>}
      </nav>
      <div className="sidebar-user"><div className="avatar">{user.name?.charAt(0)}</div><div className="user-copy"><strong>{user.name}</strong><small>{user.role}</small></div><div className="sidebar-account-actions"><button title="Cambiar contraseña" onClick={onChangePassword}>Clave</button><button title="Cerrar sesión" onClick={onLogout}>Salir</button></div></div>
    </aside>
  </>;
}
