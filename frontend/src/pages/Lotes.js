import { useEffect, useState } from "react";

function Lotes() {

  // =========================
  // STATES
  // =========================

  const [lote, setLote] = useState("");

  const [fecha, setFecha] = useState("");

  const [Linea, setLinea] = useState([
    "Hy-Line Brown (marrón)",
    "SL / 30 Super Nick (blanco)"
  ]);

  const [galeras, setGaleras] = useState([
    "Galera 1",
    "Galera 2"
  ]);

  const [nuevaLinea, setNuevaLinea] = useState("");

  const [nuevaGalera, setNuevaGalera] = useState("");

  const [mostrarNuevaLinea, setMostrarNuevaLinea] = useState(false);

  const [mostrarNuevaGalera, setMostrarNuevaGalera] = useState(false);

  const [Linea, setLinea] = useState("");

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
  // AGREGAR LINEA
  // =========================

  const agregarLinea = () => {

    if (nuevaLinea.trim() !== "") {

      const nueva = nuevaLinea.trim();

      setLinea([
        ...Linea,
        nueva
      ]);

      setLinea(nueva);

      setNuevaLinea("");

      setMostrarNuevaLinea(false);
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

      setGalera(nueva);

      setNuevaGalera("");

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
  // STYLES
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

      {/* LINEA Y GALERA */}
      <div style={styles.row}>

        {/* LINEA */}
        <div style={styles.field}>

          <label>Linea</label>

          <div style={styles.row}>

            <select
              value={linea}
              onChange={(e) =>
                setLinea(e.target.value)
              }
              style={styles.input}
            >

              <option value="">
                Seleccione
              </option>

              {Linea.map((v, index) => (

                <option
                  key={index}
                  value={v}
                >
                  {v}
                </option>

              ))}

            </select>

            {mostrarNuevaLinea && (

              <input
                type="text"
                placeholder="Nueva línea"
                value={nuevaLinea}
                onChange={(e) =>
                  setNuevaLinea(e.target.value)
                }
                style={styles.input}
              />

            )}

            <button
              type="button"
              onClick={() => {

                if (mostrarNuevaLinea) {

                  agregarLinea();

                } else {

                  setMostrarNuevaLinea(true);
                }
              }}
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
              onChange={(e) =>
                setGalera(e.target.value)
              }
              style={styles.input}
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
                style={styles.input}
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

        </div>

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

          <label>Costo Lote</label>

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