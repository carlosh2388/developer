import { useState } from "react";

funct*on OtrosIngresos() {

  // =======*=================
  // FECHA Y PRO*EEDOR
  // =======================*=

  const [fecha, setFecha] = use*tate(
    new Date().toISOString()*split("T")[0]
  );

  const [prove*dor, setProveedor] =
    useState(*");

  // ========================*
  // LISTAS
  // ================*========

  const vacunas = [
    *VA01",
    "VA02"
  ];

  const me*icamentos = [
    "MD01",
    "MD0*"
  ];

  const aditivos = [
    "*D01",
    "AD02"
  ];

  const ins*mos = [
    "IN01",
    "IN02"
  ]*

  const materiales = [
    "ME01*,
    "ME02"
  ];

  const aliment*s = [
    "Preinicio",
    "Inicio*,
    "Crecimiento",
    "Fase 1",
    "Fase 2"
  ];

  // =========================
  // FILAS DINÁMICAS
  // =========================

  const [filas, setFilas] =
    useState([]);

  // =========================
  // CREAR FILA
  // =========================

  const crearFila = (tipo) => ({
    id: Date.now() + Math.random(),
    tipo,
    item: "",
    cantidad: ""
  });

  // =========================
  // AGREGAR FILA
  // =========================

  const agregarFila = (tipo) => {
    setFilas((prev) => [
      ...prev,
      crearFila(tipo)
    ]);
  };

  // =========================
  // ELIMINAR FILA
  // =========================

  const eliminarFila = (id) => {
    setFilas((prev) =>
      prev.filter(
        (f) => f.id !== id
      )
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
    setFilas((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              value
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

    console.log({
      fecha,
      proveedor,
      insumos: filas
    });

    alert(
      "Insumos registrados correctamente"
    );
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

  const getOptions = (
    tipo
  ) => {
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
        return materiales;

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
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >
      <h2>
        Ingreso de Insumos
      </h2>

      {/* FECHA Y PROVEEDOR */}

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "15px"
        }}
      >
        <div style={{ flex: 1 }}>
          <label>Fecha</label>

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

        <div style={{ flex: 1 }}>
          <label>
            Proveedor
          </label>

          <select
            value={proveedor}
            onChange={(e) =>
              setProveedor(
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="">
              Seleccione
            </option>

            <option value="PR01">
              PR01
            </option>

            <option value="PR02">
              PR02
            </option>
          </select>
        </div>
      </div>

      {/* El resto del script permanece igual */}
    </div>
  );
}

export default OtrosIngresos;
