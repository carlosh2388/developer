import { useEffect, useState } from "react";

function ControlPesoAves() {

  // =========================
  // STATES
  // =========================

  const [fecha, setFecha] = useState("");

  const [lote] = useState("REP-260401-1600");

  const [sexo, setSexo] = useState("Macho");

  const [etapa, setEtapa] = useState("");

  const [nuevaEtapa, setNuevaEtapa] = useState("");

  const [semana] = useState(1);

  const [peso, setPeso] = useState("");

  const [uniformidad, setUniformidad] = useState("");

  const [etapas, setEtapas] = useState([]);

  // =========================
  // FECHA AUTOMÁTICA + ETAPAS BASE
  // =========================

  useEffect(() => {

    const hoy = new Date()
      .toISOString()
      .split("T")[0];

    setFecha(hoy);

    setEtapas([
      "Crianza",
      "Levante",
      "Producción"
    ]);

  }, []);

  // =========================
  // AGREGAR ETAPA
  // =========================

  const agregarEtapa = () => {

    if (!nuevaEtapa.trim()) return;

    setEtapas([...etapas, nuevaEtapa]);

    setEtapa(nuevaEtapa);

    setNuevaEtapa("");
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = () => {

    const data = {

      fecha,
      lote,
      sexo,
      etapa,
      semana,
      peso,
      uniformidad
    };

    console.log(data);

    alert("Registro de pesos guardado correctamente");
  };

  // =========================
  // RENDER
  // =========================

  return (

    <div className="container container-vertical">

      <h2>Registro de Pesos de Aves</h2>

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
      <label># Lote</label>

      <select value={lote} disabled>
        <option>{lote}</option>
      </select>

      {/* SEXO */}
      <label>Sexo</label>

      <select
        value={sexo}
        onChange={(e) =>
          setSexo(e.target.value)
        }
      >

        <option>Macho</option>
        <option>Hembra</option>

      </select>

      {/* ETAPA */}
      <label>Etapa</label>

      <div className="erp-row">

        <select
          value={etapa}
          onChange={(e) =>
            setEtapa(e.target.value)
          }
        >

          <option value="">
            Seleccione etapa
          </option>

          {etapas.map((e, i) => (
            <option key={i} value={e}>
              {e}
            </option>
          ))}

        </select>

        <input
          type="text"
          value={nuevaEtapa}
          onChange={(e) =>
            setNuevaEtapa(e.target.value)
          }
          placeholder="Nueva etapa"
        />

        <button
          type="button"
          className="erp-btn"
          onClick={agregarEtapa}
        >
          ＋
        </button>

      </div>

      {/* SEMANA */}
      <label>Semana</label>

      <input
        type="number"
        value={semana}
        readOnly
      />

      {/* PESO */}
      <label>Peso (g)</label>

      <input
        type="number"
        step="0.01"
        value={peso}
        onChange={(e) =>
          setPeso(e.target.value)
        }
      />

      {/* UNIFORMIDAD */}
      <label>% Uniformidad</label>

      <input
        type="number"
        step="0.01"
        value={uniformidad}
        onChange={(e) =>
          setUniformidad(e.target.value)
        }
      />

      {/* BOTÓN */}
      <button onClick={guardar}>
        Guardar Registro
      </button>

    </div>
  );
}

export default ControlPesoAves;