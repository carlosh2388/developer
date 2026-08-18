import { useEffect, useRef, useState } from "react";
import { notificationType } from "../services/notifications";

const labels = { success: "Operación exitosa", error: "No fue posible completar la operación", warning: "Atención", info: "Información" };
const icons = { success: "✓", error: "×", warning: "!", info: "i" };

function clearFieldError(field) {
  field.classList.remove("field-invalid");
  field.removeAttribute("aria-invalid");
  field.parentElement?.querySelector(`.field-error-message[data-for="${field.name || field.id || "field"}"]`)?.remove();
}

function markFieldError(field, text = "Este campo es obligatorio.") {
  if (!field) return;
  clearFieldError(field);
  field.classList.add("field-invalid"); field.setAttribute("aria-invalid", "true");
  const message = document.createElement("small");
  message.className = "field-error-message"; message.dataset.for = field.name || field.id || "field"; message.textContent = text;
  field.insertAdjacentElement("afterend", message);
}

function showErrorsInMentionedFields(message) {
  if (!/(seleccion|complet|obligatori|requerid|vac[ií]o|ingres)/i.test(message)) return;
  const normalized = message.toLocaleLowerCase("es");
  let first;
  document.querySelectorAll("label").forEach((label) => {
    const field = label.querySelector("input:not([type=hidden]),select,textarea");
    if (!field || field.disabled || String(field.value || "").trim()) return;
    const words = label.textContent.toLocaleLowerCase("es").match(/[a-záéíóúñü]{4,}/g) || [];
    if (!words.some((word) => normalized.includes(word))) return;
    markFieldError(field); first ||= field;
  });
  first?.focus();
}

function editableFields(container) {
  return [...container.querySelectorAll("input:not([type=hidden]),select,textarea")]
    .filter((field) => !field.disabled && !field.readOnly && field.offsetParent !== null && !field.closest(".records-dialog"));
}

function fieldHasData(field) {
  if (field.type === "date" || field.type === "button" || field.type === "submit") return false;
  if (field.tagName === "SELECT" && ["ACTIVE", "INACTIVE", "Activo", "Inactivo"].includes(field.value)) return false;
  return String(field.value || "").trim() !== "" && !(field.type === "number" && Number(field.value) === 0);
}

function validateBeforeSave(container) {
  const fields = editableFields(container);
  const missing = new Map();
  fields.filter((field) => field.required && !String(field.value || "").trim())
    .forEach((field) => missing.set(field, "Este campo es obligatorio."));

  container.querySelectorAll("label").forEach((label) => {
    const nested = label.querySelector("input:not([type=hidden]),select,textarea");
    const sibling = label.nextElementSibling?.matches?.("input:not([type=hidden]),select,textarea") ? label.nextElementSibling : null;
    const field = nested || sibling;
    if (!field || field.disabled || field.readOnly || field.offsetParent === null || field.closest(".records-dialog")) return;
    if (!String(field.value || "").trim()) missing.set(field, "Completa este campo antes de guardar.");
  });

  container.querySelectorAll("tbody tr,.other-income-row").forEach((row) => {
    const direct = [...row.querySelectorAll(":scope > td > input:not([readonly]),:scope > td > select,:scope > input:not([readonly]),:scope > select")]
      .filter((field) => !field.disabled && field.offsetParent !== null);
    if (!direct.length) return;
    direct.filter((field) => !String(field.value || "").trim())
      .forEach((field) => missing.set(field, "Completa este campo para guardar la fila."));
  });

  if (missing.size) {
    missing.forEach((message, field) => markFieldError(field, message));
    const first = missing.keys().next().value; first?.focus();
    window.alert(`Completa los ${missing.size} campos obligatorios marcados en el formulario.`);
    return false;
  }
  const meaningful = fields.filter((field) => !field.closest(".notification-stack") && fieldHasData(field));
  if (!meaningful.length) {
    const first = fields.find((field) => field.required) || fields[0];
    markFieldError(first, "Ingresa o selecciona un dato antes de guardar."); first?.focus();
    window.alert("No existen datos para guardar. Completa el formulario antes de continuar.");
    return false;
  }
  return true;
}

export default function NotificationCenter() {
  const [items, setItems] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
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
      if (type === "error" || type === "warning") showErrorsInMentionedFields(message);
      setItems((current) => [...current.slice(-3), { id, message, type, title: detail.title || labels[type] }]);
      window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), type === "error" ? 4000 : 2800);
    };
    const listener = (event) => show(event.detail);
    window.addEventListener("avinext:notify", listener);
    window.alert = (message) => show({ message, type: notificationType(message) });
    return () => { window.removeEventListener("avinext:notify", listener); window.alert = originalAlert; };
  }, []);

  useEffect(() => {
    const invalid = (event) => {
      const field = event.target;
      event.preventDefault();
      markFieldError(field, field.validity.valueMissing ? "Este campo es obligatorio." : "Revisa el valor ingresado.");
      field.focus();
    };
    const input = (event) => { if (event.target.matches("input,select,textarea")) clearFieldError(event.target); };
    document.addEventListener("invalid", invalid, true);
    document.addEventListener("input", input, true);
    document.addEventListener("change", input, true);
    return () => { document.removeEventListener("invalid", invalid, true); document.removeEventListener("input", input, true); document.removeEventListener("change", input, true); };
  }, []);

  useEffect(() => {
    const listener = (event) => setConfirmation(event.detail);
    window.addEventListener("avinext:confirm", listener);
    return () => window.removeEventListener("avinext:confirm", listener);
  }, []);

  const answerConfirmation = (answer) => {
    confirmation?.resolve?.(answer);
    setConfirmation(null);
  };

  useEffect(() => {
    const validateSubmit = (event) => {
      if (!validateBeforeSave(event.target)) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    const validateClick = (event) => {
      const button = event.target.closest("button");
      if (!button || button.type === "submit" || !/guardar|registrar/i.test(button.textContent) || /etapa|galera|regi[oó]n|unidad|placa|piloto/i.test(button.textContent)) return;
      const container = button.closest("form") || button.closest(".operation-panel");
      if (container && !validateBeforeSave(container)) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    document.addEventListener("submit", validateSubmit, true);
    document.addEventListener("click", validateClick, true);
    return () => { document.removeEventListener("submit", validateSubmit, true); document.removeEventListener("click", validateClick, true); };
  }, []);

  return <>{confirmation && <div className="confirm-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) answerConfirmation(false); }}>
    <section className={`confirm-dialog confirm-${confirmation.type}`} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
      <div className="confirm-icon" aria-hidden="true">!</div><div className="confirm-copy"><span>ACCIÓN REQUERIDA</span><h3 id="confirm-title">{confirmation.title}</h3><p id="confirm-message">{confirmation.message}</p></div>
      <div className="confirm-actions"><button type="button" className="confirm-cancel" onClick={() => answerConfirmation(false)}>{confirmation.cancelLabel}</button><button type="button" className="confirm-accept" autoFocus onClick={() => answerConfirmation(true)}>{confirmation.confirmLabel}</button></div>
    </section>
  </div>}<div className="notification-stack" role="region" aria-live="polite">
    {items.map((item) => <div key={item.id} className={`app-notification notification-${item.type}`}>
      <span className="notification-icon" aria-hidden="true">{icons[item.type]}</span>
      <div className="notification-copy"><strong>{item.title}</strong><p>{item.message}</p></div>
      <button type="button" className="notification-close" aria-label="Cerrar" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}>×</button>
      <span className="notification-progress" />
    </div>)}
  </div></>;
}
