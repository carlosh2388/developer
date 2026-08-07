import { useState } from "react";

function IngresoInsumos() {

  // =========================
  // FECHA
  // =========================

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  // =========================
  // PROVEEDOR
  // =========================

  const [proveedor, setProveedor] = useState("");

  const proveedores = [
    "PR01",
    "PR02"
  ];

  // =========================
  // LISTAS
  // =========================

  const vacunas = [
    "VA01",
    "VA02"
  ];

  const medicamentos = [
    "MD01",
    "MD02"
  ];

  const aditivos = [
    "AD01",
    "AD02"
  ];

  const insumos = [
    "IN01",
    "IN02"
  ];

  const materialesEmpaque = [
    "ME01",
    "ME02"
  ];

  const alimentos = [
    "Preinicio",
    "Inicio",
    "Crecimiento",
    "Fase 1",
    "Fase 2"
  ];

  // =========================
  // FILAS DINÁMICAS
  // =========================

  const [filas, setFilas] = useState([]);

  // =========================
  // CREAR FILA
  // =========================

  const crearFila = (tipo) => ({
    id: Date.now() + Math.random(),
    tipo,
    item: "",
    cantidad: "",
    precio: ""
  });

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
  // GUARDAR
  // =========================

  const guardar = (e) => {
    e.preventDefault();

    console.log({
      fecha,
      proveedor,
      insumos: filas
    });

    alert("Insumos registrados correctamente");
  };

  // =========================
  // ESTILOS
  // =========================

  const btn = {
    padding: "10px",
    flex: 1,
    cursor: "pointer",
    border: "none",
    borderRadius: "5px",
    background: "#1976d2",
    color: "#fff"
  };

  const inputStyle = {
    width: "100%",
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "4px"
  };

  // =========================
  // OPTIONS POR TIPO
  // =========================

  const getOptions = (tipo) => {

    switch (tipo) {

      case "Vacunas":
        return vacunas;

      case "Medicamentos":
        return medicamentos;

      case "Aditivos":
        return aditivos;

      case "Insumos":
        return insumos;

      case "Material de Empaque":
        return materialesEmpaque;

      case "Alimento":
        return alimentos;

      default:
        return [];
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >
      <h2>Ingreso de Insumos</h2>

      {/* FECHA Y PROVEEDOR */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px"
        }}
      >
        <div style={{ flex: 1 }}>
          <label>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label>Proveedor</label>

          <select
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            style={inputStyle}
          >
            <option value="">
              Seleccione
            </option>

            {proveedores.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BOTONES */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap"
        }}
      >
        <button
          type="button"
          style={btn}
          onClick={() => agregarFila("Aditivos")}
        >
          Aditivos
        </button>

        <button
          type="button"
          style={btn}
          onClick={() => agregarFila("Alimento")}
        >
          Alimento
        </button>

        <button
          type="button"
          style={btn}
          onClick={() => agregarFila("Insumos")}
        >
          Insumos
        </button>

        <button
          type="button"
          style={btn}
          onClick={() => agregarFila("Material de Empaque")}
        >
          Material de Empaque
        </button>

        <button
          type="button"
          style={btn}
          onClick={() => agregarFila("Medicamentos")}
        >
          Medicamentos
        </button>

        <button
          type="button"
          style={btn}
          onClick={() => agregarFila("Vacunas")}
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
              <th style={{ padding: "10px" }}>Tipo</th>
              <th style={{ padding: "10px" }}>Nombre</th>
              <th style={{ padding: "10px" }}>Cantidad</th>
              <th style={{ padding: "10px" }}>Precio (Q)</th>
              <th style={{ padding: "10px" }}>Acción</th>
            </tr>
          </thead>

          <tbody>
            {filas.map((fila) => (

              <tr key={fila.id}>

                {/* TIPO */}
                <td style={{ padding: "8px" }}>
                  {fila.tipo}
                </td>

                {/* NOMBRE */}
                <td style={{ padding: "8px" }}>
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

                {/* CANTIDAD */}
                <td style={{ padding: "8px" }}>
                  <input
                    type="number"
                    min="0"
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

                {/* PRECIO */}
                <td style={{ padding: "8px" }}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={fila.precio}
                    onChange={(e) =>
                      handleChange(
                        fila.id,
                        "precio",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </td>

                {/* ACCIÓN */}
                <td style={{ padding: "8px" }}>
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

export default IngresoInsumos;
