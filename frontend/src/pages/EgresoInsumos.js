import { useState } from "react";

function EgresoInsumos() {

  // =========================
  // FECHA
  // =========================

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  // =========================
  // OPCIONES
  // =========================

  const vacunas = ["VAC-001", "VAC-002"];
  const medicamentos = ["MED-001", "MED-002"];
  const aditivos = ["AD-001", "AD-002"];
  const materiales = ["MAT-001", "MAT-002"];

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
        f.id === id ? { ...f, [campo]: value } : f
      )
    );
  };

  // =========================
  // GALERAS MULTISELECT
  // =========================

  const toggleGalera = (id, galera) => {
    setFilas(prev =>
      prev.map(f => {

        if (f.id !== id) return f;

        const existe = f.galeras.includes(galera);

        return {
          ...f,
          galeras: existe
            ? f.galeras.filter(g => g !== galera)
            : [...f.galeras, galera]
        };

      })
    );
  };

  // =========================
  // OPTIONS POR TIPO
  // =========================

  const getOptions = (tipo) => {

    switch (tipo) {

      case "Vacuna":
        return vacunas;

      case "Medicamento":
        return medicamentos;

      case "Aditivos":
        return aditivos;

      case "Materiales":
        return materiales;

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

    alert("Egreso de insumos registrado correctamente");
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

  const galeraBox = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "5px",
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
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>

        <button type="button" style={btn} onClick={() => agregarFila("Vacuna")}>
          Vacuna
        </button>

        <button type="button" style={btn} onClick={() => agregarFila("Medicamento")}>
          Medicamento
        </button>

        <button type="button" style={btn} onClick={() => agregarFila("Aditivos")}>
          Aditivos
        </button>

        <button type="button" style={btn} onClick={() => agregarFila("Materiales")}>
          Materiales
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

            {filas.map(fila => (

              <tr key={fila.id}>

                {/* TIPO */}
                <td>{fila.tipo}</td>

                {/* ITEM */}
                <td>
                  <select
                    value={fila.item}
                    onChange={(e) =>
                      handleChange(fila.id, "item", e.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="">Seleccione</option>

                    {getOptions(fila.tipo).map(op => (
                      <option key={op} value={op}>
                        {op}
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
                      handleChange(fila.id, "cantidad", e.target.value)
                    }
                    style={inputStyle}
                  />
                </td>

                {/* GALERAS MULTISELECT */}
                <td>
                  <div style={galeraBox}>

                    {galeras.map(g => (

                      <label key={g}>
                        <input
                          type="checkbox"
                          checked={fila.galeras.includes(g)}
                          onChange={() =>
                            toggleGalera(fila.id, g)
                          }
                        />
                        {" "}{g}
                      </label>

                    ))}

                  </div>
                </td>

                {/* ELIMINAR */}
                <td>
                  <button
                    type="button"
                    onClick={() => eliminarFila(fila.id)}
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

        {/* GUARDAR */}
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

export default EgresoInsumos;
