import { useEffect, useRef, useState } from "react";
import { notificationType } from "../services/notifications";

const labels = { success: "Operación exitosa", error: "No fue posible completar la operación", warning: "Atención", info: "Información" };
const icons = { success: "✓", error: "×", warning: "!", info: "i" };

export default function NotificationCenter() {
  const [items, setItems] = useState([]);
  const recent = useRef(new Map());

  useEffect(() => {
    const originalAlert = window.alert;
    const show = (detail = {}) => {
      const message = String(detail.message || "").trim();
      if (!message) return;
      const now = Date.now();
      if (now - (recent.current.get(message) || 0) < 1200) return;
      recent.current.set(message, now);
      const id = `${now}-${Math.random()}`;
      const type = detail.type || notificationType(message);
      setItems((current) => [...current.slice(-3), { id, message, type, title: detail.title || labels[type] }]);
      window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), type === "error" ? 6500 : 4500);
    };
    const listener = (event) => show(event.detail);
    window.addEventListener("avinext:notify", listener);
    window.alert = (message) => show({ message, type: notificationType(message) });
    return () => { window.removeEventListener("avinext:notify", listener); window.alert = originalAlert; };
  }, []);

  return <div className="notification-stack" role="region" aria-live="polite">
    {items.map((item) => <div key={item.id} className={`app-notification notification-${item.type}`}>
      <span className="notification-icon" aria-hidden="true">{icons[item.type]}</span>
      <div className="notification-copy"><strong>{item.title}</strong><p>{item.message}</p></div>
      <button type="button" className="notification-close" aria-label="Cerrar" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}>×</button>
      <span className="notification-progress" />
    </div>)}
  </div>;
}
