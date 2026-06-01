import { useEffect, useState } from "react";

function IngresoHuevos() {

  // =========================
  // STATES BASE
  // =========================

  const [fecha, setFecha] = useState("");
  const [lote] = useState("REP-260401-1600");

  // =========================
  // OPCIONES DE CLASIFICACIÓN
  // =========================

  const opcionesGrupo = [
    "incubable",
    "comercial",
    "sucio",
    "quebrado",
    "otros"
  ];

  // =========================
  // CREAR GRUPO DINÁMICO
  // =========================

  const crearGrupo = () => ({
    id: Date.now() + Math.random(),
    tipo: "",
    abierto: true,
    pequeno: 0,
    mediano: 0,
    grande: 0,
    otrosClasificacion: 0,
    origen: ""
  });

  // =========================
  // LISTA DE GRUPOS
  // =========================

  const [grupos, setGrupos] = useState([
    crearGrupo()
  ]);

  // =========================
  // FECHA
  // =========================

  useEffect(() => {

    const now = new Date();

    setFecha(now.toISOString().split("T")[0]);

  }, []);

  // =========================
  // AGREGAR GRUPO
  // =========================

  const agregarGrupo = () => {

    setGrupos(prev => [
      ...prev,
      crearGrupo()
    ]);
  };

  // =========================
  // TOGGLE
  // =========================

  const toggleGrupo = (id) => {

    setGrupos(prev =>
      prev.map(grupo =>
        grupo.id === id
          ? {
              ...grupo,
              abierto: !grupo.abierto
            }
          : grupo
      )
    );
  };

  // =========================
  // HANDLE CAMPO
  // =========================

  const actualizarGrupo = (
    id,
    campo,
    valor
  ) => {

    setGrupos(prev =>
      prev.map(grupo =>
        grupo.id === id
          ? {
              ...grupo,
              [campo]: valor
            }
          : grupo
      )
    );
  };

  // =========================
  // TOTAL
  // =========================

  const calcularTotal = (grupo) => {

    return (
      (parseInt(grupo.pequeno) || 0) +
      (parseInt(grupo.mediano) || 0) +
      (parseInt(grupo.grande) || 0) +
      (parseInt(grupo.otrosClasificacion) || 0)
    );
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = () => {

    const data = {
      fecha,
      lote,
      grupos
    };

    console.log(data);

    alert("Registro guardado correctamente");
  };

  // =========================
  // RENDER GRUPO
  // =========================

  const renderGrupo = (grupo, index) => {

    const total = calcularTotal(grupo);

    return (

      <div
        key={grupo.id}
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "6px"
        }}
      >

        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px"
          }}
        >

          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "400"
            }}
          >
            Grupo #{index + 1}
          </h3>

          <button
            type="button"
            onClick={() => toggleGrupo(grupo.id)}
            style={{
              width: "28px",
              height: "28px",
              padding: 0,
              fontSize: "16px"
            }}
          >
            {grupo.abierto ? "-" : "+"}
          </button>

        </div>

        {/* TIPO DE GRUPO */}

        <div style={{ marginBottom: "10px" }}>

          <label>Clasificación</label>

          <select
            value={grupo.tipo}
            onChange={(e) =>
              actualizarGrupo(
                grupo.id,
                "tipo",
                e.target.value
              )
            }
          >
            <option value="">
              Seleccione
            </option>

            {opcionesGrupo.map(opcion => (
              <option
                key={opcion}
                value={opcion}
              >
                {opcion.charAt(0).toUpperCase() +
                  opcion.slice(1)}
              </option>
            ))}
          </select>

        </div>

        {/* BODY */}

        {grupo.abierto && (

          <>

            {/* FILA 1 */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px"
              }}
            >

              <div>

                <label>Pequeño</label>

                <input
                  type="number"
                  value={grupo.pequeno}
                  onChange={(e) =>
                    actualizarGrupo(
                      grupo.id,
                      "pequeno",
                      e.target.value
                    )
                  }
                />

              </div>

              <div>

                <label>Mediano</label>

                <input
                  type="number"
                  value={grupo.mediano}
                  onChange={(e) =>
                    actualizarGrupo(
                      grupo.id,
                      "mediano",
                      e.target.value
                    )
                  }
                />

              </div>

              <div>

                <label>Grande</label>

                <input
                  type="number"
                  value={grupo.grande}
                  onChange={(e) =>
                    actualizarGrupo(
                      grupo.id,
                      "grande",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* FILA 2 */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "10px",
                marginTop: "10px"
              }}
            >

              <div>

                <label>
                  Otros (lijado, deforme, pruebas)
                </label>

                <input
                  type="number"
                  value={grupo.otrosClasificacion}
                  onChange={(e) =>
                    actualizarGrupo(
                      grupo.id,
                      "otrosClasificacion",
                      e.target.value
                    )
                  }
                />

              </div>

              <div>

                <label>Total</label>

                <input
                  type="number"
                  value={total}
                  readOnly
                />

              </div>

            </div>

            {/* ORIGEN */}

            <div style={{ marginTop: "10px" }}>

              <label>Origen</label>

              <select
                value={grupo.origen}
                onChange={(e) =>
                  actualizarGrupo(
                    grupo.id,
                    "origen",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Seleccione
                </option>

                <option value="Nido">
                  Nido
                </option>

                <option value="Piso">
                  Piso
                </option>

              </select>

            </div>

          </>

        )}

      </div>

    );
  };

  // =========================
  // RENDER
  // =========================

  return (

    <div className="form-container">

      <h2>
        Ingreso de Huevos (Clasificación)
      </h2>

      {/* FECHA */}

      <label>Fecha</label>

      <input
        type="date"
        value={fecha}
        onChange={(e) =>
          setFecha(e.target.value)
        }
      />

      {/* LOTE */}

      <label>Lote</label>

      <select disabled>
        <option>{lote}</option>
      </select>

      {/* BOTÓN AGREGAR */}

      <div style={{ margin: "15px 0" }}>

        <button
          type="button"
          onClick={agregarGrupo}
          style={{
            width: "35px",
            height: "35px",
            fontSize: "20px"
          }}
        >
          +
        </button>

      </div>

      {/* GRUPOS */}

      {grupos.map(renderGrupo)}

      {/* GUARDAR */}

      <button onClick={guardar}>
        Guardar
      </button>

    </div>

  );
}

export default IngresoHuevos;
