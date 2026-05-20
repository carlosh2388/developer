import { useEffect, useState } from "react";

function Lotes() {

  // =========================
  // STATES
  // =========================

  const [lote, setLote] = useState("");

  const [fecha, setFecha] = useState("");

  // LISTAS
  const [lineas, setLineas] = useState([
    "LIN-ISA	ISA Brown (Marrón)",
    "LIN-SPN Super Nick (Blanco)"
  ]);

  const [galeras, setGaleras] = useState([
    "Galera 1",
    "Galera 2",
    "Galera 3",
    "Galera 4",
    "Galera 5",
    "Galera de Crianza"
  ]);

  // SELECCIÓN
  const [linea, setLinea] = useState("");
  const [galera, setGalera] = useState("");

  // NUEVOS
  const [nuevaLinea, setNuevaLinea] = useState("");
  const [nuevaGalera, setNuevaGalera] = useState("");

  const [mostrarNuevaLinea, setMostrarNuevaLinea] = useState(false);
  const [mostrarNuevaGalera, setMostrarNuevaGalera] = useState(false);

  // PRODUCCIÓN
  const [hembras, setHembras] = useState(0);
  const [machos, setMachos] = useState(0);
  const [cantidadImportada, setCantidadImportada] = useState(0);

  const [costo, setCosto] = useState(0);
  const [costoUnitario, setCostoUnitario] = useState(0);

  const [estado, setEstado] = useState("Activo");

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

    const today = new Date()
      .toISOString()
      .split("T")[0];

    setFecha(today);
  };

  // =========================
  // AGREGAR LÍNEA
  // =========================

  const agregarLinea = () => {

    if (!nuevaLinea.trim()) return;

    const nueva = nuevaLinea.trim();

    setLineas([...lineas, nueva]);
    setLinea(nueva);

    setNuevaLinea("");
    setMostrarNuevaLinea(false);
  };

  // =========================
  // AGREGAR GALERA
  // =========================

  const agregarGalera = () => {

    if (!nuevaGalera.trim()) return;

    const nueva = nuevaGalera.trim();

    setGaleras([...galeras, nueva]);
    setGalera(nueva);

    setNuevaGalera("");
    setMostrarNuevaGalera(false);
  };

  // =========================
  // CÁLCULOS
  // =========================

  useEffect(() => {

    const total =
      Number(hembras) + Number(machos);

    setCantidadImportada(total);

    if (total > 0 && Number(costo) > 0) {

      setCostoUnitario(
        Number(costo) / total
      );

    } else {

      setCostoUnitario(0);
    }

  }, [hembras, machos, costo]);

  // =========================
  // INIT
  // =========================

  useEffect(() => {

    setLote(generarLote());
    setFechaActual();

  }, []);

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = (e) => {

    e.preventDefault();

    const data = {

      lote,
      fecha,
      linea,
      galera,
      hembras,
      machos,
      cantidadImportada,
      costo,
      costoUnitario,
      estado
    };

    console.log(data);

    alert("Lote guardado correctamente");
  };

  // =========================
  // ESTILOS
  // =========================

  const styles = {

    form: {
      maxWidth: "1100px",
      margin: "0 auto",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      fontFamily: "Arial"
    },

    row: {
      display: "flex",
      gap: "15px",
      width: "100%",
      alignItems: "flex-end"
    },

    field: {
      flex: 1,
      display: "flex",
      flexDirection: "column"
    },

    input: {
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      fontSize: "14px",
      width: "100%",
      boxSizing: "border-box"
    },

    button: {
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      backgroundColor: "#1976d2",
      color: "#fff",
      cursor: "pointer",
      fontSize: "14px"
    },

    addButton: {
      width: "42px",
      height: "42px",
      border: "none",
      borderRadius: "5px",
      backgroundColor: "#1976d2",
      color: "#fff",
      cursor: "pointer",
      fontSize: "20px",
      fontWeight: "bold",
      flexShrink: 0
    }
  };

  // =========================
  // RENDER
  // =========================

  return (

    <form onSubmit={handleSubmit} style={styles.form}>

      <h2>Registro de Lotes</h2>

      {/* LOTE - FECHA - ESTADO */}
      <div style={styles.row}>

        <div style={styles.field}>
          <label># Lote</label>
          <input value={lote} readOnly style={styles.input} />
        </div>

        <div style={styles.field}>
          <label>Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={styles.input} />
        </div>

        <div style={styles.field}>
          <label>Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)} style={styles.input}>
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
        </div>

      </div>

      {/* LÍNEA Y GALERA */}
      <div style={styles.row}>

        {/* LÍNEA */}
        <div style={styles.field}>
          <label>Línea</label>

          <div style={styles.row}>
            <select
              value={linea}
              onChange={(e) => setLinea(e.target.value)}
              style={styles.input}
            >
              <option value="">Seleccione</option>
              {lineas.map((v, i) => (
                <option key={i} value={v}>{v}</option>
              ))}
            </select>

            {mostrarNuevaLinea && (
              <input
                value={nuevaLinea}
                onChange={(e) => setNuevaLinea(e.target.value)}
                style={styles.input}
                placeholder="Nueva línea"
              />
            )}

            <button
              type="button"
              onClick={() =>
                mostrarNuevaLinea ? agregarLinea() : setMostrarNuevaLinea(true)
              }
              style={styles.addButton}
            >
              +
            </button>
          </div>
        </div>

        {/* GALERA */}
        <div style={styles.field}>
          <label>Galera</label>

          <div style={styles.row}>
            <select
              value={galera}
              onChange={(e) => setGalera(e.target.value)}
              style={styles.input}
            >
              <option value="">Seleccione</option>
              {galeras.map((g, i) => (
                <option key={i} value={g}>{g}</option>
              ))}
            </select>

            {mostrarNuevaGalera && (
              <input
                value={nuevaGalera}
                onChange={(e) => setNuevaGalera(e.target.value)}
                style={styles.input}
                placeholder="Nueva galera"
              />
            )}

            <button
              type="button"
              onClick={() =>
                mostrarNuevaGalera ? agregarGalera() : setMostrarNuevaGalera(true)
              }
              style={styles.addButton}
            >
              +
            </button>
          </div>
        </div>

      </div>

      {/* HEMBRAS MACHOS */}
      <div style={styles.row}>

        <div style={styles.field}>
          <label>Cantidad Hembras</label>
          <input type="number" value={hembras} onChange={(e) => setHembras(e.target.value)} style={styles.input} />
        </div>

        <div style={styles.field}>
          <label>Cantidad Machos</label>
          <input type="number" value={machos} onChange={(e) => setMachos(e.target.value)} style={styles.input} />
        </div>

        <div style={styles.field}>
          <label>Total Importada</label>
          <input value={cantidadImportada} readOnly style={styles.input} />
        </div>

      </div>

      {/* COSTOS */}
      <div style={styles.row}>

        <div style={styles.field}>
          <label>Costo Total</label>
          <input type="number" value={costo} onChange={(e) => setCosto(e.target.value)} style={styles.input} />
        </div>

        <div style={styles.field}>
          <label>Costo Unitario</label>
          <input value={costoUnitario} readOnly style={styles.input} />
        </div>

      </div>

      <button type="submit" style={styles.button}>
        Guardar
      </button>

    </form>
  );
}

export default Lotes;
