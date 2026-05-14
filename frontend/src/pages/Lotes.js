import { useEffect, useState } from "react";

function Lotes() {

  // =========================
  // STATES
  // =========================

  const [lote, setLote] = useState("");

  const [fecha, setFecha] = useState("");

  const [variedades, setVariedades] = useState([
    "Variedad A",
    "Variedad B"
  ]);

  const [galeras, setGaleras] = useState([
    "Galera 1",
    "Galera 2"
  ]);

  const [nuevaVariedad, setNuevaVariedad] = useState("");

  const [nuevaGalera, setNuevaGalera] = useState("");

  const [mostrarNuevaVariedad, setMostrarNuevaVariedad] = useState(false);

  const [mostrarNuevaGalera, setMostrarNuevaGalera] = useState(false);

  const [variedad, setVariedad] = useState("");

  const [galera, setGalera] = useState("");

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
  // AGREGAR VARIEDAD
  // =========================

  const agregarVariedad = () => {

    if (nuevaVariedad.trim() !== "") {

      const nueva = nuevaVariedad.trim();

      setVariedades([
        ...variedades,
        nueva
      ]);

      // Seleccionar automáticamente
      setVariedad(nueva);

      // Limpiar campo
      setNuevaVariedad("");

      // Ocultar campo nuevamente
      setMostrarNuevaVariedad(false);
    }
  };

  // =========================
  // AGREGAR GALERA
  // =========================

  const agregarGalera = () => {

    if (nuevaGalera.trim() !== "") {

      const nueva = nuevaGalera.trim();

      setGaleras([
        ...galeras,
        nueva
      ]);

      // Seleccionar automáticamente
      setGalera(nueva);

      // Limpiar campo
      setNuevaGalera("");

      // Ocultar campo nuevamente
      setMostrarNuevaGalera(false);
    }
  };

  // =========================
  // CALCULAR TOTALES
  // =========================

  useEffect(() => {

    const total =
      Number(hembras) + Number(machos);

    setCantidadImportada(total);

    if (total > 0) {

      setCostoUnitario(
        (Number(costo) / total).toFixed(2)
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
      variedad,
      galera,
      hembras,
      machos,
      cantidadImportada,
      costo,
      costoUnitario,
      estado
    };

    console.log(data);

    alert("Formulario guardado correctamente");
  };

  // =========================
  // STYLES
  // =========================

  const styles = {

    form: {
      maxWidth: "1000px",
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
      fontSize: "14px"
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
      fontSize: "18px",
      fontWeight: "bold"
    }
  };

  // =========================
  // RENDER
  // =========================

  return (

    <form
      onSubmit={handleSubmit}
      style={styles.form}
    >

      <h2>Registro de Lotes</h2>

      {/* LOTE - FECHA - ESTADO */}
      <div style={styles.row}>

        <div style={styles.field}>

          <label># Lote</label>

          <input
            type="text"
            value={lote}
            readOnly
            style={styles.input}
          />

        </div>

        <div style={styles.field}>

          <label>Fecha</label>

          <input
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(e.target.value)
            }
            style={styles.input}
          />

        </div>

        <div style={styles.field}>

          <label>Estado</label>

          <select
            value={estado}
            onChange={(e) =>
              setEstado(e.target.value)
            }
            style={styles.input}
          >

            <option value="Activo">
              Activo
            </option>

            <option value="Inactivo">
              Inactivo
            </option>

          </select>

        </div>

      </div>

      {/* VARIEDAD */}
      <label>Variedad</label>

      <div style={styles.row}>

        <select
          value={variedad}
          onChange={(e) =>
            setVariedad(e.target.value)
          }
          style={{
            ...styles.input,
            flex: 1
          }}
        >

          <option value="">
            Seleccione
          </option>

          {variedades.map((v, index) => (

            <option
              key={index}
              value={v}
            >
              {v}
            </option>

          ))}

        </select>

        {mostrarNuevaVariedad && (

          <input
            type="text"
            placeholder="Nueva variedad"
            value={nuevaVariedad}
            onChange={(e) =>
              setNuevaVariedad(e.target.value)
            }
            style={{
              ...styles.input,
              flex: 1
            }}
          />

        )}

        <button
          type="button"
          onClick={() => {

            if (mostrarNuevaVariedad) {

              agregarVariedad();

            } else {

              setMostrarNuevaVariedad(true);
            }
          }}
          style={styles.addButton}
        >
          +
        </button>

      </div>

      {/* GALERA */}
      <label>Galera</label>

      <div style={styles.row}>

        <select
          value={galera}
          onChange={(e) =>
            setGalera(e.target.value)
          }
          style={{
            ...styles.input,
            flex: 1
          }}
        >

          <option value="">
            Seleccione
          </option>

          {galeras.map((g, index) => (

            <option
              key={index}
              value={g}
            >
              {g}
            </option>

          ))}

        </select>

        {mostrarNuevaGalera && (

          <input
            type="text"
            placeholder="Nueva galera"
            value={nuevaGalera}
            onChange={(e) =>
              setNuevaGalera(e.target.value)
            }
            style={{
              ...styles.input,
              flex: 1
            }}
          />

        )}

        <button
          type="button"
          onClick={() => {

            if (mostrarNuevaGalera) {

              agregarGalera();

            } else {

              setMostrarNuevaGalera(true);
            }
          }}
          style={styles.addButton}
        >
          +
        </button>

      </div>

      {/* HEMBRAS - MACHOS - TOTAL */}
      <div style={styles.row}>

        <div style={styles.field}>

          <label>Cantidad Hembras</label>

          <input
            type="number"
            value={hembras}
            onChange={(e) =>
              setHembras(e.target.value)
            }
            style={styles.input}
          />

        </div>

        <div style={styles.field}>

          <label>Cantidad Machos</label>

          <input
            type="number"
            value={machos}
            onChange={(e) =>
              setMachos(e.target.value)
            }
            style={styles.input}
          />

        </div>

        <div style={styles.field}>

          <label>Cantidad Importada</label>

          <input
            type="number"
            value={cantidadImportada}
            readOnly
            style={styles.input}
          />

        </div>

      </div>

      {/* COSTOS */}
      <div style={styles.row}>

        <div style={styles.field}>

          <label>Costo (Q)</label>

          <input
            type="number"
            value={costo}
            onChange={(e) =>
              setCosto(e.target.value)
            }
            style={styles.input}
          />

        </div>

        <div style={styles.field}>

          <label>Costo Unitario</label>

          <input
            type="number"
            value={costoUnitario}
            readOnly
            style={styles.input}
          />

        </div>

      </div>

      {/* BOTÓN */}
      <button
        type="submit"
        style={styles.button}
      >
        Guardar
      </button>

    </form>
  );
}

export default Lotes;