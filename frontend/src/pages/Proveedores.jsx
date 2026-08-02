import { useState } from "react";

function Proveedores() {
  // =========================
  // STATES
  // =========================

  const [codigoProveedor, setCodigoProveedor] = useState("");
  const [nombreProveedor, setNombreProveedor] = useState("");

  const [nit, setNit] = useState("");
  const [direccion, setDireccion] = useState("");

  const [contacto, setContacto] = useState("");

  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");

  // =========================
  // TELÉFONO
  // =========================

  const handleTelefono = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 4) {
      value =
        value.slice(0, 4) +
        "-" +
        value.slice(4, 8);
    }

    setTelefono(value);
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      codigoProveedor,
      nombreProveedor,
      nit,
      direccion,
      contacto,
      telefono,
      correo
    });

    alert(
      "Proveedor guardado correctamente"
    );
  };

  // =========================
  // ESTILOS
  // =========================

  const rowStyle = {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr 1fr",
    gap: "10px",
    marginBottom: "15px"
  };

  const doubleRowStyle = {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "10px",
    marginBottom: "15px"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
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
      <h2>
        Registro de Proveedores
      </h2>

      {/* =========================
          FILA 1
      ========================= */}

      <div style={rowStyle}>
        <div>
          <label>
            Código de Proveedor
          </label>

          <input
            value={codigoProveedor}
            onChange={(e) =>
              setCodigoProveedor(
                e.target.value.toUpperCase()
              )
            }
            placeholder="PR01 Automático"
            style={inputStyle}
          />
        </div>

        <div>
          <label>Teléfono</label>

          <input
            value={telefono}
            onChange={
              handleTelefono
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label>Correo</label>

          <input
            type="email"
            value={correo}
            onChange={(e) =>
              setCorreo(
                e.target.value
              )
            }
            style={inputStyle}
          />
        </div>
      </div>

      {/* =========================
          FILA 2
      ========================= */}

      <div style={doubleRowStyle}>
        <div>
          <label>NIT</label>

          <input
            value={nit}
            onChange={(e) =>
              setNit(
                e.target.value
              )
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label>
            Nombre del Proveedor
          </label>

          <input
            value={nombreProveedor}
            onChange={(e) =>
              setNombreProveedor(
                e.target.value
              )
            }
            style={inputStyle}
          />
        </div>
      </div>

      {/* =========================
          FILA 3
      ========================= */}

      <div style={doubleRowStyle}>
        <div>
          <label>
            Dirección
          </label>

          <input
            value={direccion}
            onChange={(e) =>
              setDireccion(
                e.target.value
              )
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label>
            Nombre Contacto
          </label>

          <input
            value={contacto}
            onChange={(e) =>
              setContacto(
                e.target.value
              )
            }
            style={inputStyle}
          />
        </div>
      </div>

      {/* =========================
          GUARDAR
      ========================= */}

      <button
        type="submit"
        style={buttonStyle}
      >
        Guardar
      </button>
    </form>
  );
}

export default Proveedores;
