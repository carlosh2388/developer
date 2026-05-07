import { useEffect, useState } from "react";

function Localidades() {

  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");

  const [bodega, setBodega] = useState("");

  const [idLocalidad, setIdLocalidad] = useState("");

  const [nombreLocalidad, setNombreLocalidad] = useState("");

  const [estatus, setEstatus] = useState("Activo");

  const [placeholder, setPlaceholder] =
    useState("Ej: TRA, INV, HIN...");

  // =========================
  // CATÁLOGOS
  // =========================

  const localidadesBI = [
    "TRA",
    "HIN",
    "HCO",
    "VYA",
    "PB1",
    "PB2",
    "PBV",
    "PBD",
    "PR1",
    "PR2",
    "PRV",
    "PRD",
    "VMA"
  ];

  const localidadesGenerales = [
    "TRA",
    "INV"
  ];

  // =========================
  // FECHA AUTOMÁTICA
  // =========================

  useEffect(() => {

    const hoy = new Date()
      .toISOString()
      .split("T")[0];

    setFecha(hoy);

  }, []);

  // =========================
  // CAMBIO BODEGA
  // =========================

  const handleBodega = (e) => {

    const value = e.target.value;

    setBodega(value);

    if (value === "BI") {

      setPlaceholder(
        "TRA, HIN, HCO, VYA..."
      );

    } else {

      setPlaceholder("TRA o INV");
    }
  };

  // =========================
  // NORMALIZAR LOCALIDAD
  // =========================

  const handleIdLocalidad = (e) => {

    setIdLocalidad(
      e.target.value.toUpperCase()
    );
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = (e) => {

    e.preventDefault();

    let valido = false;

    if (bodega === "BI") {

      valido =
        localidadesBI.includes(idLocalidad);

    } else {

      valido =
        localidadesGenerales.includes(
          idLocalidad
        );
    }

    if (!valido) {

      alert(
        "Localidad no válida para la bodega seleccionada"
      );

      return;
    }

    const data = {
      fecha,
      bodega,
      idLocalidad,
      nombreLocalidad,
      estatus
    };

    console.log(data);

    alert("Localidad guardada correctamente");
  };

  // =========================
  // RENDER
  // =========================

  return (

    <form onSubmit={handleSubmit}>

      <h2>Registro de Localidades</h2>

      {/* FECHA */}
      <label>Fecha</label>

      <input
        type="date"
        value={fecha}
        onChange={(e) =>
          setFecha(e.target.value)
        }
      />

      {/* BODEGA */}
      <label>Nombre de la Bodega</label>

      <select
        value={bodega}
        onChange={handleBodega}
      >

        <option value="">
          Seleccione
        </option>

        <option value="BI">
          BI - Bodega de Incubadora
        </option>

        <option value="BA">
          BA - Bodega de Alimento
        </option>

        <option value="BH">
          BH - Bodega de Huevo
        </option>

        <option value="BGR">
          BGR - Bodega de Granja de Reproducción
        </option>

      </select>

      {/* ID LOCALIDAD */}
      <label>ID de Localidad</label>

      <input
        type="text"
        value={idLocalidad}
        onChange={handleIdLocalidad}
        placeholder={placeholder}
      />

      {/* NOMBRE */}
      <label>Nombre de la Localidad</label>

      <input
        type="text"
        value={nombreLocalidad}
        onChange={(e) =>
          setNombreLocalidad(
            e.target.value
          )
        }
      />

      {/* AYUDA */}
      <small>

        BI (Incubadora):
        TRA, HIN, HCO, VYA,
        PB1, PB2, PBV, PBD,
        PR1, PR2, PRV, PRD, VMA

        <br />
        <br />

        Otras bodegas:
        TRA, INV

      </small>

      {/* ESTATUS */}
      <label>Estatus</label>

      <select
        value={estatus}
        onChange={(e) =>
          setEstatus(e.target.value)
        }
      >

        <option value="Activo">
          Activo
        </option>

        <option value="Inactivo">
          Inactivo
        </option>

      </select>

      {/* BOTÓN */}
      <button type="submit">
        Guardar
      </button>

    </form>
  );
}

export default Localidades;