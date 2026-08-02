export default function Inicio({ user }) {
  return <div className="page-shell"><div className="welcome-card"><p className="eyebrow">PANEL PRINCIPAL</p><h1>Bienvenido, {user.name}</h1><p>Tu espacio de trabajo está listo. Selecciona un módulo para comenzar.</p><div className="summary-cards"><article><span>Sesión</span><strong>Protegida</strong></article><article><span>Rol asignado</span><strong>{user.role}</strong></article><article><span>Plataforma</span><strong>Operativa</strong></article></div></div></div>;
}

