import { useState } from "react";

function OtrosEgresos() {

  // =========================
  // FECHA
  // =========================

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  // =========================
  // OPCIONES
  // =========================

  const vacunas = ["VA01", "VA02"];

  const medicamentos = ["MD01", "MD02"];

  const aditivos = ["AD01", "AD02"];

  const insumos = ["IN01", "IN02"];

  const materiales = ["ME01", "ME02"];

  const galeras = [
    "Galera 1",
    "Galera 2",
    "Galera 3",
    "Galera 4",
    "Galera 5",
    "Crecimiento"
  ];

  // =========================
  // FILAS
  // =========================

  const [filas, setFilas] = useState([]);

  const crearFila = (tipo) => ({
    id: Date.now() + Math.random(),
    tipo,
    item: "",
    cantidad: "",
    galeras: []
  });

  const agregarFila = (tipo) => {
    setFilas(prev => [...prev, crearFila(tipo)]);
  };

  const eliminarFila = (id) => {
    setFilas(prev => prev.filter(f => f.id !== id));
  };

  // =========================
  // CAMBIOS
  // =========================

  const handleChange = (id, campo, value) => {
    setFilas(prev =>
      prev.map(f =>
        f.id === id
          ? { ...f, value }
          : f
      )
    );
  };

  // =========================
  // GALERAS DINÁMICAS
  // =========================

  const agregarGalera = (filaId) => {
    setFilas(prev =>
      prev.map(f =>
        f.id === filaId
          ? {
              ...f,
              galeras: [
                ...f.galeras,
                {
                  galera: "",
                  cantidad: ""
                }
              ]
            }
          : f
      )
    );
  };

  const handleGaleraChange = (
    filaId,
    index,
    campo,
    value
  ) => {
    setFilas(prev =>
      prev.map(f => {
        if (f.id !== filaId) return f;

        const nuevas = [...f.galeras];

        nuevas[index] = {
          ...nuevas[index],
          value
        };

        return {
          ...f,
          galeras: nuevas
        };
      })
    );
  };

  // =========================
  // OPTIONS POR TIPO
  // =========================

  const getOptions = (tipo) => {
    switch (tipo) {

      case "Aditivos":
        return aditivos;

      case "Insumos":
        return insumos;

      case "Material de Empaque":
        return materiales;

      case "Medicamentos":
        return medicamentos;

      case "Vacuna":
        return vacunas;

      default:
        return [];
    }
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = (e) => {
    e.preventDefault();

    console.log({
      fecha,
      insumos: filas
    });

    alert(
      "Egreso de insumos registrado correctamente"
    );
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

  const btn = {
    padding: "10px",
    flex: 1,
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  };

  const btnSmall = {
    padding: "5px 10px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "5px"
  };

  const galeraRow = {
    display: "flex",
    gap: "8px",
    marginBottom: "5px"
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

      <h2>Egreso de Insumos</h2>

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

      {/* BOTONES */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "15px"
        }}
      >

        <button
          type="button"
          style={btn}
          onClick={() =>
            agregarFila("Aditivos")
          }
        >
          Aditivos
        </button>

        <button
          type="button"
          style={btn}
          onClick={() =>
            agregarFila("Insumos")
          }
        >
          Insumos
        </button>

        <button
          type="button"
          style={btn}
          onClick={() =>
            agregarFila("Material de Empaque")
          }
        >
          Material de Empaque
        </button>

        <button
          type="button"
          style={btn}
          onClick={() =>
            agregarFila("Medicamentos")
          }
        >
          Medicamentos
        </button>

        <button
          type="button"
          style={btn}
          onClick={() =>
            agregarFila("Vacuna")
          }
        >
          Vacunas
        </button>

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
              <th>Tipo</th>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Galeras</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>

            {filas.map((fila) => (

              <tr key={fila.id}>

                <td>{fila.tipo}</td>

                <td>
                  <select
                    value={fila.item}
                    onChange={(e) =>
                      handleChange(
                        fila.id,
                        "item",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      Seleccione
                    </option>

                    {getOptions(fila.tipo).map(op => (
                      <option
                        key={op}
                        value={op}
                      >
                        {op}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  <input
                    type="number"
                    value={fila.cantidad}
                    onChange={(e) =>
                      handleChange(
                        fila.id,
                        "cantidad",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </td>

                {/* GALERAS */}

                <td>

                  <button
                    type="button"
                    onClick={() =>
                      agregarGalera(fila.id)
                    }
                    style={btnSmall}
                  >
                    Agregar
                  </button>

                  {fila.galeras.map(
                    (g, index) => (
                      <div
                        key={index}
                        style={galeraRow}
                      >

                        <select
                          value={g.galera}
                          onChange={(e) =>
                            handleGaleraChange(
                              fila.id,
                              index,
                              "galera",
                              e.target.value
                            )
                          }
                          style={inputStyle}
                        >
                          <option value="">
                            Seleccione
                          </option>

                          {galeras.map(opt => (
                            <option
                              key={opt}
                              value={opt}
                            >
                              {opt}
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          value={g.cantidad}
                          onChange={(e) =>
                            handleGaleraChange(
                              fila.id,
                              index,
                              "cantidad",
                              e.target.value
                            )
                          }
                          style={inputStyle}
                        />

                      </div>
                    )
                  )}

                </td>

                <td>
                  <button
                    type="button"
                    onClick={() =>
                      eliminarFila(fila.id)
                    }
                    style={{
                      padding: "5px 10px",
                      background: "#d9534f",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    X
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        <div style={{ marginTop: "20px" }}>
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

export default OtrosEgresos;
