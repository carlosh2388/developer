import { useEffect, useState } from "react";

function EgresoHuevos() {

  // =========================
  // STATES BASE
  // =========================

  const [egreso, setEgreso] = useState("");

  const [fecha, setFecha] = useState("");

  const [hora, setHora] = useState("");

  const [lote] = useState("REP-260401-1600");

  // =========================
  // BODEGAS
  // =========================

  const [bodegaSalida, setBodegaSalida] = useState("BA");

  const [bodegaDestino, setBodegaDestino] = useState("");

  // =========================
  // PLACA
  // =========================

  const [placa, setPlaca] = useState("");

  const [nuevaPlaca, setNuevaPlaca] = useState("");

  const [placas, setPlacas] = useState([
    "L-123ABC",
    "L-456DEF"
  ]);

  // =========================
  // PILOTO
  // =========================

  const [piloto, setPiloto] = useState("");

  const [nuevoPiloto, setNuevoPiloto] = useState("");

  const [pilotos, setPilotos] = useState([
    "Juan Pérez",
    "Carlos López"
  ]);

  // =========================
  // CLASIFICACIÓN
  // =========================

  const [clasificacion, setClasificacion] = useState("Incubable");

  const [loteProd] = useState([
    "PRO-001",
    "PRO-002"
  ]);

  // =========================
  // CANTIDADES
  // =========================

  const [cantidades, setCantidades] = useState({
    pewee: 0,
    pequeno: 0,
    mediano: 0,
    grande: 0,
    extra: 0,
    mixto: 0
  });

  const [total, setTotal] = useState(0);

  const [fechaProd, setFechaProd] = useState("");

  // =========================
  // FECHA + HORA AUTOMÁTICA
  // =========================

  useEffect(() => {

    const now = new Date();

    setFecha(now.toISOString().split("T")[0]);

    setHora(now.toTimeString().slice(0, 5));

    setFechaProd(now.toISOString().split("T")[0]);

  }, []);

  // =========================
  // TOTAL AUTOMÁTICO
  // =========================

  useEffect(() => {

    const suma = Object.values(cantidades)
      .reduce((a, b) => a + (parseInt(b) || 0), 0);

    setTotal(suma);

  }, [cantidades]);

  // =========================
  // HANDLE CANTIDADES
  // =========================

  const handleCantidad = (e) => {

    setCantidades({
      ...cantidades,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // PLACA
  // =========================

  const agregarPlaca = () => {

    if (!nuevaPlaca.trim()) return;

    setPlacas([...placas, nuevaPlaca]);

    setPlaca(nuevaPlaca);

    setNuevaPlaca("");
  };

  // =========================
  // PILOTO
  // =========================

  const agregarPiloto = () => {

    if (!nuevoPiloto.trim()) return;

    setPilotos([...pilotos, nuevoPiloto]);

    setPiloto(nuevoPiloto);

    setNuevoPiloto("");
  };

  // =========================
  // GUARDAR
  // =========================

  const guardar = () => {

    const data = {

      egreso,
      fecha,
      hora,
      lote,
      bodegaSalida,
      bodegaDestino,
      placa,
      piloto,
      clasificacion,
      loteProd,
      cantidades,
      total,
      fechaProd
    };

    console.log(data);

    alert("Egreso registrado correctamente en ERP Avícola");
  };

  // =========================
  // RENDER
  // =========================

  return (

    <div className="container container-vertical">

      <h2>EGRESOS</h2>

      {/* DATOS BASE */}
      <label># Egreso</label>

      <input
        type="number"
        value={egreso}
        onChange={(e) =>
          setEgreso(e.target.value)
        }
      />

      <label>Fecha</label>

      <input
        type="date"
        value={fecha}
        onChange={(e) =>
          setFecha(e.target.value)
        }
      />

      <label>Hora</label>

      <input
        type="time"
        value={hora}
        onChange={(e) =>
          setHora(e.target.value)
        }
      />

      <label># Lote</label>

      <select value={lote} disabled>
        <option>{lote}</option>
      </select>

      {/* BODEGAS */}
      <label>Bodega de Salida</label>

      <select
        value={bodegaSalida}
        onChange={(e) =>
          setBodegaSalida(e.target.value)
        }
      >
        <option>BA</option>
        <option>BH</option>
        <option>BGR</option>
        <option>BI</option>
      </select>

      <label>Bodega Destino</label>

      <select
        value={bodegaDestino}
        onChange={(e) =>
          setBodegaDestino(e.target.value)
        }
      >

        <option value="">
          Sin Bodega de Destino
        </option>

        <option>BA</option>
        <option>BH</option>
        <option>BGR</option>
        <option>BI</option>

      </select>

      {/* PLACA */}
      <label>Placa Camión</label>

      <div className="erp-row">

        <select
          value={placa}
          onChange={(e) =>
            setPlaca(e.target.value)
          }
        >

          <option value="">
            Seleccione
          </option>

          {placas.map((p, i) => (
            <option key={i} value={p}>
              {p}
            </option>
          ))}

        </select>

        <input
          type="text"
          value={nuevaPlaca}
          onChange={(e) =>
            setNuevaPlaca(e.target.value)
          }
          placeholder="Nueva placa"
        />

        <button onClick={agregarPlaca}>
          ＋
        </button>

      </div>

      {/* PILOTO */}
      <label>Piloto</label>

      <div className="erp-row">

        <select
          value={piloto}
          onChange={(e) =>
            setPiloto(e.target.value)
          }
        >

          <option value="">
            Seleccione
          </option>

          {pilotos.map((p, i) => (
            <option key={i} value={p}>
              {p}
            </option>
          ))}

        </select>

        <input
          type="text"
          value={nuevoPiloto}
          onChange={(e) =>
            setNuevoPiloto(e.target.value)
          }
          placeholder="Nuevo piloto"
        />

        <button onClick={agregarPiloto}>
          ＋
        </button>

      </div>

      {/* CLASIFICACIÓN */}
      <label>Clasificación</label>

      <select
        value={clasificacion}
        onChange={(e) =>
          setClasificacion(e.target.value)
        }
      >

        <option>Incubable</option>
        <option>Comercial</option>
        <option>Sucio</option>
        <option>Quebrado</option>
        <option>Otros</option>

      </select>

      {/* CANTIDADES */}
      <div className="grid">

        {Object.keys(cantidades).map((k) => (
          <div key={k}>

            <label>{k}</label>

            <input
              type="number"
              name={k}
              value={cantidades[k]}
              onChange={handleCantidad}
            />

          </div>
        ))}

      </div>

      <label>Cantidad Total</label>

      <input type="number" value={total} readOnly />

      <label>Fecha Producción</label>

      <input
        type="date"
        value={fechaProd}
        onChange={(e) =>
          setFechaProd(e.target.value)
        }
      />

      <button onClick={guardar}>
        Registrar Egreso
      </button>

    </div>
  );
}

export default EgresoHuevos;