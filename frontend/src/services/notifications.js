export function notify(message, type = "info", title) {
  window.dispatchEvent(new CustomEvent("avinext:notify", { detail: { message: String(message || ""), type, title } }));
}

export function confirmAction(message, options = {}) {
  return new Promise((resolve) => window.dispatchEvent(new CustomEvent("avinext:confirm", {
    detail: { message: String(message || ""), title: options.title || "Confirmar acción", type: options.type || "danger", confirmLabel: options.confirmLabel || "Confirmar", cancelLabel: options.cancelLabel || "Cancelar", resolve },
  })));
}

export function notificationType(message) {
  const text = String(message || "").toLowerCase();
  if (/guardad|registrad|actualizad|cread|completad|correctamente|éxito|exito/.test(text)) return "success";
  if (/expir|sesión|sesion|advert|selecciona|obligatori|confirm|inactiv/.test(text)) return "warning";
  if (/error|no fue|no se pudo|inválid|invalid|rechaz|falta|no existe|incorrect/.test(text)) return "error";
  return "info";
}
