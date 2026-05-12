import { useEffect, useState } from "react";

function Clientes() {

  // =========================
  // STATES
  // =========================

  const [tipoInventario, setTipoInventario] = useState("");

  const [idProducto, setIdProducto] = useState("");

  const [nombre, setNombre] = useState("");

  const [unidad, setUnidad] = useState("");

  const [estado, setEstado] = useState("Activo");

  const [existencia, setExistencia] = useState("");

  const [costo, setCosto] = useState("");

  const [presentacion, setPresentacion] = useState("");

  const [enfermedad, setEnfermedad] = useState("");

  const [dosis, setDosis] = useState("");

  const [tipo, setTipo] = useState("");

  const [mostrarGenerales, setMostrarGenerales] = useState(false);

  const [mostrarInsumos, setMostrarInsumos] = useState(false);

  const [helpId, setHelpId] = useState("");

  const [mostrarGuardar, setMostrarGuardar] = useState(false);

  // =========================
  // CAMBIO DE TIPO INVENTARIO
  // =========================

  const handleTipo = (e) => {

    const value = e.target.value;

    setTipoInventario(value);

    if (value) {

      setMostrarGenerales(true);
      setMostrarGuardar(true);

      if (value === "INS") {

        setMostrarInsumos(true);

        setHelpId(
          "Ej: VC-NOM-COR, MD-NOM-COR, AD-NOM-COR"
        );

      } else {

        setMostrarInsumos(false);

        setHelpId(
          "Ej: PT-HU-MED, PT-HU-GRD"
        );
      }

    } else {

      setMostrarGenerales(false);
      setMostrarInsumos(false);
      setMostrarGuardar(false);
    }
  };

  // =========================
  // MÁSCARA ID PRODUCTO
  // =========================

  const handleIdProducto = (e) => {

    let value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (value.length > 2)
      value =
        value.slice(0, 2) +
        "-" +
        value.slice(2);

    if (value.length > 5)
      value =
        value.slice(0, 5) +
        "-" +
        value.slice(5, 8);

    setIdProducto(value);
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = (e) => {

    e.preventDefault();

    const data = {

      tipoInventario,
      idProducto,
      nombre,
      unidad,
      estado,
      existencia,
      costo,
      presentacion,
      enfermedad,
      dosis,
      tipo
    };

    console.log(data);

    alert("Producto guardado correctamente");
  };

  // =========================
  // RENDER
  // =========================

  return (

    <form onSubmit={handleSubmit}>

      <h2>Registro de Producto</h2>

      {/* TIPO INVENTARIO */}
      <label>Tipo de Inventario</label>

      <select
        value={tipoInventario}
        onChange={handleTipo}
      >

        <option value="">
          Seleccione
        </option>

        <option value="PT">
          Producto Terminado
        </option>

        <option value="INS">
          Vacunas, Medicamentos y Aditivos
        </option>

      </select>

      {/* CAMPOS GENERALES */}
      {mostrarGenerales && (

        <div>

          <label>Id de Producto</label>

          <input
            type="text"
            value={idProducto}
            onChange={handleIdProducto}
            placeholder="TT-TT-TTT"
          />

          <small>{helpId}</small>

          <label>Nombre del Producto</label>

          <input
            type="text"
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
          />

          <label>Unidad de Medida</label>

          <select
            value={unidad}
            onChange={(e) =>
              setUnidad(e.target.value)
            }
          >

            <option value="">
              Seleccione
            </option>

            <option value="UN">
              Unidad (UN)
            </option>

          </select>

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

          <label>Existencia</label>

          <input
            type="number"
            value={existencia}
            onChange={(e) =>
              setExistencia(e.target.value)
            }
            placeholder="Calculado automáticamente"
          />

        </div>
      )}

      {/* CAMPOS INSUMOS */}
      {mostrarInsumos && (

        <div>

          <label>Costo</label>

          <input
            type="number"
            step="0.01"
            value={costo}
            onChange={(e) =>
              setCosto(e.target.value)
            }
          />

          <label>Presentación</label>

          <input
            type="text"
            value={presentacion}
            onChange={(e) =>
              setPresentacion(e.target.value)
            }
          />

          <label>Enfermedad</label>

          <input
            type="text"
            value={enfermedad}
            onChange={(e) =>
              setEnfermedad(e.target.value)
            }
          />

          <label>Dosis</label>

          <input
            type="text"
            value={dosis}
            onChange={(e) =>
              setDosis(e.target.value)
            }
          />

          <label>Tipo</label>

          <select
            value={tipo}
            onChange={(e) =>
              setTipo(e.target.value)
            }
          >

            <option value="">
              Seleccione
            </option>

            <option value="Viva">
              Viva
            </option>

            <option value="Oleosa">
              Oleosa
            </option>

          </select>

        </div>
      )}

      {/* BOTÓN */}
      {mostrarGuardar && (
        <button type="submit">
          Guardar
        </button>
      )}

    </form>
  );
}

export default Clientes;