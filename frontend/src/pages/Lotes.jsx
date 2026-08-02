import { useEffect, useState } from "react";

function Lotes() {
  // =========================
  // STATES
  // =========================

  const [lote, setLote] = useState("");
  const [fecha, setFecha] = useState("");

  const [lineas] = useState([
    "Super Nick +",
    "Brown Nick +"
  ]);

  const [galeras, setGaleras] = useState([
    "Galera 1",
    "Galera 2",
    "Galera 3",
    "Galera 4",
    "Galera 5",
    "Galera de Crianza",
    "Galera de Producción"
  ]);

  const [linea, setLinea] = useState("");
  const [galera, setGalera] = useState("");

  // PROVEEDOR Y ORIGEN
  const [proveedor, setProveedor] = useState("");
  const [origen, setOrigen] = useState("");

  const [nuevaGalera, setNuevaGalera] = useState("");
  const [mostrarNuevaGalera, setMostrarNuevaGalera] = useState(false);

  const [hembras, setHembras] = useState(0);
  const [machos, setMachos] = useState(0);
  const [cantidadImportada, setCantidadImportada] = useState(0);

  // COSTOS
  const [costoUnitario, setCostoUnitario] = useState(0);
  const [costoTotal, setCostoTotal] = useState(0);
  const [moneda, setMoneda] = useState("Quetzal");

  const [estado, setEstado] = useState("Activo");

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

    setCostoTotal(
      total * Number(costoUnitario || 0)
    );
  }, [hembras, machos, costoUnitario]);

  // =========================
  // INIT
  // =========================

  useEffect(() => {
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
      proveedor,
      origen,
      hembras,
      machos,
      cantidadImportada,
      costoUnitario,
      costoTotal,
      moneda,
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
          <input
            value={lote}
            onChange={(e) =>
              setLote(e.target.value.toUpperCase())
            }
            placeholder="SL038 o BL038 Automático"
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            style={styles.input}
          >
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
        </div>
      </div>

      {/* LÍNEA Y GALERA */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label>Línea</label>
          <select
            value={linea}
            onChange={(e) => setLinea(e.target.value)}
            style={styles.input}
          >
            <option value="">Seleccione</option>
            {lineas.map((v, i) => (
              <option key={i} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

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
                <option key={i} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {mostrarNuevaGalera && (
              <input
                value={nuevaGalera}
                onChange={(e) =>
                  setNuevaGalera(e.target.value)
                }
                style={styles.input}
                placeholder="Nueva galera"
              />
            )}

            <button
              type="button"
              onClick={() =>
                mostrarNuevaGalera
                  ? agregarGalera()
                  : setMostrarNuevaGalera(true)
              }
              style={styles.addButton}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* PROVEEDOR Y ORIGEN */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label>Proveedor</label>

          <select
            value={proveedor}
            onChange={(e) =>
              setProveedor(e.target.value)
            }
            style={styles.input}
          >
            <option value="">Seleccione</option>
            <option value="PRO-001">PRO-001</option>
            <option value="PRO-002">PRO-002</option>
          </select>
        </div>

        <div style={styles.field}>
          <label>Origen</label>

          <select
            value={origen}
            onChange={(e) =>
              setOrigen(e.target.value)
            }
            style={styles.input}
          >
            <option value="">Seleccione</option>
            <option value="Estados Unidos">
              Estados Unidos
            </option>
            <option value="Canada">Canada</option>
            <option value="Mexico">Mexico</option>
          </select>
        </div>
      </div>

      {/* HEMBRAS MACHOS */}
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
          <label>Total Importado</label>

          <input
            value={cantidadImportada}
            readOnly
            style={styles.input}
          />
        </div>
      </div>

      {/* COSTOS */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label>Costo Unitario</label>

          <input
            type="number"
            step="0.0001"
            value={costoUnitario}
            onChange={(e) =>
              setCostoUnitario(e.target.value)
            }
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Costo Total</label>

          <input
            value={Number(costoTotal).toFixed(2)}
            readOnly
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Moneda</label>

          <select
            value={moneda}
            onChange={(e) =>
              setMoneda(e.target.value)
            }
            style={styles.input}
          >
            <option value="">Seleccione</option>
            <option value="Quetzal">
              Quetzal
            </option>
            <option value="Dólar">
              Dólar
            </option>
          </select>
        </div>
      </div>

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
