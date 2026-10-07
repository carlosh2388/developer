function InlineAddActions({ onSave, onCancel }) {
  const baseStyle = {
    border: "none",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    minHeight: 38,
    padding: "8px 16px",
  };

  return (
    <div className="inline-add-actions" style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
      <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onSave?.(event); }} style={{ ...baseStyle, backgroundColor: "#1976d2" }}>
        Guardar
      </button>
      <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onCancel?.(event); }} style={{ ...baseStyle, backgroundColor: "#c62828" }}>
        Cancelar
      </button>
    </div>
  );
}

export default InlineAddActions;
