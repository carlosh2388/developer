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
import ControlPesoAves from "./pages/ControlPesoAves";
import ControlPesoHuevos from "./pages/ControlPesoHuevos";
import IngresoAlimento from "./pages/IngresoAlimento";
import EgresoAlimento from "./pages/EgresoAlimento";
import IngresoHuevos from "./pages/IngresoHuevos";
import EgresoHuevos from "./pages/EgresoHuevos";
import IngresoInsumos from "./pages/IngresoInsumos";
import EgresoInsumos from "./pages/EgresoInsumos";
import AjustesEntrada from "./pages/AjustesEntrada";
import AjusteSalida from "./pages/AjusteSalida";
import EgresoReproductores from "./pages/EgresoReproductores";

const views = {
  lotes: <Lotes />,
  bodegas: <Bodegas />,
  localidades: <Localidades />,
  productos: <Productos />,
  clientes: <Clientes />,
  controlPesoAves: <ControlPesoAves />,
  controlPesoHuevos: <ControlPesoHuevos />,
  IngresoAlimento: <IngresoAlimento />,
  EgresoAlimento: <EgresoAlimento />,
  ingresoHuevos: <IngresoHuevos />,
  egresoHuevos: <EgresoHuevos />,
  IngresoInsumos: <IngresoInsumos />,
  EgresoInsumos: <EgresoInsumos />,
  AjustesEntrada: <AjustesEntrada />,
  AjusteSalida: <AjusteSalida />,
  EgresoReproductores: <EgresoReproductores />,
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
