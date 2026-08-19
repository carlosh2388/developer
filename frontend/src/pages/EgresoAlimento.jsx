import { useState } from "react";
import { loadInventoryDocument, quantityInput, saveInventory } from "../services/operations";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";
import OperationRecordsModal, { inventoryColumns } from "../components/OperationRecordsModal";
import OperationPanel from "../components/OperationPanel";
import CancelEditButton from "../components/CancelEditButton";

const catalogName = (item) => {
  const prefix = `${item.value} - `;
  return item.label?.startsWith(prefix) ? item.label.slice(prefix.length) : item.label;
};

function EgresoAlimento() {
  const { productosPorTipo, opciones } = useOperationalCatalogs(["productos", "galeras"]);

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [galeraSeleccionada, setGaleraSeleccionada] =
    useState("");

  const galeras = opciones("galeras");
  const alimentosOptions = productosPorTipo(["AL"]);
  const aditivosDisponibles = productosPorTipo(["AD"]);
  const medicamentosDisponibles = productosPorTipo(["MD"]);
  const vacunasDisponibles = productosPorTipo(["VA"]);

  const crearFila = (
    tipo = "Alimento"
  ) => ({
    id: Date.now() + Math.random(),

    tipo,

    alimento: "",
    vacuna: "",
    cantidad: "",

    aditivos:
      tipo === "Alimento"
        ? [{ producto: "", cantidad: "" }]
        : [],

    medicamentos:
      tipo === "Alimento"
        ? [{ producto: "", cantidad: "" }]
        : []
  });

  const crearGrupoGalera = (galera) => ({
    id: Date.now() + Math.random(),
    galera,
    filas: []
  });

  const [grupos, setGrupos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const cargarEdicion = async (row) => { try { const data = await loadInventoryDocument(row.id); const grouped = new Map(); data.rows.forEach((item) => { const galera = item.galeras[0]?.galera || ""; if (!grouped.has(galera)) grouped.set(galera, { id: crypto.randomUUID(), galera, filas: [] }); grouped.get(galera).filas.push({ id: crypto.randomUUID(), tipo: item.tipo === "Vacunas" ? "Vacuna" : "Alimento", alimento: item.tipo === "Vacunas" ? "" : item.item, vacuna: item.tipo === "Vacunas" ? item.item : "", cantidad: item.cantidad, aditivos: item.aditivos.map((x) => ({ producto: x.producto, cantidad: x.cantidad })), medicamentos: item.medicamentos.map((x) => ({ producto: x.producto, cantidad: x.cantidad })) }); }); setEditingId(row.id); setFecha(String(data.document.movement_date).slice(0, 10)); setGrupos([...grouped.values()]); } catch (error) { alert(error.message); } };

  const agregarGrupoGalera = () => {

    if (!galeraSeleccionada) {
      alert("Seleccione una galera");
      return;
    }

    setGrupos(prev => [
      ...prev,
      crearGrupoGalera(galeraSeleccionada)
    ]);

    setGaleraSeleccionada("");
  };

  const agregarFila = (
    grupoId,
    tipo
  ) => {

    setGrupos(prev =>
      prev.map(g =>
        g.id === grupoId
          ? {
              ...g,
              filas: [
                ...g.filas,
                crearFila(tipo)
              ]
            }
          : g
      )
    );
  };

  const eliminarFila = (grupoId, filaId) => {

    setGrupos(prev =>
      prev.map(g =>
        g.id === grupoId
          ? {
              ...g,
              filas: g.filas.filter(
                f => f.id !== filaId
              )
            }
          : g
      )
    );
  };

  const handleChange = (
    grupoId,
    filaId,
    campo,
    valor
  ) => {

    setGrupos(prev =>
      prev.map(g => {

        if (g.id !== grupoId) return g;

        return {
          ...g,
          filas: g.filas.map(f =>
            f.id === filaId
              ? {
                  ...f,
                 [campo]: valor
                }
              : f
          )
        };
      })
    );
  };

  const agregarAditivoFila = (
    grupoId,
    filaId
  ) => {

    setGrupos(prev =>
      prev.map(g => {

        if (g.id !== grupoId) return g;

        return {
          ...g,
          filas: g.filas.map(f =>
            f.id === filaId
              ? {
                  ...f,
                  aditivos: [
                    ...(f.aditivos || []),
                    { producto: "", cantidad: "" }
                  ]
                }
              : f
          )
        };
      })
    );
  };

  const agregarMedicamentoFila = (
    grupoId,
    filaId
  ) => {

    setGrupos(prev =>
      prev.map(g => {

        if (g.id !== grupoId) return g;

        return {
          ...g,
          filas: g.filas.map(f =>
            f.id === filaId
              ? {
                  ...f,
                  medicamentos: [
                    ...(f.medicamentos || []),
                    { producto: "", cantidad: "" }
                  ]
                }
              : f
          )
        };
      })
    );
  };

  const cambiarAditivo = (
    grupoId,
    filaId,
    index,
    campo,
    valor
  ) => {

    setGrupos(prev =>
      prev.map(g => {

        if (g.id !== grupoId) return g;

        return {
          ...g,
          filas: g.filas.map(f => {

            if (f.id !== filaId)
              return f;

            const copia = [
              ...f.aditivos
            ];

            copia[index] = { ...copia[index], [campo]: valor };

            return {
              ...f,
              aditivos: copia
            };
          })
        };
      })
    );
  };

  const cambiarMedicamento = (
    grupoId,
    filaId,
    index,
    campo,
    valor
  ) => {

    setGrupos(prev =>
      prev.map(g => {

        if (g.id !== grupoId) return g;

        return {
          ...g,
          filas: g.filas.map(f => {

            if (f.id !== filaId)
              return f;

            const copia = [
              ...f.medicamentos
            ];

            copia[index] = { ...copia[index], [campo]: valor };

            return {
              ...f,
              medicamentos: copia
            };
          })
        };
      })
    );
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      const rows = grupos.flatMap((grupo) => grupo.filas.filter((fila) => fila.alimento || fila.vacuna).map((fila) => ({ ...fila, item: fila.alimento || fila.vacuna, galeras: [{ galera: grupo.galera, cantidad: fila.cantidad }] })));
      const quantities = rows.flatMap((fila) => [fila.cantidad, ...(fila.aditivos || []).filter((item) => item.producto).map((item) => item.cantidad), ...(fila.medicamentos || []).filter((item) => item.producto).map((item) => item.cantidad)]);
      if (quantities.some((value) => !/^\d+(?:\.\d{1,2})?$/.test(String(value)) || Number(value) <= 0)) throw new Error("Las cantidades deben ser mayores que cero y tener como máximo dos decimales.");
      await saveInventory({ id: editingId, fecha, rows, movementType: "OUTPUT", module: "FOOD", allocate: true });
      alert(editingId ? "Registro actualizado correctamente" : "Registro guardado correctamente"); setGrupos([]); setGaleraSeleccionada(""); setFecha(new Date().toISOString().split("T")[0]); setEditingId(null);
    } catch (error) { alert(error.message); }
  };

  const inputStyle = {
    width: "100%",
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "4px"
  };

  const btnAdd = {
    padding: "10px 15px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  };

  const btnDelete = {
    padding: "6px 10px",
    background: "#d9534f",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  };

  return (<OperationPanel maxWidth={1600}><OperationRecordsModal title="Egresos de alimento" path="/inventario/documentos" annulPath={(row) => `/inventario/documentos/${row.id}/anular`} dateField="movement_date" columns={inventoryColumns} rowFilter={(row) => row.movement_type === "OUTPUT" && row.module_code === "FOOD"} onEdit={cargarEdicion}/>
    <div
      style={{
        width: "100%",
        maxWidth: "1560px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >
      <h2>Salida de Alimento</h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "end",
          marginBottom: "20px"
        }}
      >
        <div style={{ minWidth: "280px" }}>
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

        <div>
          <label>Galera</label>
          <select
            value={galeraSeleccionada}
            onChange={(e) =>
              setGaleraSeleccionada(
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="">
              Seleccione
            </option>

            {galeras.map(g => (
              <option
                key={g.value}
                value={g.value}
              >
                {catalogName(g)}
              </option>
            ))}
          </select>
        </div>

        <div><button
          type="button"
          onClick={agregarGrupoGalera}
          style={btnAdd}
        >
          +
        </button></div>
      </div>

      <form onSubmit={guardar}>
        {grupos.map(grupo => (
          <div
            key={grupo.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "20px"
            }}
          >
            <h3>{catalogName(galeras.find((item) => item.value === grupo.galera) || { value: grupo.galera, label: grupo.galera })}</h3>

            <div
              style={{
                marginBottom: "15px"
              }}
            >
              <button
                type="button"
                onClick={() =>
                  agregarFila(
                    grupo.id,
                    "Alimento"
                  )
                }
                style={btnAdd}
              >
                Alimento
              </button>

              <button
                type="button"
                onClick={() =>
                  agregarFila(
                    grupo.id,
                    "Vacuna"
                  )
                }
                style={{
                  ...btnAdd,
                  marginLeft: "10px"
                }}
              >
                Vacuna
              </button>
            </div>

            <table
              style={{
                width: "100%",
                minWidth: "1180px",
                borderCollapse:
                  "collapse"
              }}
            >
              <colgroup><col style={{ width: "26%" }}/><col style={{ width: "15%" }}/><col style={{ width: "25%" }}/><col style={{ width: "25%" }}/><col style={{ width: "9%" }}/></colgroup>
              <thead>
                <tr
                  style={{
                    background: "#f5f5f5"
                  }}
                >
                  <th>
                    Alimento / Vacuna
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

                {grupo.filas.map(fila => (
                  <tr key={fila.id}>

                    <td>

                      {fila.tipo ===
                      "Vacuna" ? (

                        <select
                          value={
                            fila.vacuna
                          }
                          onChange={(e) =>
                            handleChange(
                              grupo.id,
                              fila.id,
                              "vacuna",
                              e.target.value
                            )
                          }
                          style={{ ...inputStyle, minWidth: "220px" }}
                        >
                          <option value="">
                            Seleccione
                          </option>

                          {vacunasDisponibles.map(v => (
                            <option
                              key={v.value}
                              value={v.value}
                            >
                              {catalogName(v)}
                            </option>
                          ))}
                        </select>

                      ) : (

                        <select
                          value={
                            fila.alimento
                          }
                          onChange={(e) =>
                            handleChange(
                              grupo.id,
                              fila.id,
                              "alimento",
                              e.target.value
                            )
                          }
                          style={{ ...inputStyle, minWidth: "220px" }}
                        >
                          <option value="">
                            Seleccione
                          </option>

                          {alimentosOptions.map(a => (
                            <option
                              key={a.value}
                              value={a.value}
                            >
                              {catalogName(a)}
                            </option>
                          ))}
                        </select>

                      )}

                    </td>

                    <td>
                      <input
                        type="number"
                        {...quantityInput((fila.tipo === "Vacuna" ? vacunasDisponibles : alimentosOptions).find((item) => item.value === (fila.vacuna || fila.alimento))?.unitCode)}
                        value={
                          fila.cantidad
                        }
                        onChange={(e) =>
                          handleChange(
                            grupo.id,
                            fila.id,
                            "cantidad",
                            e.target.value
                          )
                        }
                        style={{ ...inputStyle, minWidth: "150px" }}
                      />
                    </td>

                    <td>
                      {fila.tipo !==
                      "Alimento" ? (
                        "No aplica"
                      ) : (
                        <div>
                          {(fila.aditivos || []).map(
                            (
                              aditivo,
                              index
                            ) => (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  gap: "6px",
                                  marginBottom:
                                    "5px"
                                }}
                              >
                                <select
                                  value={
                                    aditivo.producto
                                  }
                                  onChange={(e) =>
                                    cambiarAditivo(
                                      grupo.id,
                                      fila.id,
                                      index,
                                      "producto",
                                      e.target
                                        .value
                                    )
                                  }
                                  style={{ ...inputStyle, minWidth: "210px" }}
                                >
                                  <option value="">
                                    Seleccione
                                  </option>

                                  {aditivosDisponibles.map(
                                    a => (
                                      <option
                                        key={a.value}
                                        value={a.value}
                                      >
                                        {catalogName(a)}
                                      </option>
                                    )
                                  )}
                                </select>
                                <input
                                  type="number"
                                  {...quantityInput(aditivosDisponibles.find((item) => item.value === aditivo.producto)?.unitCode)}
                                  value={aditivo.cantidad}
                                  onChange={(e) => cambiarAditivo(grupo.id, fila.id, index, "cantidad", e.target.value)}
                                  placeholder="Cantidad"
                                  style={{ ...inputStyle, minWidth: "105px" }}
                                />
                              </div>
                            )
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              agregarAditivoFila(
                                grupo.id,
                                fila.id
                              )
                            }
                          >
                            +
                          </button>

                        </div>
                      )}
                    </td>

                    <td>
                      {fila.tipo !==
                      "Alimento" ? (
                        "No aplica"
                      ) : (
                        <div>
                          {(fila.medicamentos || []).map(
                            (
                              med,
                              index
                            ) => (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  gap: "6px",
                                  marginBottom:
                                    "5px"
                                }}
                              >
                                <select
                                value={med.producto}
                                  onChange={(e) =>
                                    cambiarMedicamento(
                                      grupo.id,
                                    fila.id,
                                    index,
                                    "producto",
                                    e.target
                                      .value
                                    )
                                  }
                                  style={{ ...inputStyle, minWidth: "210px" }}
                                >
                                  <option value="">
                                    Seleccione
                                  </option>

                                  {medicamentosDisponibles.map(
                                    m => (
                                      <option
                                        key={m.value}
                                        value={m.value}
                                      >
                                        {catalogName(m)}
                                      </option>
                                    )
                                  )}
                                </select>
                                <input
                                  type="number"
                                  {...quantityInput(medicamentosDisponibles.find((item) => item.value === med.producto)?.unitCode)}
                                  value={med.cantidad}
                                  onChange={(e) => cambiarMedicamento(grupo.id, fila.id, index, "cantidad", e.target.value)}
                                  placeholder="Cantidad"
                                  style={{ ...inputStyle, minWidth: "105px" }}
                                />
                              </div>
                            )
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              agregarMedicamentoFila(
                                grupo.id,
                                fila.id
                              )
                            }
                          >
                            +
                          </button>

                        </div>
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          eliminarFila(
                            grupo.id,
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
          </div>
        ))}

        <div className="edit-actions"><button
          type="submit"
          style={btnAdd}
        >
          {editingId ? "Guardar cambios" : "Guardar"}
        </button><CancelEditButton editing={editingId} onCancel={() => { setEditingId(null); setGrupos([]); setGaleraSeleccionada(""); setFecha(new Date().toISOString().split("T")[0]); }}/></div>
      </form>
    </div>
  </OperationPanel>);
}

export default EgresoAlimento;
