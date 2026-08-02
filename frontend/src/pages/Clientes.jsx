import { useState } from "react";

function Clientes() {
  // =========================
  // STATES
  // =========================

  const [codigoCliente, setCodigoCliente] = useState("");
  const [nombreComercial, setNombreComercial] = useState("");
  const [contacto, setContacto] = useState("");

  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");

  const [region, setRegion] = useState("");
  const [categoria, setCategoria] = useState("");

  const [precioCajaSuperNick, setPrecioCajaSuperNick] = useState("");
  const [precioCajaBrownNick, setPrecioCajaBrownNick] = useState("");

  const [ubicaciones, setUbicaciones] = useState([]);

  // =========================
  // UBICACIONES
  // =========================

  const agregarUbicacion = () => {
    setUbicaciones(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        nit: "",
        razonSocial: "",
        direccionFiscal: "",
        direccionEntrega: ""
      }
    ]);
  };

  const eliminarUbicacion = (id) => {
    setUbicaciones(prev =>
      prev.filter(u => u.id !== id)
    );
  };

  const handleUbicacionChange = (id, campo, value) => {
    setUbicaciones(prev =>
      prev.map(u =>
        u.id === id ? { ...u, [campo]: value } : u
      )
    );
  };

  // =========================
  // TELÉFONO
  // =========================

  const handleTelefono = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 4) {
      value = value.slice(0, 4) + "-" + value.slice(4, 8);
    }

    setTelefono(value);
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      codigoCliente,
      telefono,
      correo,
      contacto,
      nombreComercial,
      region,
      categoria,
      precioCajaSuperNick,
      precioCajaBrownNick,
      ubicaciones
    });

    alert("Cliente guardado correctamente");
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

  const priceRow = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: "10px",
    alignItems: "end",
    marginBottom: "15px"
  };

  // 🔥 NUEVO: UNA SOLA LÍNEA PARA UBICACIÓN
  const ubicacionRow = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
    gap: "8px",
    alignItems: "end",
    marginBottom: "10px"
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

  const deleteBtn = {
    padding: "8px 10px",
    background: "#d9534f",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    height: "42px"
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
      <h2>Registro de Clientes</h2>

      {/* CÓDIGO + TELÉFONO + CORREO */}
      <div style={rowStyle}>
        <div>
          <label>Código de Cliente</label>
          <input
            value={codigoCliente}
            onChange={(e) =>
              setCodigoCliente(e.target.value.toUpperCase())
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label>Teléfono</label>
          <input
            value={telefono}
            onChange={handleTelefono}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* NOMBRE COMERCIAL + CONTACTO */}
      <div style={doubleRowStyle}>
        <div>
          <label>Nombre Comercial</label>
          <input
            value={nombreComercial}
            onChange={(e) => setNombreComercial(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Nombre Contacto</label>
          <input
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* REGIÓN + CATEGORÍA */}
      <div style={doubleRowStyle}>
        <div>
          <label>Región</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={inputStyle}
          >
            <option>Seleccione</option>
            <option>Norte</option>
            <option>Sur</option>
            <option>Este</option>
            <option>Oeste</option>
          </select>
        </div>

        <div>
          <label>Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            style={inputStyle}
          >
            <option>Seleccione</option>
            <option>Preferencial</option>
            <option>VIP</option>
            <option>Especial</option>
          </select>
        </div>
      </div>

      {/* PRECIOS + BOTÓN */}
      <div style={priceRow}>
        <div>
          <label>Precio Caja Super Nick</label>
          <input
            type="number"
            value={precioCajaSuperNick}
            onChange={(e) => setPrecioCajaSuperNick(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Precio Caja Brown Nick</label>
          <input
            type="number"
            value={precioCajaBrownNick}
            onChange={(e) => setPrecioCajaBrownNick(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          type="button"
          onClick={agregarUbicacion}
          style={{
            ...buttonStyle,
            height: "42px"
          }}
        >
          Agregar Ubicación
        </button>
      </div>

      {/* 🔥 UBICACIÓN EN UNA SOLA LÍNEA */}
      {ubicaciones.map((u) => (
        <div key={u.id} style={ubicacionRow}>
          <input
            placeholder="NIT"
            value={u.nit}
            onChange={(e) =>
              handleUbicacionChange(u.id, "nit", e.target.value)
            }
            style={inputStyle}
          />

          <input
            placeholder="Razón Social"
            value={u.razonSocial}
            onChange={(e) =>
              handleUbicacionChange(u.id, "razonSocial", e.target.value)
            }
            style={inputStyle}
          />

          <input
            placeholder="Dirección Fiscal"
            value={u.direccionFiscal}
            onChange={(e) =>
              handleUbicacionChange(u.id, "direccionFiscal", e.target.value)
            }
            style={inputStyle}
          />

          <input
            placeholder="Dirección de Entrega"
            value={u.direccionEntrega}
            onChange={(e) =>
              handleUbicacionChange(u.id, "direccionEntrega", e.target.value)
            }
            style={inputStyle}
          />

          <button
            type="button"
            onClick={() => eliminarUbicacion(u.id)}
            style={deleteBtn}
          >
            X
          </button>
        </div>
      ))}

      {/* GUARDAR */}
      <button type="submit" style={buttonStyle}>
        Guardar
      </button>
    </form>
  );
}

export default Clientes;
