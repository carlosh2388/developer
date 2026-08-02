import { useState } from "react";
import { api } from "../services/api";

export default function ChangePasswordModal({ onClose, onChanged }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmation: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setMessage("");
    if (form.newPassword.length < 8) return setMessage("La nueva contraseña debe tener al menos 8 caracteres.");
    if (form.newPassword !== form.confirmation) return setMessage("La confirmación no coincide.");
    setBusy(true);
    try {
      const result = await api("/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }) });
      onChanged(result.message);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <div className="password-modal-backdrop"><form className="password-modal" onSubmit={submit}><div className="password-modal-header"><div><p className="eyebrow">MI CUENTA</p><h2>Cambiar contraseña</h2></div><button type="button" className="modal-close" onClick={onClose}>×</button></div>{message && <div className="alert alert-error">{message}</div>}<label>Contraseña actual<input type="password" autoComplete="current-password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} required /></label><label>Nueva contraseña<input type="password" minLength="8" autoComplete="new-password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required /></label><label>Confirmar nueva contraseña<input type="password" minLength="8" autoComplete="new-password" value={form.confirmation} onChange={e => setForm({ ...form, confirmation: e.target.value })} required /></label><div className="form-actions"><button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button><button disabled={busy}>{busy ? "Actualizando…" : "Cambiar contraseña"}</button></div></form></div>;
}
