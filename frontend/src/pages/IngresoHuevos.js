import { useEffect, useState } from "react";

function IngresoHuevos() {

  // =========================
  // STATES BASE
  // =========================

  const [fecha, setFecha] = useState("");

  const [lote] = useState("REP-260401-1600");

  const [loteProd, setLoteProd] = useState("");

  // =========================
  // ESTRUCTURA DE GRUPOS
  // =========================

  const grupos = [
    "incubable",
    "comercial",
    "sucio",
    "quebrado",
    "otros"
  ];

  const tipos = [
    "blanco",
    "rojo"
  ];

  // =========================
  // EXPANSIÓN
  // =========================

  const [open, setOpen] = useState({

    blanco: {
      incubable: false,
      comercial: false,
      sucio: false,
      quebrado: false,
      otros: false
    },

    rojo: {
      incubable: false,
      comercial: false,
      sucio: false,
      quebrado: false,
      otros: false
    }
  });

  // =========================
  // CANTIDADES
  // =========================

  const crearGrupo = () => ({
    pewee: 0,
    pequeno: 0,
    mediano: 0,
    grande: 0,
    extra: 0,
    origen: ""
  });

  const [cantidades, setCantidades] = useState({

    blanco: {
      incubable: crearGrupo(),
      comercial: crearGrupo(),
      sucio: crearGrupo(),
      quebrado: crearGrupo(),
      otros: crearGrupo()
    },

    rojo: {
      incubable: crearGrupo(),
      comercial: crearGrupo(),
      sucio: crearGrupo(),
      quebrado: crearGrupo(),
      otros: crearGrupo()
    }
  });

  // =========================
  // FECHA + LOTE
  // =========================

  useEffect(() => {

    const now = new Date();

    setFecha(now.toISOString().split("T")[0]);

    const loteGen =
      "PRO-" +
      String(now.getFullYear()).slice(2) +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      "-" +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0");

    setLoteProd(loteGen);

  }, []);

  // =========================
  // HANDLE CANTIDAD
  // =========================

  const handleCantidad = (
    tipo,
    grupo,
    campo,
    value
  ) => {

    setCantidades(prev => ({
      ...prev,

      [tipo]: {
        ...prev[tipo],

        [grupo]: {
          ...prev[tipo][grupo],

          [campo]: value
        }
      }
    }));
  };

  // =========================
  // HANDLE ORIGEN
  // =========================

  const handleOrigen = (
    tipo,
    grupo,
    value
  ) => {

    setCantidades(prev => ({
      ...prev,

      [tipo]: {
        ...prev[tipo],

        [grupo]: {
          ...prev[tipo][grupo],

          origen: value
        }
      }
    }));
  };

  // =========================
  // TOTAL POR GRUPO
  // =========================

  const calcularTotal = (
    tipo,
    grupo
  ) => {

    const g = cantidades[tipo][grupo];

    return (
      (parseInt(g.pewee) || 0) +
      (parseInt(g.pequeno) || 0) +
      (parseInt(g.mediano) || 0) +
      (parseInt(g.grande) || 0) +
      (parseInt(g.extra) || 0)
    );
  };

  // =========================
  // TOGGLE
  // =========================

  const toggle = (
    tipo,
    grupo
  ) => {

    setOpen(prev => ({
      ...prev,

      [tipo]: {
        ...prev[tipo],

        [grupo]: !prev[tipo][grupo]
      }
    }));
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = () => {

    const data = {

      fecha,
      lote,
      loteProd,
      cantidades
    };

    console.log(data);

    alert("Registro guardado correctamente");
  };

  // =========================
  // RENDER SUBGRUPO
  // =========================

  const renderGrupo = (
    tipo,
    grupo
  ) => {

    const total = calcularTotal(
      tipo,
      grupo
    );

    return (

      <div style={{ marginBottom: "20px" }}>

        {/* HEADER */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>

          <h3
            style={{
              margin: 0,
              textTransform: "capitalize"
            }}
          >
            {grupo}
          </h3>

          <button
            type="button"
            onClick={() =>
              toggle(tipo, grupo)
            }
            style={{
              width: "28px",
              height: "28px",
              padding: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              lineHeight: "1"
            }}
          >
            {open[tipo][grupo] ? "-" : "+"}
          </button>

        </div>

        {/* BODY */}
        {open[tipo][grupo] && (

          <div>

            {/* FILA 1 */}
            <div style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "10px"
            }}>

              {[
                "pewee",
                "pequeno",
                "mediano"
              ].map(k => (

                <div key={k}>

                  <label>{k}</label>

                  <input
                    type="number"
                    value={
                      cantidades[tipo][grupo][k]
                    }
                    onChange={(e) =>
                      handleCantidad(
                        tipo,
                        grupo,
                        k,
                        e.target.value
                      )
                    }
                  />

                </div>

              ))}

            </div>

            {/* FILA 2 */}
            <div style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "10px",
              marginTop: "10px"
            }}>

              <div>

                <label>Grande</label>

                <input
                  type="number"
                  value={
                    cantidades[tipo][grupo]
                      .grande
                  }
                  onChange={(e) =>
                    handleCantidad(
                      tipo,
                      grupo,
                      "grande",
                      e.target.value
                    )
                  }
                />

              </div>

              <div>

                <label>Extra</label>

                <input
                  type="number"
                  value={
                    cantidades[tipo][grupo]
                      .extra
                  }
                  onChange={(e) =>
                    handleCantidad(
                      tipo,
                      grupo,
                      "extra",
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
                value={
                  cantidades[tipo][grupo]
                    .origen
                }
                onChange={(e) =>
                  handleOrigen(
                    tipo,
                    grupo,
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

          </div>

        )}

      </div>

    );
  };

  // =========================
  // RENDER TIPO
  // =========================

  const renderTipo = (tipo) => (

    <div style={{ marginBottom: "40px" }}>

      <h2 style={{
        textTransform: "capitalize"
      }}>
        Huevo {tipo}
      </h2>

      {grupos.map(grupo =>
        renderGrupo(tipo, grupo)
      )}

    </div>

  );

  // =========================
  // RENDER
  // =========================

  return (

    <div className="form-container">

      <h2>Ingreso de Huevos</h2>

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

      {/* LOTE PROD */}
      <label>Lote Producción</label>

      <input
        value={loteProd}
        readOnly
      />

      {/* HUEVO BLANCO */}
      {renderTipo("blanco")}

      {/* HUEVO ROJO */}
      {renderTipo("rojo")}

      {/* GUARDAR */}
      <button onClick={guardar}>
        Guardar
      </button>

    </div>
  );
}

export default IngresoHuevos;