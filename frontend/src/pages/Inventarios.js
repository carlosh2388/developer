import { useState } from "react";

function Inventarios() {

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
          ""
        );

      } else {

        setMostrarInsumos(false);

        setHelpId(
          ""
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
  // ESTILOS
  // =========================

  const inputStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  };

  const rowStyle = {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
    alignItems: "flex-end"
  };

  // =========================
  // RENDER
  // =========================

  return (

    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h2>Registro de Productos (Inventario)</h2>

      {/* TIPO INVENTARIO */}
      <div style={{ marginBottom: "20px" }}>

        <label>Tipo de Inventario</label>

        <select
          value={tipoInventario}
          onChange={handleTipo}
          style={inputStyle}
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

      </div>

      {/* CAMPOS GENERALES */}
      {mostrarGenerales && (

        <div>

          {/* FILA 1 */}
          <div style={rowStyle}>

            {/* ID PRODUCTO */}
            <div style={{ flex: 2 }}>

              <label>Id de Producto</label>

              <input
                type="text"
                value={idProducto}
                onChange={handleIdProducto}
                placeholder=""
                style={inputStyle}
              />

              <small>{helpId}</small>

            </div>

            {/* UNIDAD */}
            <div style={{ flex: 1 }}>

              <label>Unidad de Medida</label>

              <select
                value={unidad}
                onChange={(e) =>
                  setUnidad(e.target.value)
                }
                style={inputStyle}
              >

                <option value="">
                  Seleccione
                </option>

                <option value="UN">
                  Unidad (UN)
                </option>

              </select>

            </div>

            {/* ESTADO */}
            <div style={{ flex: 1 }}>

              <label>Estado</label>

              <select
                value={estado}
                onChange={(e) =>
                  setEstado(e.target.value)
                }
                style={inputStyle}
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

          {/* FILA 2 */}
          <div style={rowStyle}>

            {/* NOMBRE */}
            <div style={{ flex: 4 }}>

              <label>Nombre del Producto</label>

              <input
                type="text"
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
                style={inputStyle}
              />

            </div>

            {/* EXISTENCIA */}
            <div style={{ flex: 1 }}>

              <label>Existencia</label>

              <input
                type="number"
                value={existencia}
                onChange={(e) =>
                  setExistencia(e.target.value)
                }
                placeholder="0"
                style={inputStyle}
              />

            </div>

          </div>

        </div>
      )}

      {/* CAMPOS INSUMOS */}
      {mostrarInsumos && (

        <div>

          {/* FILA 3 */}
          <div style={rowStyle}>

            <div style={{ flex: 1 }}>

              <label>Costo</label>

              <input
                type="number"
                step="0.01"
                value={costo}
                onChange={(e) =>
                  setCosto(e.target.value)
                }
                style={inputStyle}
              />

            </div>

            <div style={{ flex: 1 }}>

              <label>Presentación</label>

              <input
                type="text"
                value={presentacion}
                onChange={(e) =>
                  setPresentacion(e.target.value)
                }
                style={inputStyle}
              />

            </div>

          </div>

          {/* FILA 4 */}
          <div style={rowStyle}>

            <div style={{ flex: 1 }}>

              <label>Enfermedad</label>

              <input
                type="text"
                value={enfermedad}
                onChange={(e) =>
                  setEnfermedad(e.target.value)
                }
                style={inputStyle}
              />

            </div>

            <div style={{ flex: 1 }}>

              <label>Dosis</label>

              <input
                type="text"
                value={dosis}
                onChange={(e) =>
                  setDosis(e.target.value)
                }
                style={inputStyle}
              />

            </div>

            <div style={{ flex: 1 }}>

              <label>Tipo</label>

              <select
                value={tipo}
                onChange={(e) =>
                  setTipo(e.target.value)
                }
                style={inputStyle}
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

          </div>

        </div>
      )}

      {/* BOTÓN */}
      {mostrarGuardar && (

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Guardar
        </button>

      )}

    </form>
  );
}

export default Inventarios;