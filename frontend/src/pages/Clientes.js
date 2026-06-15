import { useState } from "react";

function Clientes() {
  // =========================
  // STATES
  // =========================

  const [codigoCliente, setCodigoCliente] = useState("");
  const [nombreComercial, setNombreComercial] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [contacto, setContacto] = useState("");
  const [region, setRegion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precioCajaSuperNick, setPrecioCajaSuperNick] = useState("");
  const [precioCajaBrownNick, setPrecioCajaBrownNick] = useState("");

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
      codigoCliente,
      telefono,
      correo,
      contacto,
      nombreComercial,
      region,
      categoria,
      precioCajaSuperNick,
      precioCajaBrownNick
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

      {/* CÓDIGO CLIENTE + TELÉFONO + CORREO */}
      <div style={rowStyle}>
        {/* CÓDIGO CLIENTE */}
        <div>
          <label>
            Código de Cliente
          </label>

          <input
            type="text"
            value={codigoCliente}
            onChange={(e) =>
              setCodigoCliente(
                e.target.value.toUpperCase()
              )
            }
            placeholder="CLI-001"
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

      {/* REGIÓN + CATEGORÍA */}
      <div style={doubleRowStyle}>
        {/* REGIÓN */}
        <div>
          <label>
            Región
          </label>

          <select
            value={region}
            onChange={(e) =>
              setRegion(e.target.value)
            }
            style={inputStyle}
          >
            <option value="">
              Seleccione
            </option>

            <option value="Norte">
              Norte
            </option>

            <option value="Sur">
              Sur
            </option>

            <option value="Este">
              Este
            </option>

            <option value="Oeste">
              Oeste
            </option>
          </select>
        </div>

        {/* CATEGORÍA */}
        <div>
          <label>
            Categoría
          </label>

          <select
            value={categoria}
            onChange={(e) =>
              setCategoria(
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
      </div>

      {/* PRECIOS */}
      <div style={doubleRowStyle}>
        {/* PRECIO CAJA SUPER NICK */}
        <div>
          <label>
            Precio Caja Super Nick
          </label>

          <input
            type="number"
            value={precioCajaSuperNick}
            onChange={(e) =>
              setPrecioCajaSuperNick(
                e.target.value
              )
            }
            placeholder="0.00"
            style={inputStyle}
          />
        </div>

        {/* PRECIO CAJA BROWN NICK */}
        <div>
          <label>
            Precio Caja Brown Nick
          </label>

          <input
            type="number"
            value={precioCajaBrownNick}
            onChange={(e) =>
              setPrecioCajaBrownNick(
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
