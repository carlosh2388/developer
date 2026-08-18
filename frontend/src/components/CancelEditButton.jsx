import { useEffect, useRef } from "react";

export default function CancelEditButton({ editing, onCancel }) {
  const buttonRef = useRef(null);
  useEffect(() => {
    const container = buttonRef.current?.parentElement;
    if (!container) return undefined;
    container.classList.add("edit-actions-active");
    return () => container.classList.remove("edit-actions-active");
  }, [editing]);
  if (!editing) return null;
  return <button ref={buttonRef} type="button" className="cancel-edit-button" onClick={onCancel}><span aria-hidden="true">&#10005;</span> Cancelar edición</button>;
}
