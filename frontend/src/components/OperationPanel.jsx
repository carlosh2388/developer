import { ReadOnlyFields, useAccess } from "./AccessControl";

export default function OperationPanel({ children, maxWidth = 1200 }) {
  const { canWrite } = useAccess();
  return <div className="operation-panel" style={{ position: "relative", maxWidth, margin: "0 auto", padding: 18, border: "1px solid #CDD0DD", borderRadius: 10, background: "#fff", boxSizing: "border-box" }}>
    <ReadOnlyFields disabled={!canWrite}>{children}</ReadOnlyFields>
  </div>;
}
