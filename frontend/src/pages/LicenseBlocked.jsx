export default function LicenseBlocked({ message, onBack }) {
  return <div className="status-page"><div className="status-card">
    <div className="status-icon">!</div><p className="eyebrow">RENOVACIÓN REQUERIDA</p>
    <h1>Acceso temporalmente suspendido</h1>
    <p>{message}</p><p className="muted">Tus datos permanecen protegidos y estarán disponibles cuando el servicio sea reactivado.</p>
    <div className="contact-box"><strong>¿Necesitas ayuda?</strong><span>Comunícate con el área administrativa de AVINEXT.</span></div>
    <button onClick={onBack}>Volver al inicio de sesión</button>
  </div></div>;
}

