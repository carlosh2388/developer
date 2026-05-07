import { useEffect, useState } from "react";
function Bodegas() {

  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");

  const [idBodega, setIdBodega] = useState("");

  const [nombreBodega, setNombreBodega] = useState("");

  const [estado, setEstado] = useState("Activo");

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
  // NORMALIZAR ID
  // =========================

  const handleIdBodega = (e) => {

    setIdBodega(
      e.target.value.toUpperCase()
    );
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = (e) => {

    e.preventDefault();

    const data = {
      fecha,
      idBodega,
      nombreBodega,
      estado
    };

    console.log(data);

    alert("Bodega guardada correctamente");
  };

  // =========================
  // RENDER
  // =========================

  return (

    <form onSubmit={handleSubmit}>

      <h2>Registro de Bodega</h2>

      {/* FECHA */}
      <label>Fecha</label>

      <input
        type="date"
        value={fecha}
        onChange={(e) =>
          setFecha(e.target.value)
        }
      />

      {/* ID BODEGA */}
      <label>ID de la Bodega</label>

      <input
        type="text"
        value={idBodega}
        onChange={handleIdBodega}
        placeholder="BA, BH, BGR, BI"
      />

      <small>

        BA = Bodega de Alimento <br />

        BH = Bodega de Huevo <br />

        BGR = Bodega de Granja de Reproducción <br />

        BI = Bodega de Incubadora <br />

      </small>

      {/* NOMBRE */}
      <label>Nombre de la Bodega</label>

      <input
        type="text"
        value={nombreBodega}
        onChange={(e) =>
          setNombreBodega(e.target.value)
        }
      />

      {/* ESTADO */}
      <label>Estado</label>

      <select
        value={estado}
        onChange={(e) =>
          setEstado(e.target.value)
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

export default Bodegas;