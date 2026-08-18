import { useEffect, useState } from "react";
import "./assets/styles.css";
import { api } from "./services/api";
import Sidebar from "./components/Sidebar";
import ChangePasswordModal from "./components/ChangePasswordModal";
import Login from "./pages/Login";
import LicenseBlocked from "./pages/LicenseBlocked";
import Activation from "./pages/Activation";
import Usuarios from "./pages/Usuarios";
import Inicio from "./pages/Inicio";
import Lotes from "./pages/Lotes";
import Bodegas from "./pages/Bodegas";
import Localidades from "./pages/Localidades";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";
import Proveedores from "./pages/Proveedores";
import ControlPesoAves from "./pages/ControlPesoAves";
import ControlPesoHuevos from "./pages/ControlPesoHuevos";
import IngresoAlimento from "./pages/IngresoAlimento";
import EgresoAlimento from "./pages/EgresoAlimento";
import IngresoHuevos from "./pages/IngresoHuevos";
import EgresoHuevos from "./pages/EgresoHuevos";
import AjustesEntrada from "./pages/AjustesEntrada";
import AjusteSalida from "./pages/AjusteSalida";
import EgresoReproductores from "./pages/EgresoReproductores";
import OtrosIngresos from "./pages/OtrosIngresos";
import EgresoInsumos from "./pages/EgresoInsumos";
import LineasAvicolas from "./pages/LineasAvicolas";
import Reportes from "./pages/Reportes";
import Empleados from "./pages/Empleados";
import { notify } from "./services/notifications";

const views = {
  lotes: <Lotes />,
  bodegas: <Bodegas />,
  localidades: <Localidades />,
  productos: <Productos />,
  clientes: <Clientes />,
  proveedores: <Proveedores />, 
  controlPesoAves: <ControlPesoAves />,
  controlPesoHuevos: <ControlPesoHuevos />,
  IngresoAlimento: <IngresoAlimento />,
  EgresoAlimento: <EgresoAlimento />,
  ingresoHuevos: <IngresoHuevos />,
  egresoHuevos: <EgresoHuevos />,
  AjustesEntrada: <AjustesEntrada />,
  AjusteSalida: <AjusteSalida />,
  EgresoReproductores: <EgresoReproductores />,
  OtrosIngresos: <OtrosIngresos />,
  EgresoInsumos: <EgresoInsumos />,
  lineasAvicolas: <LineasAvicolas />,
  empleados: <Empleados />,
};

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [vista, setVista] = useState("inicio");
  const [licenseMessage, setLicenseMessage] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [activated, setActivated] = useState(() =>
    Boolean(localStorage.getItem("avinext_license_certificate")),
  );
  useEffect(() => {
    if (!activated) {
      setChecking(false);
      return;
    }
    const token = localStorage.getItem("avinext_token");
    if (!token) {
      setChecking(false);
      return;
    }
    api("/auth/me")
      .then((d) => setUser(d.user))
      .catch((error) => {
        localStorage.removeItem("avinext_token");
        if (
          ["ACTIVATION_REQUIRED", "CERTIFICATE_INVALID"].includes(error.code)
        ) {
          localStorage.removeItem("avinext_license_certificate");
          setActivated(false);
        } else if (error.code === "LICENSE_PAYMENT_REQUIRED")
          setLicenseMessage(error.message);
      })
      .finally(() => setChecking(false));
  }, [activated]);
  useEffect(() => {
    const sessionExpired = () => {
      setShowChangePassword(false);
      setUser(null);
      setVista("inicio");
    };
    window.addEventListener("avinext:session-expired", sessionExpired);
    return () => window.removeEventListener("avinext:session-expired", sessionExpired);
  }, []);
  useEffect(() => {
    if (!user) return undefined;
    let token = localStorage.getItem("avinext_token");
    let idleTimer;
    let lastHandledActivity = 0;
    let lastRefresh = 0;
    let refreshing = false;
    try {
      const readPayload = (value) => {
        const encodedPayload = value.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const paddedPayload = encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");
        return JSON.parse(atob(paddedPayload));
      };
      const payload = readPayload(token);
      const sessionDuration = Math.max(60_000, (Number(payload.exp) - Number(payload.iat)) * 1000);
      lastRefresh = Number(payload.iat) * 1000;
      const expire = () => {
        localStorage.removeItem("avinext_token");
        notify("Tu sesión ha expirado por seguridad. Inicia sesión nuevamente.", "warning", "Sesión finalizada");
        window.dispatchEvent(new CustomEvent("avinext:session-expired"));
      };
      const resetIdleTimer = () => {
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(expire, sessionDuration);
      };
      const renewSession = async () => {
        if (refreshing || Date.now() - lastRefresh < sessionDuration / 2) return;
        refreshing = true;
        try {
          const data = await api("/auth/refresh", { method: "POST" });
          token = data.token;
          localStorage.setItem("avinext_token", token);
          lastRefresh = Date.now();
        } catch (_error) {
          // La capa de API gestiona y notifica una sesión que ya no sea válida.
        } finally {
          refreshing = false;
        }
      };
      const handleActivity = () => {
        const now = Date.now();
        if (now - lastHandledActivity < 1000) return;
        lastHandledActivity = now;
        resetIdleTimer();
        renewSession();
      };
      const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
      const remaining = Number(payload.exp) * 1000 - Date.now();
      if (remaining <= 0) { expire(); return undefined; }
      idleTimer = window.setTimeout(expire, remaining);
      events.forEach((eventName) => window.addEventListener(eventName, handleActivity, { passive: true }));
      return () => {
        window.clearTimeout(idleTimer);
        events.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
      };
    } catch (_error) {
      return undefined;
    }
  }, [user]);
  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (_e) {}
    localStorage.removeItem("avinext_token");
    setUser(null);
    setVista("inicio");
  }
  if (checking)
    return (
      <div className="app-loader">
        <div className="spinner" />
        <p>Validando sesión segura…</p>
      </div>
    );
  if (!activated)
    return (
      <Activation
        onActivated={() => {
          setActivated(true);
          setChecking(false);
        }}
      />
    );
  if (licenseMessage)
    return (
      <LicenseBlocked
        message={licenseMessage}
        onBack={() => setLicenseMessage("")}
      />
    );
  if (!user)
    return (
      <Login
        onLogin={setUser}
        onLicenseBlocked={setLicenseMessage}
        onResetActivation={() => {
          localStorage.removeItem("avinext_license_certificate");
          localStorage.removeItem("avinext_license_info");
          localStorage.removeItem("avinext_token");
          setActivated(false);
        }}
      />
    );
  const content =
    vista === "inicio" ? (
      <Inicio user={user} />
    ) : vista === "usuarios" ? (
      <Usuarios />
    ) : vista === "reportes" ? (
      <Reportes user={user} />
    ) : (
      views[vista] || <Inicio user={user} />
    );
  return (
    <div className="app-layout">
      <Sidebar
        setVista={setVista}
        vista={vista}
        user={user}
        onLogout={logout}
        onChangePassword={() => setShowChangePassword(true)}
      />
      <main className="main-content">{content}</main>
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onChanged={(message) => {
            window.alert(message);
            localStorage.removeItem("avinext_token");
            setShowChangePassword(false);
            setUser(null);
          }}
        />
      )}
    </div>
  );
}
