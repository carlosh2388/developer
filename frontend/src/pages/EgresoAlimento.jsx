import { useState } from "react";
import { clientId, loadInventoryDocument, quantityInput, saveInventory } from "../services/operations";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";
import OperationRecordsModal, { compareDocumentDesc, inventoryColumns } from "../components/OperationRecordsModal";
import OperationPanel from "../components/OperationPanel";
import CancelEditButton from "../components/CancelEditButton";

const catalogName = (item) => {
  const prefix = `${item.value} - `;
  return item.label?.startsWith(prefix) ? item.label.slice(prefix.length) : item.label;
};

const foodOutputColumns = inventoryColumns
  .filter((column) => column.key !== "supplier_name")
  .flatMap((column) => column.key === "movement_date"
    ? [column, { key: "flock_codes", label: "Lotes", render: (value) => value || "Sin lote" }]
    : [column]);

const foodOutputMetaPrefix = "AVINEXT_FOOD_OUTPUT_META:";

const cleanSupplements = (items = []) => items
  .filter((item) => item.producto || String(item.observacion || "").trim())
  .map((item) => ({ producto: item.producto || "", observacion: item.observacion || "" }));

const encodeFoodOutputMeta = (fila) => {
  const aditivos = cleanSupplements(fila.aditivos);
  const medicamentos = cleanSupplements(fila.medicamentos);
  if (!aditivos.length && !medicamentos.length) return "";
  return `${foodOutputMetaPrefix}${JSON.stringify({ aditivos, medicamentos })}`;
};

const decodeFoodOutputMeta = (value) => {
  const text = String(value || "");
  if (!text.startsWith(foodOutputMetaPrefix)) return null;
  try {
    const data = JSON.parse(text.slice(foodOutputMetaPrefix.length));
    return {
      aditivos: Array.isArray(data.aditivos) ? data.aditivos : [],
      medicamentos: Array.isArray(data.medicamentos) ? data.medicamentos : [],
    };
  } catch {
    return null;
  }
};

function EgresoAlimento() {
  const { productosPorTipo, opciones } = useOperationalCatalogs(["productos", "lotes"]);

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loteSeleccionado, setLoteSeleccionado] =
    useState("");

  const lotes = opciones("lotes");
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
    aditivo: "",
    cantidad: "",

    aditivos:
      tipo === "Alimento"
        ? [{ producto: "", observacion: "" }]
        : [],

    medicamentos:
      tipo === "Alimento"
        ? [{ producto: "", observacion: "" }]
        : []
  });

  const crearGrupoLote = (lote) => ({
    id: Date.now() + Math.random(),
    lote,
    filas: []
  });

  const [grupos, setGrupos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const cargarEdicion = async (row) => { try {
    const data = await loadInventoryDocument(row.id);
    const grouped = new Map();
    data.rows.forEach((item) => {
      const lote = item.lotes[0]?.lote || "";
      if (!lote) throw new Error("Este registro no tiene un lote asociado.");
      if (!grouped.has(lote)) grouped.set(lote, { id: clientId(), lote, filas: [] });
      const grupo = grouped.get(lote);
      const meta = decodeFoodOutputMeta(item.justificacion);
      if (item.tipo === "Medicamentos") {
        let food = grupo.filas.find((fila) => fila.tipo === "Alimento");
        if (!food) {
          food = crearFila("Alimento");
          food.id = clientId();
          grupo.filas.push(food);
        }
        const target = item.tipo === "Aditivos" ? "aditivos" : "medicamentos";
        const firstEmpty = food[target].find((entry) => !entry.producto && !entry.observacion);
        const value = { producto: item.item, observacion: item.justificacion || "" };
        if (firstEmpty) Object.assign(firstEmpty, value);
        else food[target].push(value);
        return;
      }
      grupo.filas.push({
        id: clientId(),
        tipo: item.tipo === "Vacunas" ? "Vacuna" : item.tipo === "Aditivos" ? "Aditivo" : "Alimento",
        alimento: item.tipo === "Vacunas" || item.tipo === "Aditivos" ? "" : item.item,
        vacuna: item.tipo === "Vacunas" ? item.item : "",
        aditivo: item.tipo === "Aditivos" ? item.item : "",
        cantidad: item.cantidad,
        aditivos: meta?.aditivos || (item.aditivos.length ? item.aditivos.map((x) => ({ producto: x.producto, observacion: x.observacion || "" })) : [{ producto: "", observacion: "" }]),
        medicamentos: meta?.medicamentos || (item.medicamentos.length ? item.medicamentos.map((x) => ({ producto: x.producto, observacion: x.observacion || "" })) : [{ producto: "", observacion: "" }]),
      });
    });
    setEditingId(row.id); setFecha(String(data.document.movement_date).slice(0, 10)); setGrupos([...grouped.values()]);
  } catch (error) { alert(error.message); } };

  const agregarGrupoLote = () => {

    if (!loteSeleccionado) {
      alert("Seleccione un lote");
      return;
    }

    if (grupos.some((grupo) => grupo.lote === loteSeleccionado)) {
      alert("El lote seleccionado ya fue agregado");
      return;
    }

    setGrupos(prev => [
      ...prev,
      crearGrupoLote(loteSeleccionado)
    ]);

    setLoteSeleccionado("");
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
                    { producto: "", observacion: "" }
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
                    { producto: "", observacion: "" }
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
      const rows = grupos.flatMap((grupo) => grupo.filas.filter((fila) => fila.alimento || fila.vacuna || fila.aditivo).map((fila) => ({
        ...fila,
        item: fila.alimento || fila.vacuna || fila.aditivo,
        justificacion: fila.tipo === "Alimento" ? encodeFoodOutputMeta(fila) : fila.justificacion,
        lotes: [{ lote: grupo.lote, cantidad: fila.cantidad }]
      })));
      if (!rows.length) throw new Error("Agrega al menos un alimento, vacuna o aditivo para guardar el egreso.");
      if (rows.some((fila) => [...(fila.aditivos || []), ...(fila.medicamentos || [])].some((item) => !item.producto && String(item.observacion || "").trim()))) {
        throw new Error("Selecciona el aditivo o medicamento en las filas que tengan observaciones.");
      }
      const quantities = rows.map((fila) => fila.cantidad);
      if (quantities.some((value) => !/^\d+(?:\.\d{1,2})?$/.test(String(value)) || Number(value) <= 0)) throw new Error("Las cantidades deben ser mayores que cero y tener como máximo dos decimales.");
      await saveInventory({ id: editingId, fecha, rows, movementType: "OUTPUT", module: "FOOD", allocate: true });
      alert(editingId ? "Registro actualizado correctamente" : "Registro guardado correctamente"); setGrupos([]); setLoteSeleccionado(""); setFecha(new Date().toISOString().split("T")[0]); setEditingId(null);
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

  const supplementStack = {
    display: "grid",
    gap: 10,
    minWidth: 0,
    width: "100%"
  };

  const supplementRow = {
    display: "grid",
    gap: 6
  };

  const supplementTop = {
    display: "grid",
    gridTemplateColumns: "minmax(240px, 1fr) 42px",
    gap: 8,
    alignItems: "center"
  };

  const supplementSelect = {
    ...inputStyle,
    minWidth: 0,
    width: "100%",
    height: 38
  };

  const supplementNote = {
    ...inputStyle,
    minWidth: 0,
    width: "100%",
    height: 36
  };

  const supplementAddButton = {
    width: 42,
    height: 38,
    padding: 0,
    border: 0,
    borderRadius: 6,
    background: "#1976d2",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 18
  };

  const tableWrapStyle = {
    overflowX: "auto",
    width: "100%",
    maxWidth: "100%",
    paddingBottom: 10
  };

  const tableStyle = {
    width: "100%",
    minWidth: "1320px",
    borderCollapse: "collapse",
    tableLayout: "fixed"
  };

  const headerCellStyle = {
    padding: "12px 10px",
    textAlign: "left",
    whiteSpace: "nowrap"
  };

  const bodyCellStyle = {
    padding: "12px 10px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top"
  };

  return (<OperationPanel maxWidth="calc(100vw - 240px)"><OperationRecordsModal title="Egresos de alimento" path="/inventario/documentos" annulPath={(row) => `/inventario/documentos/${row.id}/anular`} dateField="movement_date" columns={foodOutputColumns} rowFilter={(row) => row.movement_type === "OUTPUT" && row.module_code === "FOOD"} onEdit={cargarEdicion} sortRows={compareDocumentDesc}/>
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        padding: "20px 8px",
        fontFamily: "Arial",
        boxSizing: "border-box"
      }}
    >
      <h2>Salida de Alimento</h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "end",
          marginBottom: "20px",
          flexWrap: "wrap"
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
          <label>Lote</label>
          <select
            value={loteSeleccionado}
            onChange={(e) =>
              setLoteSeleccionado(
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="">
              Seleccione
            </option>

            {lotes.map(g => (
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
          onClick={agregarGrupoLote}
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
              marginBottom: "20px",
              maxWidth: "100%",
              overflow: "hidden",
              boxSizing: "border-box"
            }}
          >
            <h3>{catalogName(lotes.find((item) => item.value === grupo.lote) || { value: grupo.lote, label: grupo.lote })}</h3>

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

              <button
                type="button"
                onClick={() =>
                  agregarFila(
                    grupo.id,
                    "Aditivo"
                  )
                }
                style={{
                  ...btnAdd,
                  marginLeft: "10px"
                }}
              >
                Aditivo
              </button>
            </div>

            <div style={tableWrapStyle}>
            <table
              style={tableStyle}
            >
              <colgroup><col style={{ width: "27%" }}/><col style={{ width: "13%" }}/><col style={{ width: "27%" }}/><col style={{ width: "27%" }}/><col style={{ width: "6%" }}/></colgroup>
              <thead>
                <tr
                  style={{
                    background: "#f5f5f5"
                  }}
                >
                  <th style={headerCellStyle}>
                    Alimento / Vacuna / Aditivo
                  </th>

                  <th style={headerCellStyle}>
                    Cantidad
                  </th>

                  <th style={headerCellStyle}>
                    Aditivo
                  </th>

                  <th style={headerCellStyle}>
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

                    <td style={bodyCellStyle}>

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
                          style={{ ...inputStyle, minWidth: 0, width: "100%" }}
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

                      ) : fila.tipo === "Aditivo" ? (

                        <select
                          value={
                            fila.aditivo
                          }
                          onChange={(e) =>
                            handleChange(
                              grupo.id,
                              fila.id,
                              "aditivo",
                              e.target.value
                            )
                          }
                          style={{ ...inputStyle, minWidth: 0, width: "100%" }}
                        >
                          <option value="">
                            Seleccione
                          </option>

                          {aditivosDisponibles.map(a => (
                            <option
                              key={a.value}
                              value={a.value}
                            >
                              {catalogName(a)}
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
                          style={{ ...inputStyle, minWidth: 0, width: "100%" }}
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

                    <td style={bodyCellStyle}>
                      <input
                        type="number"
                        {...quantityInput((fila.tipo === "Vacuna" ? vacunasDisponibles : fila.tipo === "Aditivo" ? aditivosDisponibles : alimentosOptions).find((item) => item.value === (fila.vacuna || fila.aditivo || fila.alimento))?.unitCode)}
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
                        style={{ ...inputStyle, minWidth: 0, width: "100%" }}
                      />
                    </td>

                    <td style={bodyCellStyle}>
                      {fila.tipo !==
                      "Alimento" ? (
                        "No aplica"
                      ) : (
                        <div style={supplementStack}>
                          {(fila.aditivos || []).map(
                            (
                              aditivo,
                              index
                            ) => (
                              <div
                                key={index}
                                style={supplementRow}
                              >
                                <div style={supplementTop}>
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
                                    style={supplementSelect}
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
                                  {index === (fila.aditivos || []).length - 1 && <button
                                    type="button"
                                    onClick={() =>
                                      agregarAditivoFila(
                                        grupo.id,
                                        fila.id
                                      )
                                    }
                                    style={supplementAddButton}
                                    title="Agregar aditivo"
                                  >
                                    +
                                  </button>}
                                </div>
                                <input
                                  type="text"
                                  value={aditivo.observacion || ""}
                                  onChange={(e) => cambiarAditivo(grupo.id, fila.id, index, "observacion", e.target.value)}
                                  placeholder="Observaciones"
                                  style={supplementNote}
                                />
                              </div>
                            )
                          )}

                          {!(fila.aditivos || []).length && <button
                            type="button"
                            onClick={() =>
                              agregarAditivoFila(
                                grupo.id,
                                fila.id
                              )
                            }
                            style={supplementAddButton}
                            title="Agregar aditivo"
                          >
                            +
                          </button>}

                        </div>
                      )}
                    </td>

                    <td style={bodyCellStyle}>
                      {fila.tipo !==
                      "Alimento" ? (
                        "No aplica"
                      ) : (
                        <div style={supplementStack}>
                          {(fila.medicamentos || []).map(
                            (
                              med,
                              index
                            ) => (
                              <div
                                key={index}
                                style={supplementRow}
                              >
                                <div style={supplementTop}>
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
                                    style={supplementSelect}
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
                                  {index === (fila.medicamentos || []).length - 1 && <button
                                    type="button"
                                    onClick={() =>
                                      agregarMedicamentoFila(
                                        grupo.id,
                                        fila.id
                                      )
                                    }
                                    style={supplementAddButton}
                                    title="Agregar medicamento"
                                  >
                                    +
                                  </button>}
                                </div>
                                <input
                                  type="text"
                                  value={med.observacion || ""}
                                  onChange={(e) => cambiarMedicamento(grupo.id, fila.id, index, "observacion", e.target.value)}
                                  placeholder="Observaciones"
                                  style={supplementNote}
                                />
                              </div>
                            )
                          )}

                          {!(fila.medicamentos || []).length && <button
                            type="button"
                            onClick={() =>
                              agregarMedicamentoFila(
                                grupo.id,
                                fila.id
                              )
                            }
                            style={supplementAddButton}
                            title="Agregar medicamento"
                          >
                            +
                          </button>}

                        </div>
                      )}
                    </td>

                    <td style={{ ...bodyCellStyle, textAlign: "center" }}>
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
          </div>
        ))}

        <div className="edit-actions"><button
          type="submit"
          style={btnAdd}
        >
          {editingId ? "Guardar cambios" : "Guardar"}
        </button><CancelEditButton editing={editingId} onCancel={() => { setEditingId(null); setGrupos([]); setLoteSeleccionado(""); setFecha(new Date().toISOString().split("T")[0]); }}/></div>
      </form>
    </div>
  </OperationPanel>);
}

export default EgresoAlimento;
