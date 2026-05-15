import { useState } from "react";

function Clientes() {

  // =========================
  // STATES
  // =========================

  const [nit, setNit] = useState("");

  const [nombreComercial, setNombreComercial] = useState("");

  const [direccionFiscal, setDireccionFiscal] = useState("");

  const [telefono, setTelefono] = useState("");

  const [correo, setCorreo] = useState("");

  const [contacto, setContacto] = useState("");

  const [tipoCliente, setTipoCliente] = useState("");

  const [precioAsignado, setPrecioAsignado] = useState("");

  // =========================
  // FORMATO TELÉFONO
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

    // VALIDAR TELÉFONO
    if (!/^\d{4}-\d{4}$/.test(telefono)) {

      alert(
        "El teléfono debe tener formato ####-####"
      );

      return;
    }

    // VALIDAR CORREO
    if (
      correo &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
    ) {

      alert(
        "Ingrese un correo electrónico válido"
      );

      return;
    }

    const data = {

      nit,
      telefono,
      correo,
      contacto,
      nombreComercial,
      direccionFiscal,
      tipoCliente,
      precioAsignado
    };

    console.log(data);

    alert(
      "Cliente guardado correctamente"
    );
  };

  // =========================
  // ESTILOS
  // =========================

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    marginBottom: "15px"
  };

  const doubleRowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
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
        Registro de Clientes
      </h2>

      {/* NIT + TELÉFONO + CORREO */}
      <div style={rowStyle}>

        {/* NIT */}
        <div>

          <label>
            NIT
          </label>

          <input
            type="text"
            value={nit}
            onChange={(e) =>
              setNit(e.target.value)
            }
            style={inputStyle}
            required
          />

        </div>

        {/* TELÉFONO */}
        <div>

          <label>
            Teléfono
          </label>

          <input
            type="text"
            value={telefono}
            onChange={handleTelefono}
            placeholder="####-####"
            maxLength={9}
            style={inputStyle}
            required
          />

        </div>

        {/* CORREO */}
        <div>

          <label>
            Correo Electrónico
          </label>

          <input
            type="email"
            value={correo}
            onChange={(e) =>
              setCorreo(e.target.value)
            }
            placeholder="correo@ejemplo.com"
            style={inputStyle}
          />

        </div>

      </div>

      {/* CONTACTO */}
      <label>
        Nombre del Contacto
      </label>

      <input
        type="text"
        value={contacto}
        onChange={(e) =>
          setContacto(e.target.value)
        }
        style={{
          ...inputStyle,
          marginBottom: "15px"
        }}
      />

      {/* NOMBRE COMERCIAL */}
      <label>
        Nombre Comercial
      </label>

      <input
        type="text"
        value={nombreComercial}
        onChange={(e) =>
          setNombreComercial(e.target.value)
        }
        style={{
          ...inputStyle,
          marginBottom: "15px"
        }}
        required
      />

      {/* DIRECCIÓN FISCAL */}
      <label>
        Dirección Fiscal
      </label>

      <input
        type="text"
        value={direccionFiscal}
        onChange={(e) =>
          setDireccionFiscal(e.target.value)
        }
        style={{
          ...inputStyle,
          marginBottom: "15px"
        }}
        required
      />

      {/* TIPO CLIENTE + PRECIO */}
      <div style={doubleRowStyle}>

        {/* TIPO CLIENTE */}
        <div>

          <label>
            Tipo de Cliente
          </label>

          <select
            value={tipoCliente}
            onChange={(e) =>
              setTipoCliente(
                e.target.value
              )
            }
            style={inputStyle}
          >

            <option value="">
              Seleccione
            </option>

            <option value="Preferencial">
              Preferencial
            </option>

            <option value="VIP">
              VIP
            </option>

            <option value="Especial">
              Especial
            </option>

          </select>

        </div>

        {/* PRECIO ASIGNADO */}
        <div>

          <label>
            Precio Asignado
          </label>

          <input
            type="number"
            value={precioAsignado}
            onChange={(e) =>
              setPrecioAsignado(
                e.target.value
              )
            }
            placeholder="0.00"
            style={inputStyle}
          />

        </div>

      </div>

      {/* BOTÓN */}
      <button
        type="submit"
        style={buttonStyle}
      >

        Guardar

      </button>

    </form>
  );
}

export default Clientes;