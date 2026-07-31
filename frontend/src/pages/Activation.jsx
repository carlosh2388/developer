import { useState } from "react";
import { api } from "../services/api";

export default function Activation({ onActivated }) {
  const [form, setForm] = useState({ installationId: "", licenseKey: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function activate(event) {
    event.preventDefault(); setMessage(""); setLoading(true);
    try {
      const result = await api("/license/activate", {
        method: "POST",
        body: JSON.stringify({ installationId: form.installationId.trim(), licenseKey: form.licenseKey.trim() }),
      });
      localStorage.setItem("avinext_license_certificate", result.certificate);
      localStorage.setItem("avinext_license_info", JSON.stringify({ organization: result.organization, installationId: result.installationId, expiresAt: result.expiresAt }));
      onActivated();
    } catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  }

  return <div className="activation-page"><section className="activation-card"><div className="brand-mark">A</div><p className="eyebrow">ACTIVACIÓN DE PLATAFORMA</p><h1>Activa esta instalación</h1><p className="muted">Este proceso se realiza una sola vez. Ingresa los datos proporcionados por el administrador de AVINEXT.</p>{message && <div className="alert alert-error">{message}</div>}<form onSubmit={activate}><label>Identificador de instalación<input value={form.installationId} onChange={e => setForm({ ...form, installationId: e.target.value })} placeholder="empresa-sucursal-equipo01" autoFocus required /></label><label>Clave de activación<input value={form.licenseKey} onChange={e => setForm({ ...form, licenseKey: e.target.value })} placeholder="AVX-..." autoComplete="off" required /></label><button className="btn-primary activation-button" disabled={loading}>{loading ? "Validando certificado…" : "Activar AVINEXT"}</button></form><div className="activation-help"><strong>¿No tienes una clave?</strong><span>Solicítala al administrador responsable de tu licencia.</span></div></section></div>;
}
