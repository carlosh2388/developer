import { useState } from "react";

function EgresoAlimento() {

  // =========================
  // FECHA
  // =========================

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  // =========================
  // CATÁLOGOS (ordenados)
  // =========================

  const galeras = [
    "Crianza",
    "Galera 1",
    "Galera 2",
    "Galera 3",
    "Galera 4",
    "Galera 5"
  ];

  const alimentos = [
    "Crecimiento",
    "Desarrollo",
    "Fase 1",
    "Fase 2",
    "Inicio",
    "Preinicio",
    "Prepostura"
  ];

  const aditivos = [
    "AD-001",
    "AD-002"
  ];

  const medicamentos = [
    "MED-001",
    "MED-002"
  ];

  const vacunas = [
    "VAC-001",
    "VAC-002"
  ];

  // =========================
  // CREAR REGISTRO
  // =========================

  const crearRegistro = () => ({
    id: Date.now() + Math.random(),

    galera: "",

    alimento: "",
    cantidadAlimento: "",

    aditivo: "",
    cantidadAditivo: "",

    medicamento: "",
    cantidadMedicamento: "",

    vacuna: "",
    cantidadVacuna: ""
  });

  // =========================
  // STATE
  // =========================

  const [registros, setRegistros] = useState([]);

  // =========================
  // AGREGAR / ELIMINAR
  // =========================

  const agregarRegistro = () => {
    setRegistros(prev => [...prev, crearRegistro()]);
  };

  const eliminarRegistro = (id) => {
    setRegistros(prev => prev.filter(r => r.id !== id));
  };

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (id, campo, value) => {
    setRegistros(prev =>
      prev.map(r =>
        r.id === id ? { ...r, [campo]: value } : r
      )
    );
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = (e) => {
    e.preventDefault();

    const payload = {
      fecha,
      movimientos: registros
    };

    console.log(payload);

    alert("Salida de alimento registrada correctamente");
  };

  // =========================
  // ESTILOS (COMPACTOS)
  // =========================

  const inputStyle = {
    width: "100%",
    padding: "4px 6px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    height: "32px",
    fontSize: "13px"
  };

  const labelStyle = {
    fontWeight: "bold",
    fontSize: "13px",
    marginBottom: "2px",
    display: "block"
  };

  const cellStyle = {
    padding: "2px 4px",
    verticalAlign: "top"
  };

  // =========================
  // RENDER
  // =========================

  return (

    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "10px",
        fontFamily: "Arial"
      }}
    >

      <h2 style={{ marginBottom: "10px" }}>
        Salida de Alimento
      </h2>

      {/* FECHA + BOTÓN */}

      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "flex-end",
          marginBottom: "10px"
        }}
      >

        <div>
          <label style={labelStyle}>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          type="button"
          onClick={agregarRegistro}
          style={{
            height: "32px",
            padding: "0 12px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          + Proporcionar a Galera
        </button>

      </div>

      <form onSubmit={guardar}>

        {registros.map(registro => (

          <div
            key={registro.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "8px",
              marginBottom: "10px",
              background: "#fafafa"
            }}
          >

            {/* HEADER */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "10px",
                marginBottom: "8px"
              }}
            >

              <div>
                <label style={labelStyle}>Galera</label>
                <select
                  value={registro.galera}
                  onChange={(e) =>
                    handleChange(registro.id, "galera", e.target.value)
                  }
                  style={inputStyle}
                >
                  <option value="">Seleccione</option>
                  {galeras.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => eliminarRegistro(registro.id)}
                style={{
                  height: "32px",
                  background: "#d9534f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  padding: "0 10px",
                  cursor: "pointer"
                }}
              >
                X
              </button>

            </div>

            {/* MATRIZ COMPACTA */}

            <table style={{ width: "100%", borderCollapse: "collapse" }}>

              <tbody>

                {/* ALIMENTO */}
                <tr>
                  <td style={{ ...cellStyle, width: "120px", fontWeight: "bold" }}>
                    Alimento
                  </td>
                  <td style={cellStyle}>
                    <select
                      value={registro.alimento}
                      onChange={(e) =>
                        handleChange(registro.id, "alimento", e.target.value)
                      }
                      style={inputStyle}
                    >
                      <option value="">Seleccione</option>
                      {alimentos.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={registro.cantidadAlimento}
                      onChange={(e) =>
                        handleChange(registro.id, "cantidadAlimento", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>
                </tr>

                {/* ADITIVO */}
                <tr>
                  <td style={{ ...cellStyle, fontWeight: "bold" }}>
                    Aditivo
                  </td>
                  <td style={cellStyle}>
                    <select
                      value={registro.aditivo}
                      onChange={(e) =>
                        handleChange(registro.id, "aditivo", e.target.value)
                      }
                      style={inputStyle}
                    >
                      <option value="">Seleccione</option>
                      {aditivos.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={registro.cantidadAditivo}
                      onChange={(e) =>
                        handleChange(registro.id, "cantidadAditivo", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>
                </tr>

                {/* MEDICAMENTO */}
                <tr>
                  <td style={{ ...cellStyle, fontWeight: "bold" }}>
                    Medicamento
                  </td>
                  <td style={cellStyle}>
                    <select
                      value={registro.medicamento}
                      onChange={(e) =>
                        handleChange(registro.id, "medicamento", e.target.value)
                      }
                      style={inputStyle}
                    >
                      <option value="">Seleccione</option>
                      {medicamentos.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={registro.cantidadMedicamento}
                      onChange={(e) =>
                        handleChange(registro.id, "cantidadMedicamento", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>
                </tr>

                {/* VACUNA */}
                <tr>
                  <td style={{ ...cellStyle, fontWeight: "bold" }}>
                    Vacuna
                  </td>
                  <td style={cellStyle}>
                    <select
                      value={registro.vacuna}
                      onChange={(e) =>
                        handleChange(registro.id, "vacuna", e.target.value)
                      }
                      style={inputStyle}
                    >
                      <option value="">Seleccione</option>
                      {vacunas.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={registro.cantidadVacuna}
                      onChange={(e) =>
                        handleChange(registro.id, "cantidadVacuna", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        ))}

        <button
          type="submit"
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Guardar
        </button>

      </form>

    </div>

  );
}

export default EgresoAlimento;
