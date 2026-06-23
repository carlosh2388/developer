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

  const alimentosOptions = [
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
  // CREAR FILA
  // =========================

  const crearFila = () => ({
    id: Date.now() + Math.random(),
    alimento: "",
    cantidad: "",
    aditivo: "",
    medicamento: ""
  });

  const [filas, setFilas] = useState([]);

  // =========================
  // MANEJO
  // =========================

  const agregarFila = () => {
    setFilas(prev => [...prev, crearFila()]);
  };

  const eliminarFila = (id) => {
    setFilas(prev => prev.filter(f => f.id !== id));
  };

  const handleChange = (id, campo, value) => {
    setFilas(prev =>
      prev.map(f =>
        f.id === id ? { ...f, [campo]: value } : f
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

  const btnDelete = {
    padding: "6px 10px",
    background: "#d9534f",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  };

  const btnAdd = {
    padding: "10px 15px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
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
          onChange={(e) => setFecha(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* BOTÓN AGREGAR */}
      <div style={{ marginBottom: "15px" }}>
        <button
          type="button"
          onClick={agregarFila}
          style={btnAdd}
        >
          Agregar Alimento
        </button>
      </div>

      {/* FORM */}
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
              <th>Aditivo</th>
              <th>Medicamento</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>

            {filas.map((fila) => (

              <tr key={fila.id}>

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

                    {alimentosOptions.map(a => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </td>

                {/* CANTIDAD */}
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
                    {medicamentosDisponibles.map(m => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </td>

                {/* ACCIÓN */}
                <td>
                  <button
                    type="button"
                    onClick={() => eliminarFila(fila.id)}
                    style={btnDelete}
                  >
                    X
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {/* GUARDAR */}
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
