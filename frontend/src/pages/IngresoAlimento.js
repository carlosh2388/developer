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

  const materialesDisponibles = [
    "MAT-001",
    "MAT-002"
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

  const crearFila = (tipo) => ({
    id: Date.now() + Math.random(),
    tipo,
    alimento: "",
    material: "",
    cantidad: "",
    aditivo: "",
    medicamento: ""
  });

  // =========================
  // FILAS
  // =========================

  const [filas, setFilas] = useState([]);

  // =========================
  // AGREGAR FILA
  // =========================

  const agregarFila = (tipo) => {

    setFilas(prev => [
      ...prev,
      crearFila(tipo)
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
  // CAMBIOS
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
      "Ingreso registrado correctamente"
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

      <h2>
        Ingreso de Alimentos
      </h2>

      {/* FECHA */}
      <div
        style={{
          marginBottom: "15px"
        }}
      >

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
          onClick={() =>
            agregarFila(
              "Alimento"
            )
          }
          style={btnAdd}
        >
          Agregar Alimento
        </button>

        <button
          type="button"
          onClick={() =>
            agregarFila(
              "Material"
            )
          }
          style={btnAdd}
        >
          Agregar Material
        </button>

      </div>

      <form
        onSubmit={guardar}
      >

        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse"
          }}
        >

          <thead>

            <tr
              style={{
                background:
                  "#f5f5f5"
              }}
            >

              <th>
                Alimento / Material
              </th>

              <th>
                Cantidad
              </th>

              <th>
                Aditivo
              </th>

              <th>
                Medicamento
              </th>

              <th>
                Acción
              </th>

            </tr>

          </thead>

          <tbody>

            {filas.map(
              (fila) => (

                <tr
                  key={fila.id}
                >

                  {/* ALIMENTO O MATERIAL */}
                  <td>

                    {fila.tipo ===
                    "Alimento" ? (

                      <select
                        value={
                          fila.alimento
                        }
                        onChange={(
                          e
                        ) =>
                          handleChange(
                            fila.id,
                            "alimento",
                            e.target
                              .value
                          )
                        }
                        style={
                          inputStyle
                        }
                      >

                        <option value="">
                          Seleccione
                        </option>

                        {alimentosOptions.map(
                          (
                            alimento
                          ) => (
                            <option
                              key={
                                alimento
                              }
                              value={
                                alimento
                              }
                            >
                              {
                                alimento
                              }
                            </option>
                          )
                        )}

                      </select>

                    ) : (

                      <select
                        value={
                          fila.material
                        }
                        onChange={(
                          e
                        ) =>
                          handleChange(
                            fila.id,
                            "material",
                            e.target
                              .value
                          )
                        }
                        style={
                          inputStyle
                        }
                      >

                        <option value="">
                          Seleccione
                        </option>

                        {materialesDisponibles.map(
                          (
                            material
                          ) => (
                            <option
                              key={
                                material
                              }
                              value={
                                material
                              }
                            >
                              {
                                material
                              }
                            </option>
                          )
                        )}

                      </select>

                    )}

                  </td>

                  {/* CANTIDAD */}
                  <td>

                    <input
                      type="number"
                      step="1"
                      value={
                        fila.cantidad
                      }
                      onChange={(e) =>
                        handleChange(
                          fila.id,
                          "cantidad",
                          e.target
                            .value
                        )
                      }
                      style={
                        inputStyle
                      }
                    />

                  </td>

                {/* CANTIDAD */}
                <td>
                  <input
                    type="number"
                    step="1"
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
                  {fila.tipo === "Material" ? (
                    <span>
                      No aplica
                    </span>
                  ) : (
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
                        <option
                          key={a}
                          value={a}
                        >
                          {a}
                        </option>
                      ))}
                    </select>
                  )}
                </td>

                {/* MEDICAMENTO */}
                <td>
                  {fila.tipo === "Material" ? (
                    <span>
                      No aplica
                    </span>
                  ) : (
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
                        <option
                          key={m}
                          value={m}
                        >
                          {m}
                        </option>
                      ))}
                    </select>
                  )}
                </td>

                {/* ACCIÓN */}
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      eliminarFila(
                        fila.id
                      )
                    }
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
        <div
          style={{
            marginTop: "15px"
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

export default IngresoAlimento;
