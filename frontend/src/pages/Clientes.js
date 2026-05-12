import { useState } from "react";

function Clientes() {

  // =========================
  // STATES
  // =========================

  const [nit, setNit] = useState("");

  const [nombreComercial, setNombreComercial] = useState("");

  const [direccionFiscal, setDireccionFiscal] = useState("");

  const [telefono, setTelefono] = useState("");

  const [contacto, setContacto] = useState("");

  // =========================
  // FORMATO TELÉFONO
  // =========================

  const handleTelefono = (e) => {

    let value = e.target.value
      .replace(/\D/g, "");

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

    if (!/^\d{4}-\d{4}$/.test(telefono)) {

      alert(
        "El teléfono debe tener formato ####-####"
      );

      return;
    }

    const data = {

      nit,
      nombreComercial,
      direccionFiscal,
      telefono,
      contacto
    };

    console.log(data);

    alert("Cliente guardado correctamente");
  };

  // =========================
  // RENDER
  // =========================

  return (

    <form onSubmit={handleSubmit}>

      <h2>Registro de Cliente</h2>

      {/* NIT */}
      <label>NIT</label>

      <input
        type="text"
        value={nit}
        onChange={(e) =>
          setNit(e.target.value)
        }
        required
      />

      {/* NOMBRE COMERCIAL */}
      <label>Nombre Comercial</label>

      <input
        type="text"
        value={nombreComercial}
        onChange={(e) =>
          setNombreComercial(e.target.value)
        }
        required
      />

      {/* DIRECCIÓN FISCAL */}
      <label>Dirección Fiscal</label>

      <input
        type="text"
        value={direccionFiscal}
        onChange={(e) =>
          setDireccionFiscal(e.target.value)
        }
        required
      />

      {/* TELÉFONO */}
      <label>Teléfono</label>

      <input
        type="text"
        value={telefono}
        onChange={handleTelefono}
        placeholder="####-####"
        maxLength={9}
        required
      />

      {/* CONTACTO */}
      <label>Contacto</label>

      <input
        type="text"
        value={contacto}
        onChange={(e) =>
          setContacto(e.target.value)
        }
      />

      {/* BOTÓN */}
      <button type="submit">

        Guardar

      </button>

    </form>
  );
}

export default Clientes;