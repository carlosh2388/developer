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
    // AGREGAR OPCIÓN
    // =========================

    const agregarVariedad = () => {

      if (nuevaVariedad.trim() !== "") {

        setVariedades([
          ...variedades,
          nuevaVariedad
        ]);

        setNuevaVariedad("");
      }
    };

    const agregarGalera = () => {

      if (nuevaGalera.trim() !== "") {

        setGaleras([
          ...galeras,
          nuevaGalera
        ]);

        setNuevaGalera("");
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
    // RENDER
    // =========================

    return (

      <form onSubmit={handleSubmit}>

        <h2>---Registro de Lotes---</h2>

        {/* LOTE */}
        <label># Lote</label>

        <input
          type="text"
          value={lote}
          readOnly
          className="full"
        />

        {/* FECHA */}
        <label>Fecha</label>

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="full"
        />

        {/* VARIEDAD */}
        <label>Variedad</label>

        <div className="row">

          <select
            value={variedad}
            onChange={(e) => setVariedad(e.target.value)}
          >

            <option value="">
              Seleccione
            </option>

            {variedades.map((v, index) => (

              <option key={index} value={v}>
                {v}
              </option>

            ))}

          </select>

          <input
            type="text"
            placeholder="Nueva variedad"
            value={nuevaVariedad}
            onChange={(e) =>
              setNuevaVariedad(e.target.value)
            }
          />

          <button
            type="button"
            onClick={agregarVariedad}
          >
            +
          </button>

        </div>

        {/* GALERA */}
        <label>Galera</label>

        <div className="row">

          <select
            value={galera}
            onChange={(e) => setGalera(e.target.value)}
          >

            <option value="">
              Seleccione
            </option>

            {galeras.map((g, index) => (

              <option key={index} value={g}>
                {g}
              </option>

            ))}

          </select>

          <input
            type="text"
            placeholder="Nueva galera"
            value={nuevaGalera}
            onChange={(e) =>
              setNuevaGalera(e.target.value)
            }
          />

          <button
            type="button"
            onClick={agregarGalera}
          >
            +
          </button>

        </div>

        {/* HEMBRAS */}
        <label>Cantidad Hembras</label>

        <input
          type="number"
          value={hembras}
          onChange={(e) =>
            setHembras(e.target.value)
          }
          className="full"
        />

        {/* MACHOS */}
        <label>Cantidad Machos</label>

        <input
          type="number"
          value={machos}
          onChange={(e) =>
            setMachos(e.target.value)
          }
          className="full"
        />

        {/* TOTAL */}
        <label>Cantidad Importada</label>

        <input
          type="number"
          value={cantidadImportada}
          readOnly
          className="full"
        />

        {/* COSTO */}
        <label>Costo (Q)</label>

        <input
          type="number"
          value={costo}
          onChange={(e) =>
            setCosto(e.target.value)
          }
          className="full"
        />

        {/* COSTO UNITARIO */}
        <label>Costo Unitario</label>

        <input
          type="number"
          value={costoUnitario}
          readOnly
          className="full"
        />

        {/* ESTADO */}
        <label>Estado</label>

        <select
          value={estado}
          onChange={(e) =>
            setEstado(e.target.value)
          }
          className="full"
        >
          <option value="Activo">
            Activo
          </option>

          <option value="Inactivo">
            Inactivo
          </option>

        </select>

        {/* BOTÓN */}
        <button type="submit" className="full">
          Guardar
        </button>

      </form>
    );
  }

  export default Lotes;