import { useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import { notify } from "../services/notifications";

const number = (value) => new Intl.NumberFormat("es-GT", { maximumFractionDigits: 0 }).format(Number(value || 0));

export default function InventoryAlertBell() {
  const [result, setResult] = useState({ alerts: [], critical: 0, warning: 0 });
  const [open, setOpen] = useState(false);
  const container = useRef(null);

  const load = async (showNotice = false) => {
    try {
      const data = await api("/reportes/alertas-inventario");
      setResult(data);
      if (!data.alerts.length) sessionStorage.removeItem("avinext_inventory_alerts");
      if (showNotice && data.alerts.length) {
        const signature = data.alerts.map((item) => `${item.code}:${item.severity}:${Math.floor(Number(item.stock_percentage))}`).join("|");
        if (sessionStorage.getItem("avinext_inventory_alerts") !== signature) {
          const criticalText = data.critical ? `${data.critical} en nivel crítico` : "";
          const warningText = data.warning ? `${data.warning} con existencia baja` : "";
          notify([criticalText, warningText].filter(Boolean).join(" y ") + ". Revisa la campana de inventario.", data.critical ? "error" : "warning", data.critical ? "Alerta crítica de inventario" : "Existencia baja");
          sessionStorage.setItem("avinext_inventory_alerts", signature);
        }
      }
    } catch (_error) { /* El tablero seguirá disponible aunque falle esta consulta secundaria. */ }
  };

  useEffect(() => {
    load(true);
    const changed = () => load(true);
    const timer = window.setInterval(() => load(true), 10_000);
    window.addEventListener("avinext:records-changed", changed);
    return () => { window.clearInterval(timer); window.removeEventListener("avinext:records-changed", changed); };
  }, []);
  useEffect(() => {
    const close = (event) => { if (container.current && !container.current.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const total = result.alerts.length;
  return <div className="inventory-alert-bell" ref={container}>
    <button type="button" className={`alert-bell-button ${result.critical ? "has-critical" : total ? "has-warning" : "is-healthy"}`} onClick={() => setOpen((value) => !value)} aria-label={total ? `${total} alertas de inventario` : "Inventario abastecido"} aria-expanded={open}>
      <svg className="bell-shape" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>{total > 0 && <b>{total > 99 ? "99+" : total}</b>}
    </button>
    {open && <section className="inventory-alert-panel">
      <header><div><span>CONTROL DE EXISTENCIAS</span><h3>Alertas de inventario</h3></div><button type="button" onClick={() => setOpen(false)} aria-label="Cerrar">×</button></header>
      <div className="alert-level-summary">{!total && <span className="healthy"><i/>Abastecido</span>}<span className="critical"><i/>{result.critical} críticas</span><span className="warning"><i/>{result.warning} preventivas</span></div>
      <div className="inventory-alert-list">{total ? result.alerts.map((item) => <article key={item.id} className={item.severity === "CRITICAL" ? "critical" : "warning"}>
        <div className="inventory-alert-icon">{item.severity === "CRITICAL" ? "!" : "▲"}</div><div><strong>{item.name}</strong><span>{item.code} · {number(item.current_stock)} {item.unit_code}</span><div className="inventory-level-track"><i style={{ width: `${Math.min(100, Math.max(2, Number(item.stock_percentage)))}%` }}/></div></div><b>{Number(item.stock_percentage).toFixed(0)}%</b>
      </article>) : <div className="inventory-alert-empty"><span>✓</span><strong>Inventario en buen nivel</strong><p>No hay productos por debajo del 50%.</p></div>}</div>
      <footer><span className="critical">Rojo: ≤35%</span><span className="warning">Amarillo: 36–50%</span><span className="healthy">Verde: &gt;50%</span><button type="button" onClick={() => load(false)}>↻ Actualizar</button></footer>
    </section>}
  </div>;
}
