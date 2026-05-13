import { useEffect, useState } from "react";

function Lotes() {

  // =========================
  // STATES
  // =========================

  const [lote, setLote] = useState("");
  const [fecha, setFecha] = useState("");
  const [variedades, setVariedades] = useState([]);
  const [galeras, setGaleras] = useState([]);

  const [nuevaVariedad, setNuevaVariedad] = useState("");
  const [nuevaGalera, setNuevaGalera] = useState("");

  const [variedad, setVariedad] = useState("");
  const [galera, setGalera] = useState("");

  const [hembras, setHembras] = useState(0);
  const [machos, setMachos] = useState(0);

  const [cantidadImportada, setCantidadImportada] = useState(0);

  const [costo, setCosto] = useState(0);
  const [costoUnitario, setCostoUnitario] = useState(0);

  const [estado, setEstado] = useState("Activo");

  // =========================
  // UI STATES (TOGGLE INPUTS)
  // =========================

  const [showNuevaVariedad, setShowNuevaVariedad] = useState(false);
  const [showNuevaGalera, setShowNuevaGalera] = useState(false);

  // =========================
  // GENERAR LOTE
  // =========================

  const generarLote = () => {
    const now = new Date();

    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `REP-${year}${month}${day}-${hours}${minutes}`;
  };

  // =========================
  // FECHA ACTUAL
  // =========================

  const setFechaActual = () => {
    const today = new Date().toISOString().split("T")[0];
    setFecha(today);
  };

  // =========================
  // INIT
  // =========================

  useEffect(() => {
    setLote(generarLote());
    setFechaActual();
  }, []);

  // =========================
  // AGREGAR OPCIONES
  // =========================

  const guardarVariedad = () => {
    if (!nuevaVariedad.trim()) return;

    setVariedades([...variedades, nuevaVariedad]);
    setVariedad(nuevaVariedad);

    setNuevaVariedad("");
    setShowNuevaVariedad(false);
  };

  const guardarGalera = () => {
    if (!nuevaGalera.trim()) return;

    setGaleras([...galeras, nuevaGalera]);
    setGalera(nuevaGalera);

    setNuevaGalera("");
    setShowNuevaGalera(false);
  };

  // =========================
  // TOTALES
  // =========================

  useEffect(() => {
    const total = Number(hembras) + Number(machos);

    setCantidadImportada(total);

    if (total > 0) {
      setCostoUnitario((Number(costo) / total).toFixed(2));
    } else {
      setCostoUnitario(0);
    }
  }, [hembras, machos, costo]);

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      lote,
      fecha,
      estado,
      variedad,
      galera,
      hembras,
      machos,
      cantidadImportada,
      costo,
      costoUnitario
    };

    console.log(data);
    alert("Lote guardado correctamente");
  };

  // =========================
  // RENDER
  // =========================

  return (
    <form onSubmit={handleSubmit}>

      <h2>Registro de Lotes</h2>

      {/* =========================
          LINEA 1: FECHA + LOTE + ESTADO
      ========================= */}
      <div className="row">

        <div>
          <label>Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>

        <div>
          <label># Lote</label>
          <input type="text" value={lote} readOnly />
        </div>

        <div>
          <label>Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

      </div>

      {/* =========================
          LINEA 2: VARIEDAD + GALERA
      ========================= */}
      <div className="row">

        {/* VARIEDAD */}
        <div style={{ flex: 1 }}>
          <label>Variedad</label>

          <div className="row">

            {!showNuevaVariedad ? (
              <>
                <select
                  value={variedad}
                  onChange={(e) => setVariedad(e.target.value)}
                >
                  <option value="">Seleccione</option>
                  {variedades.map((v, i) => (
                    <option key={i} value={v}>{v}</option>
                  ))}
                </select>

                <button
                  type="button"
                  style={{ width: "5ch" }}
                  onClick={() => setShowNuevaVariedad(true)}
                >
                  +
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={nuevaVariedad}
                  onChange={(e) => setNuevaVariedad(e.target.value)}
                  placeholder="Nueva variedad"
                />

                <button type="button" onClick={guardarVariedad}>
                  Guardar
                </button>
              </>
            )}

          </div>
        </div>

        {/* GALERA */}
        <div style={{ flex: 1 }}>
          <label>Galera</label>

          <div className="row">

            {!showNuevaGalera ? (
              <>
                <select
                  value={galera}
                  onChange={(e) => setGalera(e.target.value)}
                >
                  <option value="">Seleccione</option>
                  {galeras.map((g, i) => (
                    <option key={i} value={g}>{g}</option>
                  ))}
                </select>

                <button
                  type="button"
                  style={{ width: "5ch" }}
                  onClick={() => setShowNuevaGalera(true)}
                >
                  +
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={nuevaGalera}
                  onChange={(e) => setNuevaGalera(e.target.value)}
                  placeholder="Nueva galera"
                />

                <button type="button" onClick={guardarGalera}>
                  Guardar
                </button>
              </>
            )}

          </div>
        </div>

      </div>

      {/* =========================
          LINEA 3: HEMBRAS + MACHOS + TOTAL
      ========================= */}
      <div className="row">

        <div>
          <label>Hembras</label>
          <input type="number" value={hembras} onChange={(e) => setHembras(e.target.value)} />
        </div>

        <div>
          <label>Machos</label>
          <input type="number" value={machos} onChange={(e) => setMachos(e.target.value)} />
        </div>

        <div>
          <label>Total</label>
          <input type="number" value={cantidadImportada} readOnly />
        </div>

      </div>

      {/* =========================
          LINEA 4: COSTOS
      ========================= */}
      <div className="row">

        <div>
          <label>Costo (Q)</label>
          <input type="number" value={costo} onChange={(e) => setCosto(e.target.value)} />
        </div>

        <div>
          <label>Costo Unitario</label>
          <input type="number" value={costoUnitario} readOnly />
        </div>

      </div>

      <button type="submit">Guardar</button>

    </form>
  );
}

export default Lotes;