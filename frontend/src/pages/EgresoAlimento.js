import { useState } from "react";

function EgresoAlimento() {

  // =========================
  // FECHA
  // =========================

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  // =========================
  // CREAR FILA
  // =========================

  const crearFila = () => ({

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
  // FILAS
  // =========================

  const [filas, setFilas] = useState([]);

  // =========================
  // AGREGAR FILA
  // =========================

  const agregarFila = () => {

    setFilas(prev => [
      ...prev,
      crearFila()
    ]);

  };

  // =========================
  // ELIMINAR FILA
  // =========================

  const eliminarFila = (id) => {

    setFilas(prev =>
      prev.filter(f => f.id !== id)
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

    setFilas(prev =>
      prev.map(f =>
        f.id === id
          ? {
              ...f,
              [campo]: value
            }
          : f
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

      movimientos: filas

    };

    console.log(payload);

    alert(
      "Salida de alimento registrada correctamente"
    );

  };

  // =========================
  // ESTILO INPUT
  // =========================

  const inputStyle = {

    width: "100%",

    padding: "6px",

    border: "1px solid #ccc",

    borderRadius: "4px",

    fontSize: "12px"

  };

  // =========================
  // RENDER
  // =========================

  return (

    <div
      style={{
        maxWidth: "1600px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h2>
        Salida de Alimento
      </h2>

      {/* FECHA Y BOTÓN */}

      <div
        style={{
          display: "flex",
          gap: "15px",
          alignItems: "flex-end",
          marginBottom: "20px"
        }}
      >

        <div>

          <label>
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
          onClick={agregarFila}
          style={{
            padding: "10px 15px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            height: "38px"
          }}
        >
          Proporcionar Alimento a Galera
        </button>

      </div>

      <form
        onSubmit={guardar}
      >

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse"
          }}
        >

          <thead>

            <tr
              style={{
                background: "#f5f5f5"
              }}
            >

              <th>Galera</th>

              <th>Alimento</th>
              <th>Cantidad</th>

              <th>Medicamento</th>
              <th>Cantidad</th>

              <th>Vacuna</th>
              <th>Cantidad</th>

              <th>Aditivo</th>
              <th>Cantidad</th>

              <th>Acción</th>

            </tr>

          </thead>

          <tbody>

            {filas.map((fila) => (

              <tr key={fila.id}>

                {/* GALERA */}

                <td>

                  <select
                    value={fila.galera}
                    onChange={(e) =>
                      handleChange(
                        fila.id,
                        "galera",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >

                    <option value="">
                      Seleccione
                    </option>

                    <option value="Galera 1">
                      Galera 1
                    </option>

                    <option value="Galera 2">
                      Galera 2
                    </option>

                    <option value="Galera 3">
                      Galera 3
                    </option>

                    <option value="Galera 4">
                      Galera 4
                    </option>

                    <option value="Galera 5">
                      Galera 5
                    </option>

                    <option value="Crianza">
                      Crianza
                    </option>

                  </select>

                </td>

                {/* ALIMENTO */}

                <td>

                  <select
                    value={fila.alimento}
                    onChange={(e) =>
                      handleChange(
                        fila.id,
                        "alimento",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >

                    <option value="">
                      Seleccione
                    </option>

                    <option value="Preinicio">
                      Preinicio
                    </option>

                    <option value="Inicio">
                      Inicio
                    </option>

                    <option value="Desarrollo">
                      Desarrollo
                    </option>

                    <option value="Crecimiento">
                      Crecimiento
                    </option>

                    <option value="Prepostura">
                      Prepostura
                    </option>

                    <option value="Fase 1">
                      Fase 1
                    </option>

                    <option value="Fase 2">
                      Fase 2
                    </option>

                  </select>

                </td>

                <td>

                  <input
                    type="number"
                    step="1"
                    value={
                      fila.cantidadAlimento
                    }
                    onChange={(e) =>
                      handleChange(
                        fila.id,
                        "cantidadAlimento",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />

                </td>

                {/* MEDICAMENTO */}

                <td>

                  <select
                    value={fila.medicamento}
                    onChange={(e) =>
                      handleChange(
                        fila.id,
                        "medicamento",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >

                    <option value="">
                      Seleccione
                    </option>

                    <option value="MED-001">
                      MED-001
                    </option>

                    <option value="MED-002">
                      MED-002
                    </option>

                  </select>

                </td>

                <td>

                  <input
                    type="number"
                    step="1"
                    value={
                      fila.cantidadMedicamento
                    }
                    onChange={(e) =>
                      handleChange(
                        fila.id,
                        "cantidadMedicamento",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />

                </td>

                {/* VACUNA */}

                <td>

                  <select
                    value={fila.vacuna}
                    onChange={(e) =>
                      handleChange(
                        fila.id,
                        "vacuna",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >

                    <option value="">
                      Seleccione
                    </option>

                    <option value="VAC-001">
                      VAC-001
                    </option>

                    <option value="VAC-002">
                      VAC-002
                    </option>

                  </select>

                </td>

                <td>

                  <input
                    type="number"
                    step="1"
                    value={
                      fila.cantidadVacuna
                    }
                    onChange={(e) =>
                      handleChange(
                        fila.id,
                        "cantidadVacuna",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />

                </td>
                {/* ADITIVO */}

                <td>

                  <select
                    value={fila.aditivo}
                    onChange={(e) =>
                      handleChange(
                        fila.id,
                        "aditivo",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >

                    <option value="">
                      Seleccione
                    </option>

                    <option value="AD-001">
                      AD-001
                    </option>

                    <option value="AD-002">
                      AD-002
                    </option>

                  </select>

                </td>

                {/* CANTIDAD ADITIVO */}

                <td>

                  <input
                    type="number"
                    step="1"
                    value={
                      fila.cantidadAditivo
                    }
                    onChange={(e) =>
                      handleChange(
                        fila.id,
                        "cantidadAditivo",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />

                </td>

                {/* ELIMINAR */}

                <td>

                  <button
                    type="button"
                    onClick={() =>
                      eliminarFila(
                        fila.id
                      )
                    }
                    style={{
                      background:
                        "#d9534f",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      padding: "6px 10px"
                    }}
                  >
                    X
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {/* BOTÓN GUARDAR */}

        <div
          style={{
            marginTop: "20px"
          }}
        >

          <button
            type="submit"
            style={{
              padding: "10px 20px",
              background:
                "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Guardar
          </button>

        </div>

      </form>

    </div>

  );

}

export default EgresoAlimento;          
          
