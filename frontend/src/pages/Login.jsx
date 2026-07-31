import { useState } from "react";
import { api } from "../services/api";

export default function Login({ onLogin, onLicenseBlocked, onResetActivation }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    if (!form.username.trim() || !form.password) return setMessage("Ingresa tu usuario y contraseña para continuar.");
    setLoading(true);
    try {
      const data = await api("/auth/login", { method: "POST", body: JSON.stringify(form) });
      localStorage.setItem("avinext_token", data.token);
      onLogin(data.user);
    } catch (error) {
      if (error.code === "LICENSE_PAYMENT_REQUIRED") onLicenseBlocked(error.message);
      else setMessage(error.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <section className="auth-brand">
        <div className="brand-mark">A</div>
        <p className="eyebrow">GESTIÓN AVÍCOLA INTELIGENTE</p>
        <h1>Control que impulsa el crecimiento de tu producción.</h1>
        <p>Administra inventarios, producción y trazabilidad desde una plataforma segura y centralizada.</p>
        <div className="brand-pills"><span>Seguro</span><span>Ágil</span><span>Confiable</span></div>
      </section>
      <section className="auth-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="mobile-brand">AVINEXT</div>
          <p className="eyebrow">ACCESO A LA PLATAFORMA</p>
          <h2>Bienvenido</h2>
          <p className="muted">Ingresa tus credenciales para continuar.</p>
          {message && <div className="alert alert-error" role="alert">{message}</div>}
          <label>Usuario
            <input type="text" autoComplete="username" placeholder="Ingresa tu usuario" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={loading} />
          </label>
          <label>Contraseña
            <div className="password-field">
              <input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Ingresa tu contraseña"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} disabled={loading} />
              <button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Ocultar" : "Mostrar"}</button>
            </div>
          </label>
          <button className="btn-primary login-button" disabled={loading}>{loading ? "Validando acceso…" : "Iniciar sesión"}</button>
          <p className="security-note">Acceso protegido y monitoreado por AVINEXT.</p>
          <button type="button" className="reset-activation" onClick={onResetActivation}>Cambiar activación de este equipo</button>
        </form>
      </section>
    </div>
  );
}
