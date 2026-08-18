import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const movementLabel = {
  INPUT: "Entrada", OUTPUT: "Salida", ADJUSTMENT_IN: "Ajuste de entrada", ADJUSTMENT_OUT: "Ajuste de salida",
};
const number = (value) => new Intl.NumberFormat("es-GT", { maximumFractionDigits: 0 }).format(Number(value || 0));
const shortDate = (value) => new Intl.DateTimeFormat("es-GT", { day: "2-digit", month: "short" }).format(new Date(`${String(value).slice(0, 10)}T12:00:00`));
const ranges = [{ value: "24h", label: "24 horas" }, { value: "7d", label: "7 días" }, { value: "15d", label: "15 días" }, { value: "30d", label: "1 mes" }];

function BarTooltip({ type, total, products }) {
  return <div className={`trend-tooltip ${type}`}><strong>{type === "input" ? "Entradas" : "Salidas"}: {number(total)}</strong>
    <div>{products?.length ? products.map((product) => <span key={product.code}><i>{product.name}</i><b>{number(product.quantity)}</b></span>) : <small>Sin movimientos</small>}</div>
  </div>;
}

export default function Inicio({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("7d");
  const [lastUpdated, setLastUpdated] = useState(null);
  const load = async (selectedRange = range, silent = false) => {
    try { if (!silent) setLoading(true); setError(""); setData(await api(`/reportes/dashboard?range=${selectedRange}`)); setLastUpdated(new Date()); }
    catch (requestError) { setError(requestError.message); }
    finally { if (!silent) setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const refresh = () => load(range, true);
    const timer = window.setInterval(refresh, 10_000);
    window.addEventListener("avinext:records-changed", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("avinext:records-changed", refresh); };
  }, [range]);
  const chartMax = useMemo(() => Math.max(1, ...(data?.trend || []).flatMap((row) => [Number(row.inputs), Number(row.outputs)])), [data]);
  const typeMax = useMemo(() => Math.max(1, ...(data?.byType || []).map((row) => Number(row.quantity))), [data]);
  const summary = data?.summary || {};
  const selectRange = (value) => { setRange(value); load(value); };
  const trendLabel = (value, index) => {
    const date = new Date(value);
    if (range === "24h") return index % 4 === 0 || index === 23 ? `${String(date.getHours()).padStart(2, "0")}:00` : "";
    const interval = range === "30d" ? 5 : range === "15d" ? 3 : 1;
    return index % interval === 0 || index === data.trend.length - 1 ? shortDate(value) : "";
  };

  return <div className="page-shell dashboard-page">
    <header className="dashboard-header">
      <div><p className="eyebrow">PANEL PRINCIPAL</p><h1>Bienvenido, {user.name}</h1><p>Resumen operativo de inventario actualizado al día de hoy.</p></div>
      <div className="dashboard-live"><span/><div><strong>En tiempo real</strong><small>{lastUpdated ? `Actualizado ${lastUpdated.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "Sincronizando…"}</small></div></div>
    </header>
    {error && <div className="dashboard-error"><strong>No fue posible cargar el resumen.</strong><span>{error}</span><button type="button" onClick={() => load(range)}>Reintentar</button></div>}
    {loading && !data ? <div className="dashboard-loading"><span/><p>Preparando indicadores…</p></div> : data && <>
      <section className="dashboard-kpis" aria-label="Indicadores principales">
        <article className="dashboard-kpi kpi-stock"><div className="kpi-icon">▦</div><div><span>Existencia actual</span><strong>{number(summary.current_stock)}</strong><small>Cantidad total disponible</small></div></article>
        <article className="dashboard-kpi kpi-in"><div className="kpi-icon">↘</div><div><span>Entradas del mes</span><strong>{number(summary.month_inputs)}</strong><small>Ingresos y ajustes de entrada</small></div></article>
        <article className="dashboard-kpi kpi-out"><div className="kpi-icon">↗</div><div><span>Salidas del mes</span><strong>{number(summary.month_outputs)}</strong><small>Egresos y ajustes de salida</small></div></article>
        <article className="dashboard-kpi kpi-products"><div className="kpi-icon">▣</div><div><span>Productos activos</span><strong>{number(summary.active_products)}</strong><small>Catálogo disponible</small></div></article>
      </section>
      <section className="dashboard-grid">
        <article className="dashboard-card dashboard-trend"><div className="dashboard-card-title"><div><h2>Movimiento de inventario</h2><p>{ranges.find((item) => item.value === range)?.label}</p></div><div className="chart-legend"><span className="legend-in">Entradas</span><span className="legend-out">Salidas</span></div></div>
          <div className="trend-ranges" role="group" aria-label="Período de la gráfica">{ranges.map((item) => <button type="button" key={item.value} className={range === item.value ? "active" : ""} onClick={() => selectRange(item.value)} disabled={loading}>{item.label}</button>)}</div>
          <div className="trend-chart">{data.trend.map((row, index) => <div className="trend-day" key={row.period}><div className="trend-bars">
            <div className="trend-bar-wrap" style={{ height: `${Math.max(Number(row.inputs) ? 8 : 0, Number(row.inputs) / chartMax * 100)}%` }}><i className="bar-in"/><BarTooltip type="input" total={row.inputs} products={row.input_products}/></div>
            <div className="trend-bar-wrap" style={{ height: `${Math.max(Number(row.outputs) ? 8 : 0, Number(row.outputs) / chartMax * 100)}%` }}><i className="bar-out"/><BarTooltip type="output" total={row.outputs} products={row.output_products}/></div>
          </div><span>{trendLabel(row.period, index)}</span></div>)}</div>
        </article>
        <article className="dashboard-card"><div className="dashboard-card-title"><div><h2>Existencia por categoría</h2><p>Distribución del inventario actual</p></div></div>
          <div className="category-list">{data.byType.length ? data.byType.map((row) => <div className="category-row" key={row.product_type}><div><span>{row.label}</span><strong>{number(row.quantity)}</strong></div><div className="category-track"><i style={{ width: `${Math.max(2, Number(row.quantity) / typeMax * 100)}%` }}/></div></div>) : <p className="dashboard-empty">No hay productos activos.</p>}</div>
        </article>
        <article className="dashboard-card"><div className="dashboard-card-title"><div><h2>Existencias más bajas</h2><p>Productos que requieren seguimiento</p></div></div>
          <div className="stock-watch">{data.lowStock.length ? data.lowStock.map((item) => <div className="stock-item" key={item.code}><span className={Number(item.quantity) <= 0 ? "stock-dot critical" : "stock-dot"}/><div><strong>{item.name}</strong><small>{item.code}</small></div><b>{number(item.quantity)} <small>{item.unit || ""}</small></b></div>) : <p className="dashboard-empty">No hay existencias para mostrar.</p>}</div>
        </article>
        <article className="dashboard-card"><div className="dashboard-card-title"><div><h2>Movimientos recientes</h2><p>Últimos documentos registrados</p></div></div>
          <div className="recent-list">{data.recent.length ? data.recent.map((item) => { const incoming = ["INPUT", "ADJUSTMENT_IN"].includes(item.movement_type); return <div className="recent-item" key={item.id}><span className={incoming ? "movement-badge incoming" : "movement-badge outgoing"}>{incoming ? "↓" : "↑"}</span><div><strong>{movementLabel[item.movement_type] || item.movement_type}</strong><small title={item.products}>{item.products}</small></div><div><b>{number(item.quantity)}</b><small>{shortDate(item.movement_date)}</small></div></div>; }) : <p className="dashboard-empty">Todavía no hay movimientos.</p>}</div>
        </article>
      </section>
    </>}
  </div>;
}
