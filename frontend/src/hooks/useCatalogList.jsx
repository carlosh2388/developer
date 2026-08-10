import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

export function useCatalogList(path) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    setLoading(true); setError("");
    try { const result = await api(path); setRows(Array.isArray(result) ? result : []); }
    catch (cause) { setError(cause.message); }
    finally { setLoading(false); }
  }, [path]);
  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    const refresh = () => reload();
    window.addEventListener("avinext:records-changed", refresh);
    return () => window.removeEventListener("avinext:records-changed", refresh);
  }, [reload]);
  return { rows, loading, error, reload };
}

export function assertUniqueCode(rows, code, label = "código", excludeId = null) {
  const normalized = String(code || "").trim().toUpperCase();
  if (rows.some((row) => row.id !== excludeId && String(row.code || "").trim().toUpperCase() === normalized)) {
    throw new Error(`Ya existe un registro con el ${label} ${normalized}.`);
  }
}
