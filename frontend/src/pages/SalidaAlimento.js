import { useState } from "react";

function SalidaAlimento() {

  // =========================
  // FECHA
  // =========================

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  // =========================
  // CATÁLOGO DE ALIMENTOS
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

  // =========================
  // ESTADO POR FILA
  // =========================

  const crearEstadoFila = () => ({
    cantidad: "",
    galera1: "",
    galera2: "",
    galera3: "",
    galera4: "",
    galera5: "",
    crianza: ""
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

    alert("Salida de alimento registrada correctamente");
  };

  // =========================
  // ESTILO
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
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      <h2>Salida de Alimento</h2>

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
              <th>Cantidad</th>

              <th>% Galera 1</th>
              <th>% Galera 2</th>
              <th>% Galera 3</th>
              <th>% Galera 4</th>
              <th>% Galera 5</th>
              <th>% Crianza</th>

            </tr>
          </thead>

          <tbody>

            {alimentos.map((item) => (

              <tr key={item}>

                {/* ALIMENTO */}
                <td>
                  {item}
                </td>

                {/* CANTIDAD */}
                <td>
                  <input
                    type="number"
                    value={data[item].cantidad}
                    onChange={(e) =>
                      handleChange(
                        item,
                        "cantidad",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </td>

                {/* GALERAS */}
                <td>
                  <input
                    type="number"
                    value={data[item].galera1}
                    onChange={(e) =>
                      handleChange(item, "galera1", e.target.value)
                    }
                    style={inputStyle}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={data[item].galera2}
                    onChange={(e) =>
                      handleChange(item, "galera2", e.target.value)
                    }
                    style={inputStyle}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={data[item].galera3}
                    onChange={(e) =>
                      handleChange(item, "galera3", e.target.value)
                    }
                    style={inputStyle}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={data[item].galera4}
                    onChange={(e) =>
                      handleChange(item, "galera4", e.target.value)
                    }
                    style={inputStyle}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={data[item].galera5}
                    onChange={(e) =>
                      handleChange(item, "galera5", e.target.value)
                    }
                    style={inputStyle}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={data[item].crianza}
                    onChange={(e) =>
                      handleChange(item, "crianza", e.target.value)
                    }
                    style={inputStyle}
                  />
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {/* BOTÓN */}
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

export default SalidaAlimento;
