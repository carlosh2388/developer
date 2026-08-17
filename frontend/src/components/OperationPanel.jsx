export default function OperationPanel({ children, maxWidth = 1200 }) {
  return <div className="operation-panel" style={{ position: "relative", maxWidth, margin: "0 auto", padding: 18, border: "1px solid #ccd5d0", borderRadius: 10, background: "#fff", boxSizing: "border-box" }}>
    {children}
  </div>;
}
