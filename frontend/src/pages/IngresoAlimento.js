import { useState } from "react";

function IngresoAlimento() {

  // =========================
  // FECHA
  // =========================

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  // =========================
  // LOTES (solo salida opcional eliminado)
  // =========================

  const [lote] = useState("REP-260401-1600");

  // =========================
  // FILAS DE INGRESO
  // =========================

  const alimentosDisponibles = [
    "Preinicio",
    "Inicio Polla",
    "Desarrollo Polla",
    "Crecimiento Polla",
    "Prepostura",
    "Fase 1",
    "Fase 2"
  ];

  const aditivosDisponibles = [
    "AD-001 Ejemplo"
  ];

  const medicamentosDisponibles = [
    "MD-001 Ejemplo"
  ];

  const crearFila = () => ({
    alimento: "",
    aditivo: "",
    medicamento: "",
    cantidadAlimento: "",
    cantidadAditivo: "",
    cantidadMedicamento: ""
  });

  const [filas, setFilas] = useState([
    crearFila()
  ]);

  // =========================
  // MANEJO FILAS
  // =========================

  const handleChange = (index, campo, value) => {
    setFilas(prev =>
      prev.map((fila, i) =>
        i === index
          ? { ...fila, [campo]: value }
          : fila
      )
    );
  };

  const agregarFila = () => {
    setFilas(prev => [...prev, crearFila()]);
  };

  const eliminarFila = (index) => {
    setFilas(prev =>
      prev.filter((_, i) => i !== index)
    );
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = (e) => {
    e.preventDefault();

    const data = {
      fecha,
      lote,
      movimientos: filas
    };

    console.log(data);

    alert("Ingreso registrado correctamente");
  };

  // =========================
  // ESTILOS
  // =========================

  const inputStyle = {
    width: "100%",
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "4px"
  };

  const btnSmall = {
    padding: "4px 8px",
    cursor: "pointer"
  };

  // =========================
  // RENDER
  // =========================

  return (

    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h2>Ingreso de Alimentos</h2>

      {/* FECHA */}
      <div style={{ marginBottom: "15px" }}>
        <label>Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) =>
            setFecha(e.target.value)
          }
          style={inputStyle}
        />
      </div>

      {/* TABLA */}
      <form onSubmit={guardar}>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse"
          }}
        >

          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th>Alimento</th>
              <th>Cant. Alimento</th>
              <th>Aditivo</th>
              <th>Cant. Aditivo</th>
              <th>Medicamento</th>
              <th>Cant. Medicamento</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            {filas.map((fila, index) => (

              <tr key={index}>

                {/* ALIMENTO */}
                <td>
                  <select
                    value={fila.alimento}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "alimento",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      Seleccione
                    </option>

                    {alimentosDisponibles.map(a => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </td>

                {/* CANTIDAD ALIMENTO */}
                <td>
                  <input
                    type="number"
                    value={fila.cantidadAlimento}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "cantidadAlimento",
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
                        index,
                        "aditivo",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      Seleccione
                    </option>

                    {aditivosDisponibles.map(a => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </td>

                {/* CANTIDAD ADITIVO */}
                <td>
                  <input
                    type="number"
                    value={fila.cantidadAditivo}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "cantidadAditivo",
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
                        index,
                        "medicamento",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      Seleccione
                    </option>

                    {medicamentosDisponibles.map(m => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </td>

                {/* CANTIDAD MEDICAMENTO */}
                <td>
                  <input
                    type="number"
                    value={fila.cantidadMedicamento}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "cantidadMedicamento",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </td>

                {/* ACCIONES */}
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      eliminarFila(index)
                    }
                    style={{
                      ...btnSmall,
                      background: "#d9534f",
                      color: "#fff",
                      border: "none"
                    }}
                  >
                    x
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {/* BOTONES */}
        <div
          style={{
            marginTop: "15px",
            display: "flex",
            gap: "10px"
          }}
        >

          <button
            type="button"
            onClick={agregarFila}
            style={btnSmall}
          >
            + Agregar fila
          </button>

          <button
            type="submit"
            style={{
              padding: "8px 16px",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "4px"
            }}
          >
            Guardar
          </button>

        </div>

      </form>

    </div>
  );
}

export default IngresoAlimento;
