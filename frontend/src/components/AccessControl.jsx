import { Children, cloneElement, createContext, Fragment, isValidElement, useContext } from "react";

const AccessContext = createContext({ canWrite: true, canEdit: true });
export const AccessProvider = AccessContext.Provider;
export const useAccess = () => useContext(AccessContext);

const masterViews = new Set(["lotes", "bodegas", "localidades", "productos", "clientes", "proveedores", "lineasAvicolas", "empleados"]);
export const adjustmentViews = new Set(["AjustesEntrada", "AjusteSalida"]);
export const canManageAdjustments = (user) => ["ADMINISTRATOR", "PRODUCTION_MANAGER"].includes(user?.role);

export function viewAccess(user, view) {
  const permissions = user?.permissions || [];
  if (view === "usuarios") return { canWrite: permissions.includes("users.create"), canEdit: permissions.includes("users.update") };
  if (masterViews.has(view)) return { canWrite: permissions.includes("settings.manage"), canEdit: permissions.includes("settings.manage") };
  if (adjustmentViews.has(view)) return { canWrite: canManageAdjustments(user), canEdit: canManageAdjustments(user) };
  return { canWrite: permissions.includes("operations.create"), canEdit: permissions.includes("operations.approve") };
}

export function canOpenView(user, view) {
  if (view === "usuarios") return user?.permissions?.includes("users.read");
  if (adjustmentViews.has(view)) return canManageAdjustments(user);
  return user?.permissions?.includes("operations.read");
}

export function PermissionForm({ children, ...props }) {
  const { canWrite } = useAccess();
  return <form {...props} onSubmit={(event) => {
    if (!canWrite) { event.preventDefault(); return; }
    props.onSubmit?.(event);
  }}><ReadOnlyFields disabled={!canWrite}>{children}</ReadOnlyFields></form>;
}

export function ReadOnlyFields({ disabled, children }) {
  if (!disabled) return children;
  return Children.map(children, (child) => {
    if (!isValidElement(child) || child.type?.allowReadOnly) return child;
    if (typeof child.type === "string" || child.type === Fragment) {
      if (["input", "select", "textarea", "button"].includes(child.type)) return cloneElement(child, { disabled: true });
      return cloneElement(child, {}, <ReadOnlyFields disabled>{child.props.children}</ReadOnlyFields>);
    }
    return <fieldset disabled style={{ display: "contents", border: 0, padding: 0, margin: 0, minWidth: 0 }}>{child}</fieldset>;
  });
}

PermissionForm.allowReadOnly = true;
