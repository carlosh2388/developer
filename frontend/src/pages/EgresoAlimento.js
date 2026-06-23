import { useState } from "react";

function EgresoAlimento() {

  // =========================
  // FECHA
  // =========================

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  // =========================
  // CATÁLOGOS
  // =========================

  const alimentos = [
    "Crecimiento",
    "Desarrollo",
    "Fase 1",
    "Fase 2",
    "Inicio",
    "Preinicio",
    "Prepostura"
  ];

  const medicamentos = [
    "MED-001",
    "MED-002"
  ];

  const vacunas = [
    "VAC-001",
    "VAC-002"
  ];

  const aditivos = [
    "AD-001",
    "AD-002"
  ];

  const galeras = [
    "Crianza",
    "Galera 1",
    "Galera 2",
    "Galera 3",
    "Galera 4",
    "Galera 5"
  ];

  // =========================
  // CREAR REGISTRO
  // =========================

  const crearRegistro = () => ({

    id: Date.now() + Math.random(),

    galera: "",

    alimento: "",
    cantidadAlimento: "",

    medicamento: "",
    cantidadMedicamento: "",

    vacuna: "",
    cantidadVacuna: "",

    aditivo: "",
    cantidadAditivo: ""

  });

  // =========================
  // REGISTROS
  // =========================

  const [registros, setRegistros] =
    useState([]);

  // =========================
  // AGREGAR REGISTRO
  // =========================

  const agregarRegistro = () => {

    setRegistros(prev => [
      ...prev,
      crearRegistro()
    ]);

  };

  // =========================
  // ELIMINAR REGISTRO
  // =========================

  const eliminarRegistro = (id) => {

    setRegistros(prev =>
      prev.filter(r => r.id !== id)
    );

  };

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (
    id,
    campo,
    value
  ) => {

    setRegistros(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              [campo]: value
            }
          : r
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

    alert(
      "Salida de alimento registrada correctamente"
    );

  };

  // =========================
  // ESTILOS
  // =========================

  const inputStyle = {

    width: "100%",

    padding: "8px",

    border: "1px solid #ccc",

    borderRadius: "4px"

  };

  const labelStyle = {

    fontWeight: "bold",

    display: "block",

    marginBottom: "4px"

  };

  // =========================
  // RENDER
  // =========================

  return (

    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h2>
        Salida de Alimento
      </h2>

      {/* FECHA + BOTÓN */}

      <div
        style={{
          display: "flex",
          gap: "15px",
          alignItems: "flex-end",
          marginBottom: "20px"
        }}
      >

        <div>

          <label style={labelStyle}>
            Fecha
          </label>

          <input
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(
                e.target.value
              )
            }
            style={inputStyle}
          />

        </div>

        <button
          type="button"
          onClick={agregarRegistro}
          style={{
            padding: "10px 15px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Proporcionar Alimento a Galera
        </button>

      </div>

      <form onSubmit={guardar}>

        {registros.map(registro => (

          <div
            key={registro.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "20px",
              background: "#fafafa"
            }}
          >

            {/* ENCABEZADO */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr auto",
                gap: "15px",
                marginBottom: "20px"
              }}
            >

              <div>

                <label style={labelStyle}>
                  Galera
                </label>

                <select
                  value={registro.galera}
                  onChange={(e) =>
                    handleChange(
                      registro.id,
                      "galera",
                      e.target.value
                    )
                  }
                  style={inputStyle}
                >

                  <option value="">
                    Seleccione
                  </option>

                  {galeras.map(g => (
                    <option
                      key={g}
                      value={g}
                    >
                      {g}
                    </option>
                  ))}

                </select>

              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "end"
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    eliminarRegistro(
                      registro.id
                    )
                  }
                  style={{
                    background: "#d9534f",
                    color: "#fff",
                    border: "none",
                    padding: "10px 15px",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  X
                </button>

              </div>

            </div>

            {/* MATRIZ */}

            <table
              style={{
                width: "100%"
              }}
            >

              <tbody>

                {/* ADITIVO */}

                <tr>

                  <td
                    style={{
                      width: "180px",
                      fontWeight: "bold"
                    }}
                  >
                    Aditivo
                  </td>

                  <td>

                    <select
                      value={registro.aditivo}
                      onChange={(e) =>
                        handleChange(
                          registro.id,
                          "aditivo",
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    >

                      <option value="">
                        Seleccione
                      </option>

                      {aditivos.map(a => (
                        <option
                          key={a}
                          value={a}
                        >
                          {a}
                        </option>
                      ))}

                    </select>

                  </td>

                  <td
                    style={{
                      width: "150px"
                    }}
                  >

                    <input
                      type="number"
                      value={
                        registro.cantidadAditivo
                      }
                      onChange={(e) =>
                        handleChange(
                          registro.id,
                          "cantidadAditivo",
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    />

                  </td>

                </tr>

                {/* ALIMENTO */}

                <tr>

                  <td
                    style={{
                      fontWeight: "bold"
                    }}
                  >
                    Alimento
                  </td>

                  <td>

                    <select
                      value={registro.alimento}
                      onChange={(e) =>
                        handleChange(
                          registro.id,
                          "alimento",
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    >

                      <option value="">
                        Seleccione
                      </option>

                      {alimentos.map(a => (
                        <option
                          key={a}
                          value={a}
                        >
                          {a}
                        </option>
                      ))}

                    </select>

                  </td>

                  <td>

                    <input
                      type="number"
                      value={
                        registro.cantidadAlimento
                      }
                      onChange={(e) =>
                        handleChange(
                          registro.id,
                          "cantidadAlimento",
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    />

                  </td>

                </tr>

                {/* MEDICAMENTO */}

                <tr>

                  <td
                    style={{
                      fontWeight: "bold"
                    }}
                  >
                    Medicamento
                  </td>

                  <td>

                    <select
                      value={
                        registro.medicamento
                      }
                      onChange={(e) =>
                        handleChange(
                          registro.id,
                          "medicamento",
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    >

                      <option value="">
                        Seleccione
                      </option>

                      {medicamentos.map(m => (
                        <option
                          key={m}
                          value={m}
                        >
                          {m}
                        </option>
                      ))}

                    </select>

                  </td>

                  <td>

                    <input
                      type="number"
                      value={
                        registro.cantidadMedicamento
                      }
                      onChange={(e) =>
                        handleChange(
                          registro.id,
                          "cantidadMedicamento",
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    />

                  </td>

                </tr>

                {/* VACUNA */}

                <tr>

                  <td
                    style={{
                      fontWeight: "bold"
                    }}
                  >
                    Vacuna
                  </td>

                  <td>

                    <select
                      value={registro.vacuna}
                      onChange={(e) =>
                        handleChange(
                          registro.id,
                          "vacuna",
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    >

                      <option value="">
                        Seleccione
                      </option>

                      {vacunas.map(v => (
                        <option
                          key={v}
                          value={v}
                        >
                          {v}
                        </option>
                      ))}

                    </select>

                  </td>

                  <td>

                    <input
                      type="number"
                      value={
                        registro.cantidadVacuna
                      }
                      onChange={(e) =>
                        handleChange(
                          registro.id,
                          "cantidadVacuna",
                          e.target.value
                        )
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
