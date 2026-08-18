import { useState } from "react";
import { saveInventory } from "../services/operations";
import { api } from "../services/api";
import { useOperationalCatalogs } from "../hooks/useOperationalCatalogs";
import OperationRecordsModal, { inventoryColumns } from "../components/OperationRecordsModal";
import OperationPanel from "../components/OperationPanel";
import CancelEditButton from "../components/CancelEditButton";

const foodInventoryColumns = inventoryColumns.flatMap((column) => {
  if (column.key === "total_quantity") return [];
  if (column.key === "line_count") return [
    { ...column, label: "Líneas" },
    { key: "total_amount", label: "Costo total (Q)", render: (value) =>
      `Q ${Number(value || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  ];
  return [column];
});

const productName = (item) => {
  const prefix = `${item.value} - `;
  return item.label?.startsWith(prefix) ? item.label.slice(prefix.length) : item.label;
};

function IngresoAlimento() {
  const { productosPorTipo, opciones } = useOperationalCatalogs(["productos", "proveedores"]);

  const [proveedor, setProveedor] =
  useState("");
  
  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [editingId, setEditingId] = useState(null);

  const alimentosOptions = productosPorTipo(["AL"]);
  const materialesDisponibles = productosPorTipo(["ME"]);
  const aditivosDisponibles = productosPorTipo(["AD"]);
  const medicamentosDisponibles = productosPorTipo(["MD"]);
  const proveedores = opciones("proveedores");
  const cargarEdicion = async (row) => {
    try {
      const document = await api(`/inventario/documentos/${row.id}`);
      const children = new Map();
      document.detalles.forEach((detail) => { if (detail.parent_line_id) children.set(detail.parent_line_id, [...(children.get(detail.parent_line_id) || []), detail]); });
      const rows = document.detalles.filter((detail) => !detail.parent_line_id).map((detail) => {
        const tipo = detail.line_role === "MATERIAL" ? "Material" : detail.line_role === "ADDITIVE" ? "Aditivo" : "Alimento";
        const related = children.get(detail.id) || [];
        return { ...crearFila(tipo), alimento: tipo === "Alimento" ? detail.product_code : "", material: tipo === "Material" ? detail.product_code : "",
          aditivo: tipo === "Aditivo" ? detail.product_code : "", cantidad: String(Math.round(Number(detail.quantity || 0))), precio: Number(detail.unit_cost || 0).toFixed(2), modoPrecio: "UNITARIO",
          aditivos: related.filter((item) => item.line_role === "ADDITIVE").map((item) => ({ producto: item.product_code, cantidad: String(Math.round(Number(item.quantity || 0))) })),
          medicamentos: related.filter((item) => item.line_role === "MEDICINE").map((item) => ({ producto: item.product_code, cantidad: String(Math.round(Number(item.quantity || 0))) })) };
      });
      setEditingId(document.id); setFecha(String(document.movement_date).slice(0, 10)); setProveedor(document.supplier_code || ""); setFilas(rows);
    } catch (error) { alert(error.message); }
  };
  const records = <OperationRecordsModal title="Ingresos de alimento" path="/inventario/documentos" annulPath={(row) => `/inventario/documentos/${row.id}/anular`} dateField="movement_date" columns={foodInventoryColumns} rowFilter={(row) => row.movement_type === "INPUT" && row.module_code === "FOOD"} onEdit={cargarEdicion}/>;

const crearFila = (
  tipo = "Alimento"
) => ({
  id: Date.now() + Math.random(),

  tipo,

  alimento: "",
  material: "",
  cantidad: "",
  precio: "",
  modoPrecio: "TOTAL",

  aditivo: "",
  medicamento: "",

  aditivos:
    tipo === "Alimento"
      ? [{ producto: "", cantidad: "" }]
      : [],

  medicamentos:
    tipo === "Alimento"
      ? [{ producto: "", cantidad: "" }]
      : []
});


  const [filas, setFilas] = useState([]);

  const agregarFila = (tipo) => {
    setFilas((prev) => [
      ...prev,
      crearFila(tipo)
    ]);
  };

  const eliminarFila = (id) => {
    setFilas((prev) =>
      prev.filter(
        (f) => f.id !== id
      )
    );
  };

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
           [campo]: value
          }
        : f
    )
  );
};

const cambiarModoPrecio = (id) => {
  setFilas((prev) => prev.map((fila) => fila.id === id
    ? { ...fila, modoPrecio: fila.modoPrecio === "TOTAL" ? "UNITARIO" : "TOTAL" }
    : fila));
};

const calcularCostoUnitario = (fila) => {
  const cantidad = Number(fila.cantidad || 0);
  const precio = Number(fila.precio || 0);
  if (cantidad <= 0 || precio < 0) return "0.00";
  return (cantidad * precio).toFixed(2);
};

const agregarAditivoFila = (
  id
) => {
  setFilas((prev) =>
    prev.map((f) =>
      f.id === id
        ? {
            ...f,
            aditivos: [
              ...(f.aditivos || []),
              { producto: "", cantidad: "" }
            ]
          }
        : f
    )
  );
};

const agregarMedicamentoFila = (
  id
) => {
  setFilas((prev) =>
    prev.map((f) =>
      f.id === id
        ? {
            ...f,
            medicamentos: [
              ...(f.medicamentos || []),
              { producto: "", cantidad: "" }
            ]
          }
        : f
    )
  );
};

  const cambiarAditivo = (id, index, campo, value) => {
    setFilas((prev) =>
      prev.map((f) => {
        if (f.id !== id) {
          return f;
        }

        const copia = [
          ...f.aditivos
        ];

        copia[index] = { ...copia[index], [campo]: value };

        return {
          ...f,
          aditivos: copia
        };
      })
    );
  };

  const cambiarMedicamento = (id, index, campo, value) => {
    setFilas((prev) =>
      prev.map((f) => {
        if (f.id !== id) {
          return f;
        }

        const copia = [
          ...f.medicamentos
        ];

        copia[index] = { ...copia[index], [campo]: value };

        return {
          ...f,
          medicamentos: copia
        };
      })
    );
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (!proveedor) throw new Error("Selecciona el proveedor.");
      if (!filas.length) throw new Error("Agrega al menos un producto.");
      if (filas.some((fila) => !(fila.item || fila.alimento || fila.material || fila.aditivo || fila.medicamento) || Number(fila.cantidad) <= 0)) throw new Error("Selecciona el producto e ingresa una cantidad mayor que cero en cada fila.");
      if (filas.some((fila) => fila.precio === "" || Number(fila.precio) < 0)) throw new Error("Ingresa un precio válido en cada fila.");
      const componentes = filas.flatMap((fila) => [...(fila.aditivos || []), ...(fila.medicamentos || [])]).filter((item) => item.producto);
      if (componentes.some((item) => Number(item.cantidad) <= 0)) throw new Error("Ingresa la cantidad de cada aditivo o medicamento seleccionado.");
      const filasConCostoUnitario = filas.map((fila) => ({ ...fila, modoPrecio: "UNITARIO" }));
      await saveInventory({ id: editingId, fecha, proveedor, rows: filasConCostoUnitario, movementType: "INPUT", module: "FOOD" });
      alert(editingId ? "Ingreso actualizado correctamente" : "Ingreso registrado correctamente"); setFilas([]); setProveedor(""); setFecha(new Date().toISOString().split("T")[0]); setEditingId(null);
    } catch (error) { alert(error.message); }
  };

  const inputStyle = {
    width: "100%",
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "4px"
  };

  const btnDelete = {
    padding: "6px 10px",
    background: "#d9534f",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  };

  const btnAdd = {
    padding: "10px 15px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  };

  return (<OperationPanel maxWidth={1700}>{records}
        <div
      style={{
        maxWidth: "1650px",
        margin: "0 auto",
        padding: "12px 6px",
        fontFamily: "Arial"
      }}
    >
      <h2>
        Ingreso de Alimentos
      </h2>

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
        setFecha(e.target.value)
      }
      style={inputStyle}
    />
  </div>

  <div style={{ flex: 1 }}>
    <label>Proveedor</label>

    <select
      required
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
      {proveedores.map((item) => <option key={item.value} value={item.value}>{productName(item)}</option>)}
    </select>
  </div>
</div>

      <div
        style={{
          marginBottom: "15px"
        }}
      >
        <button
          type="button"
          onClick={() =>
            agregarFila(
              "Alimento"
            )
          }
          style={btnAdd}
        >
          Agregar Alimento
        </button>

        <button
          type="button"
          onClick={() =>
            agregarFila(
              "Aditivo"
            )
          }
          style={{
            ...btnAdd,
            marginLeft: "10px"
          }}
        >
          Agregar Aditivo
        </button>

        <button
          type="button"
          onClick={() =>
            agregarFila(
              "Material"
            )
          }
          style={{
            ...btnAdd,
            marginLeft: "10px"
          }}
        >
          Material de Empaque
        </button>
      </div>

      <form
        onSubmit={guardar}
      >
        <div style={{ overflowX: "auto", paddingBottom: 8 }}>
        <table
          style={{
            width: "100%",
            minWidth: "1080px",
            borderCollapse:
              "collapse"
          }}
        >
          <colgroup>
            <col style={{ width: 190 }} /><col style={{ width: 105 }} /><col style={{ width: 95 }} />
            <col style={{ width: 85 }} /><col style={{ width: 110 }} /><col style={{ width: 235 }} />
            <col style={{ width: 235 }} /><col style={{ width: 65 }} />
          </colgroup>
          <thead>
            <tr
              style={{
                background:
                  "#f5f5f5"
              }}
            >
              <th>
                Alimento / Otros Productos
              </th>

              <th>
                Cantidad
              </th>

              <th>Precio Unitario (Q)</th>
              <th>Modo</th>
              <th>Total (Q)</th>

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

            {filas.map(
              (fila) => (
                <tr
                  key={fila.id}
                >

                  <td>

                    {fila.tipo ===
                    "Material" ? (

                      <select
                        value={
                          fila.material
                        }
                        onChange={(
                          e
                        ) =>
                          handleChange(
                            fila.id,
                            "material",
                            e.target
                              .value
                          )
                        }
                        style={{ ...inputStyle, minWidth: "170px" }}
                      >
                        <option value="">
                          Seleccione
                        </option>

                        {materialesDisponibles.map(
                          (m) => (
                            <option
                              key={m.value}
                              value={m.value}
                            >
                              {productName(m)}
                            </option>
                          )
                        )}
                      </select>

                    ) : fila.tipo ===
                      "Aditivo" ? (

                      <select
                        value={
                          fila.aditivo
                        }
                        onChange={(
                          e
                        ) =>
                          handleChange(
                            fila.id,
                            "aditivo",
                            e.target
                              .value
                          )
                        }
                        style={{ ...inputStyle, minWidth: "170px" }}
                      >
                        <option value="">
                          Seleccione
                        </option>

                        {aditivosDisponibles.map((item) => <option key={item.value} value={item.value}>{productName(item)}</option>)}

                      </select>

                    ) : (

                      <select
                        value={
                          fila.alimento
                        }
                        onChange={(
                          e
                        ) =>
                          handleChange(
                            fila.id,
                            "alimento",
                            e.target
                              .value
                          )
                        }
                        style={{ ...inputStyle, minWidth: "170px" }}
                      >
                        <option value="">
                          Seleccione
                        </option>

                        {alimentosOptions.map(
                          (a) => (
                            <option
                              key={a.value}
                              value={a.value}
                            >
                              {productName(a)}
                            </option>
                          )
                        )}
                      </select>

                    )}

                  </td>

                  <td>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={
                        fila.cantidad
                      }
                      onChange={(
                        e
                      ) =>
                        handleChange(
                          fila.id,
                          "cantidad",
                          e.target
                            .value
                        )
                      }
                      style={
                        inputStyle
                      }
                    />
                  </td>

                  <td>
                    <input type="number" min="0" step="0.01" value={fila.precio} onChange={(e) => handleChange(fila.id, "precio", e.target.value)} placeholder="0.00" style={inputStyle}/>
                  </td>

                  <td>
                    <button type="button" onClick={() => cambiarModoPrecio(fila.id)} style={{ padding: "6px", border: 0, borderRadius: 4, cursor: "pointer", background: fila.modoPrecio === "TOTAL" ? "#28a745" : "#6c757d", color: "#fff" }}>
                      {fila.modoPrecio}
                    </button>
                  </td>

                  <td>
                    <input readOnly value={calcularCostoUnitario(fila)} style={{ ...inputStyle, background: "#f5f5f5" }}/>
                  </td>
                                        <td>

                    {fila.tipo !==
                    "Alimento" ? (

                      <span>
                        No aplica
                      </span>

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
                                display:
                                  "flex",
                                gap:
                                  "5px",
                                marginBottom:
                                  "5px"
                              }}
                            >

                              <select
                                value={
                                  aditivo.producto
                                }
                                onChange={(
                                  e
                                ) =>
                                  cambiarAditivo(
                                    fila.id,
                                    index,
                                    "producto",
                                    e.target
                                      .value
                                  )
                                }
                                style={{ ...inputStyle, minWidth: "135px" }}
                              >
                                <option value="">
                                  Seleccione
                                </option>

                                {aditivosDisponibles.map(
                                  (a) => (
                                    <option
                                      key={a.value}
                                      value={a.value}
                                    >
                                      {productName(a)}
                                    </option>
                                  )
                                )}
                              </select>
                              <input type="number" min="1" step="1" value={aditivo.cantidad} onChange={(e) => cambiarAditivo(fila.id, index, "cantidad", e.target.value)} placeholder="Cantidad" style={{ ...inputStyle, minWidth: "82px" }}/>

                            </div>

                          )
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            agregarAditivoFila(
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

                      <span>
                        No aplica
                      </span>

                    ) : (

                      <div>

                        {(fila.medicamentos || []).map(
                          (
                            medicamento,
                            index
                          ) => (

                            <div
                              key={index}
                              style={{
                                display:
                                  "flex",
                                gap:
                                  "5px",
                                marginBottom:
                                  "5px"
                              }}
                            >

                              <select
                                value={
                                  medicamento.producto
                                }
                                onChange={(
                                  e
                                ) =>
                                  cambiarMedicamento(
                                    fila.id,
                                    index,
                                    "producto",
                                    e.target
                                      .value
                                  )
                                }
                                style={{ ...inputStyle, minWidth: "135px" }}
                              >
                                <option value="">
                                  Seleccione
                                </option>

                                {medicamentosDisponibles.map(
                                  (m) => (
                                    <option
                                      key={m.value}
                                      value={m.value}
                                    >
                                      {productName(m)}
                                    </option>
                                  )
                                )}
                              </select>
                              <input type="number" min="1" step="1" value={medicamento.cantidad} onChange={(e) => cambiarMedicamento(fila.id, index, "cantidad", e.target.value)} placeholder="Cantidad" style={{ ...inputStyle, minWidth: "82px" }}/>

                            </div>

                          )
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            agregarMedicamentoFila(
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
                          fila.id
                        )
                      }
                      style={
                        btnDelete
                      }
                    >
                      X
                    </button>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>
        </div>

        <div className={`edit-actions${editingId ? " edit-actions-active" : ""}`}>
          <button
            type="submit"
            style={{
              padding:
                "10px 20px",
              background:
                "#1976d2",
              color:
                "#fff",
              border:
                "none",
              borderRadius:
                "5px",
              cursor: "pointer",
              flex: editingId ? "0 1 260px" : "1 1 auto"
            }}
          >
            {editingId ? "Guardar cambios" : "Guardar"}
          </button>
          <CancelEditButton editing={editingId} onCancel={() => {
            setEditingId(null); setFilas([]); setProveedor(""); setFecha(new Date().toISOString().split("T")[0]);
          }}/>
        </div>

      </form>

    </div>
  </OperationPanel>);
}

export default IngresoAlimento;
