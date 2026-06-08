import { useEffect, useState } from "react";

function IngresoHuevos() {

// =========================
// FECHA
// =========================

const [fecha, setFecha] = useState("");

// =========================
// LOTES
// =========================

const lotes = [
"REP-260401-1600",
"REP-260401-1601",
"REP-260401-1602"
];

// =========================
// CLASIFICACION
// =========================

const opcionesGrupo = [
"Incubable",
"Comercial"
];

// =========================
// PERSONAS
// =========================

const personas = [
"Tomas Pérez",
"María Gomez"
];

// =========================
// INCUBABLE
// =========================

const tamanosIncubable = [
"Grande",
"Mediano",
"Pequeño",
"Otros",
"Otros Piso"
];

// =========================
// COMERCIAL
// =========================

const tamanosComercial = [
"Extra Grande",
"Grande",
"Mediano",
"Pequeño",
"Pewee",
"Otros"
];

// =========================
// CREAR FILA INCUBABLE
// =========================

const crearFilaIncubable = (
tipo = "Nido"
) => ({
tipo,
x336: 0,
x360: 0
});

// =========================
// CREAR FILA COMERCIAL
// =========================

const crearFilaComercial = (
tipo = "Nido"
) => ({
tipo,
x360: 0,
x30: 0,
x1: 0
});

// =========================
// CREAR GRUPO
// =========================

const crearGrupo = () => ({
id: Date.now() + Math.random(),
abierto: true,
tipo: "",
lote: lotes[0],
recolector: "",
clasificador: "",
peso: "",
datos: {}
});

// =========================
// ESTADO
// =========================

const [grupos, setGrupos] = useState([
crearGrupo()
]);

// =========================
// FECHA INICIAL
// =========================

useEffect(() => {

```
const now = new Date();

setFecha(
  now.toISOString().split("T")[0]
);
```

}, []);

// =========================
// AGREGAR
// =========================

const agregarGrupo = () => {

```
setGrupos(prev => [
  ...prev,
  crearGrupo()
]);
```

};

// =========================
// ELIMINAR
// =========================

const eliminarGrupo = (id) => {

```
setGrupos(prev =>
  prev.filter(
    g => g.id !== id
  )
);
```

};

// =========================
// TOGGLE
// =========================

const toggleGrupo = (id) => {

```
setGrupos(prev =>
  prev.map(g =>
    g.id === id
      ? {
          ...g,
          abierto: !g.abierto
        }
      : g
  )
);
```

};

// =========================
// UPDATE SIMPLE
// =========================

const actualizarGrupo = (
id,
campo,
valor
) => {

```
setGrupos(prev =>
  prev.map(g =>
    g.id === id
      ? {
          ...g,
          [campo]: valor
        }
      : g
  )
);
```

};

// =========================
// UPDATE TABLA
// =========================

const actualizarTabla = (
grupoId,
tamano,
campo,
valor
) => {

```
setGrupos(prev =>
  prev.map(g => {

    if (g.id !== grupoId)
      return g;

    return {
      ...g,
      datos: {
        ...g.datos,
        [tamano]: {
          ...g.datos?.[tamano],
          [campo]:
            campo === "tipo"
              ? valor
              : Number(valor)
        }
      }
    };

  })
);
```

};

// =========================
// TOTAL FILA
// =========================

const calcularTotalFila = (
fila,
clasificacion
) => {

```
if (
  clasificacion ===
  "Incubable"
) {

  return (
    (fila?.x336 || 0) * 336 +
    (fila?.x360 || 0) * 360
  );

}

return (
  (fila?.x360 || 0) * 360 +
  (fila?.x30 || 0) * 30 +
  (fila?.x1 || 0)
);
```

};

// =========================
// TOTAL GRUPO
// =========================

const calcularTotalGrupo = (
grupo
) => {

```
let total = 0;

Object.keys(
  grupo.datos || {}
).forEach(key => {

  total += calcularTotalFila(
    grupo.datos[key],
    grupo.tipo
  );

});

return total;
```

};

// =========================
// RENDER GRUPO
// =========================

const renderGrupo = (
grupo,
index
) => {

```
const totalGrupo =
  calcularTotalGrupo(
    grupo
  );

return (

  <div
    key={grupo.id}
    style={{
      border:
        "1px solid #ddd",
      borderRadius: "6px",
      padding: "15px",
      marginBottom: "15px"
    }}
  >

    {/* HEADER */}

    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems:
          "flex-start",
        gap: "10px",
        flexWrap: "wrap"
      }}
    >

      {/* IZQUIERDA */}

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap"
        }}
      >

        {/* CLASIFICACION */}

        <div>

          <label>
            Clasificación
          </label>

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

            {opcionesGrupo.map(
              op => (
                <option
                  key={op}
                  value={op}
                >
                  {op}
                </option>
              )
            )}

          </select>

        </div>

        {/* LOTE */}

        <div>

          <label>
            Lote
          </label>

          <select
            value={grupo.lote}
            onChange={(e) =>
              actualizarGrupo(
                grupo.id,
                "lote",
                e.target.value
              )
            }
          >

            {lotes.map(l => (

              <option
                key={l}
                value={l}
              >
                {l}
              </option>

            ))}

          </select>

        </div>

        {/* TOTAL */}

        <div>

          <label>
            Total
          </label>

          <div
            style={{
              padding:
                "6px 10px",
              border:
                "1px solid #ccc",
              borderRadius:
                "4px",
              minWidth:
                "90px",
              textAlign:
                "center",
              background:
                "#f8f8f8",
              fontWeight:
                "600"
            }}
          >
            {totalGrupo}
          </div>

        </div>

      </div>

      {/* BOTONES */}

      <div
        style={{
          display: "flex",
          gap: "6px"
        }}
      >

        <button
          type="button"
          onClick={() =>
            toggleGrupo(
              grupo.id
            )
          }
        >
          {grupo.abierto
            ? "-"
            : "+"}
        </button>

        <button
          type="button"
          onClick={() =>
            eliminarGrupo(
              grupo.id
            )
          }
          style={{
            background:
              "red",
            color: "#fff"
          }}
        >
          X
        </button>

      </div>

    </div>

    {/* BODY */}

    {grupo.abierto && (

      <>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              grupo.tipo ===
              "Incubable"
                ? "1fr 1fr 1fr"
                : "1fr 1fr",
            gap: "10px",
            marginTop:
              "15px"
          }}
        >
```

```
          {/* RECOLECTOR */}

          <div>

            <label>
              Recolector
            </label>

            <select
              value={
                grupo.recolector
              }
              onChange={(e) =>
                actualizarGrupo(
                  grupo.id,
                  "recolector",
                  e.target.value
                )
              }
            >

              <option value="">
                Seleccione
              </option>

              {personas.map(p => (

                <option
                  key={p}
                  value={p}
                >
                  {p}
                </option>

              ))}

            </select>

          </div>

          {/* CLASIFICADOR */}

          <div>

            <label>
              Clasificador
            </label>

            <select
              value={
                grupo.clasificador
              }
              onChange={(e) =>
                actualizarGrupo(
                  grupo.id,
                  "clasificador",
                  e.target.value
                )
              }
            >

              <option value="">
                Seleccione
              </option>

              {personas.map(p => (

                <option
                  key={p}
                  value={p}
                >
                  {p}
                </option>

              ))}

            </select>

          </div>

          {/* PESO */}

          {grupo.tipo ===
            "Incubable" && (

            <div>

              <label>
                Peso (gramos)
              </label>

              <input
                type="number"
                step="1"
                min="0"
                value={grupo.peso}
                onChange={(e) =>
                  actualizarGrupo(
                    grupo.id,
                    "peso",
                    parseInt(
                      e.target.value || 0
                    )
                  )
                }
              />

            </div>

          )}

        </div>

        {/* =========================
            TABLA INCUBABLE
        ========================= */}

        {grupo.tipo ===
          "Incubable" && (

          <div
            style={{
              marginTop:
                "15px",
              overflowX:
                "auto"
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse"
              }}
            >

              <thead>

                <tr>
                  <th>
                    Tamaño
                  </th>

                  <th>
                    Tipo
                  </th>

                  <th>
                    336
                  </th>

                  <th>
                    360
                  </th>

                  <th>
                    Total
                  </th>
                </tr>

              </thead>

              <tbody>

                {tamanosIncubable.map(
                  tamano => {

                    const fila =
                      grupo.datos?.[
                        tamano
                      ] ||
                      crearFilaIncubable(
                        tamano ===
                          "Otros Piso"
                          ? "Piso"
                          : "Nido"
                      );

                    return (

                      <tr
                        key={tamano}
                      >

                        <td>
                          {tamano}
                        </td>

                        <td>

                          <select
                            value={
                              fila.tipo
                            }
                            onChange={(
                              e
                            ) =>
                              actualizarTabla(
                                grupo.id,
                                tamano,
                                "tipo",
                                e.target
                                  .value
                              )
                            }
                          >

                            <option value="Nido">
                              Nido
                            </option>

                            <option value="Piso">
                              Piso
                            </option>

                          </select>

                        </td>

                        <td>

                          <input
                            type="number"
                            value={
                              fila.x336
                            }
                            onChange={(
                              e
                            ) =>
                              actualizarTabla(
                                grupo.id,
                                tamano,
                                "x336",
                                e.target
                                  .value
                              )
                            }
                          />

                        </td>

                        <td>

                          <input
                            type="number"
                            value={
                              fila.x360
                            }
                            onChange={(
                              e
                            ) =>
                              actualizarTabla(
                                grupo.id,
                                tamano,
                                "x360",
                                e.target
                                  .value
                              )
                            }
                          />

                        </td>

                        <td>

                          {
                            calcularTotalFila(
                              fila,
                              "Incubable"
                            )
                          }

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

            <div
              style={{
                marginTop:
                  "10px",
                fontSize:
                  "13px",
                color:
                  "#666",
                fontWeight:
                  "500"
              }}
            >
              Otros =
              Pruebas,
              Lijado,
              Deforme y
              Traslucido
            </div>

          </div>

        )}
```
```
        {/* =========================
            TABLA COMERCIAL
        ========================= */}

        {grupo.tipo ===
          "Comercial" && (

          <div
            style={{
              marginTop:
                "15px",
              overflowX:
                "auto"
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse"
              }}
            >

              <thead>

                <tr>

                  <th>
                    Tamaño
                  </th>

                  <th>
                    Tipo
                  </th>

                  <th>
                    360
                  </th>

                  <th>
                    30
                  </th>

                  <th>
                    1
                  </th>

                  <th>
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {tamanosComercial.map(
                  tamano => {

                    const fila =
                      grupo.datos?.[
                        tamano
                      ] ||
                      crearFilaComercial();

                    return (

                      <tr
                        key={tamano}
                      >

                        <td>
                          {tamano}
                        </td>

                        <td>

                          <select
                            value={
                              fila.tipo
                            }
                            onChange={(
                              e
                            ) =>
                              actualizarTabla(
                                grupo.id,
                                tamano,
                                "tipo",
                                e.target
                                  .value
                              )
                            }
                          >

                            <option value="Nido">
                              Nido
                            </option>

                            <option value="Piso">
                              Piso
                            </option>

                          </select>

                        </td>

                        <td>

                          <input
                            type="number"
                            value={
                              fila.x360
                            }
                            onChange={(
                              e
                            ) =>
                              actualizarTabla(
                                grupo.id,
                                tamano,
                                "x360",
                                e.target
                                  .value
                              )
                            }
                          />

                        </td>

                        <td>

                          <input
                            type="number"
                            value={
                              fila.x30
                            }
                            onChange={(
                              e
                            ) =>
                              actualizarTabla(
                                grupo.id,
                                tamano,
                                "x30",
                                e.target
                                  .value
                              )
                            }
                          />

                        </td>

                        <td>

                          <input
                            type="number"
                            value={
                              fila.x1
                            }
                            onChange={(
                              e
                            ) =>
                              actualizarTabla(
                                grupo.id,
                                tamano,
                                "x1",
                                e.target
                                  .value
                              )
                            }
                          />

                        </td>

                        <td>

                          {
                            calcularTotalFila(
                              fila,
                              "Comercial"
                            )
                          }

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

        {/* ESTILOS */}

        <style>
          {`
            th {
              text-align:center;
              padding:6px;
              font-weight:600;
            }

            td {
              padding:4px;
              text-align:center;
            }

            td:first-child {
              text-align:left;
              font-weight:500;
            }

            input {
              width:70px;
            }

            select {
              width:100%;
            }
          `}
        </style>

      </>

    )}

  </div>

);
```

};

// =========================
// GUARDAR
// =========================

const guardar = () => {

```
const data = {
  fecha,
  clasificaciones:
    grupos
};

console.log(data);

alert(
  "Registro guardado correctamente"
);
```

};

// =========================
// RENDER PRINCIPAL
// =========================

return (

```
<div
  className="form-container"
>

  <h2>
    Ingreso de Huevos
  </h2>

  {/* FECHA */}

  <div
    style={{
      minWidth:
        "160px",
      flexShrink: 0
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
    />

  </div>

  {/* AGREGAR */}

  <div
    style={{
      margin:
        "15px 0"
    }}
  >

    <button
      type="button"
      onClick={
        agregarGrupo
      }
      style={{
        width: "40px",
        height: "40px",
        fontSize:
          "22px"
      }}
    >
      +
    </button>

  </div>

  {/* GRUPOS */}

  {grupos.map(
    renderGrupo
  )}

  {/* GUARDAR */}

  <button
    onClick={guardar}
    style={{
      marginTop:
        "20px",
      padding:
        "10px 20px"
    }}
  >
    Guardar
  </button>

</div>
```

);

}

export default IngresoHuevos;

  
