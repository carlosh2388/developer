import { useState } from "react";

function IngresoAlimento() {

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
    "Preinicio",
    "Inicio",
    "Desarrollo",
    "Crecimiento",
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

  // =========================
  // ESTADO POR FILA (FIJO)
  // =========================

  const crearEstadoFila = () => ({
    aditivo: "",
    medicamento: ""
  });

  const inicial = {};

  alimentos.forEach(a => {
    inicial[a] = crearEstadoFila();
  });

  const [data, setData] = useState(inicial);

  // =========================
  // MANEJO DE CAMBIOS
  // =========================

  const handleChange = (alimento, campo, value) => {
    setData(prev => ({
      ...prev,
      [alimento]: {
        ...prev[alimento],
        [campo]: value
      }
    }));
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = (e) => {
    e.preventDefault();

    const payload = {
      fecha,
      movimientos: data
    };

    console.log(payload);

    alert("Ingreso registrado correctamente");
  };

  // =========================
  // ESTILO
  // =========================

  const inputStyle = {
    width: "100%",
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "4px"
  };

  return (

    <div
      style={{
        maxWidth: "900px",
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
              <th>Aditivo</th>
              <th>Medicamento</th>
            </tr>
          </thead>

          <tbody>

            {alimentos.map((item) => (

              <tr key={item}>

                {/* ALIMENTO */}
                <td>
                  {item}
                </td>

                {/* ADITIVO */}
                <td>
                  <select
                    value={data[item].aditivo}
                    onChange={(e) =>
                      handleChange(
                        item,
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

                {/* MEDICAMENTO */}
                <td>
                  <select
                    value={data[item].medicamento}
                    onChange={(e) =>
                      handleChange(
                        item,
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

              </tr>

            ))}

          </tbody>

        </table>

        {/* BOTÓN GUARDAR */}
        <div style={{ marginTop: "15px" }}>

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

        </div>

      </form>

    </div>
  );
}

export default IngresoAlimento;
