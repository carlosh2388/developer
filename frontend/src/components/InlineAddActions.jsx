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
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button type="button" onClick={onSave} style={{ ...baseStyle, backgroundColor: "#1976d2" }}>
        Guardar
      </button>
      <button type="button" onClick={onCancel} style={{ ...baseStyle, backgroundColor: "#c62828" }}>
        Cancelar
      </button>
    </div>
  );
}

export default InlineAddActions;
