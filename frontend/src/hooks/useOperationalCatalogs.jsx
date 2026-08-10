import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const endpoints = {
  proveedores: "/proveedores", productos: "/productos", galeras: "/galeras", lotes: "/lotes",
  personal: "/personal", bodegas: "/bodegas", vehiculos: "/vehiculos", etapas: "/etapas-produccion",
  lineas: "/lineas-avicolas", localidades: "/localidades", clientes: "/clientes",
};

export function useOperationalCatalogs(names = Object.keys(endpoints)) {
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let active = true;
    names.forEach((name) => {
      api(endpoints[name])
        .then((rows) => { if (active) setData((current) => ({ ...current, [name]: Array.isArray(rows) ? rows : [] })); })
        .catch((error) => { if (active) setErrors((current) => ({ ...current, [name]: error.message })); });
    });
    return () => { active = false; };
  }, [names.join("|")]);

  return useMemo(() => ({
    ...Object.fromEntries(names.map((name) => [name, data[name] || []])), errors,
    productosPorTipo: (types) => (data.productos || [])
      .filter((item) => item.status !== "INACTIVE" && types.includes(item.productType))
      .map((item) => ({ value: item.code, label: `${item.code} - ${item.name}` })),
    opciones: (name, value = "code", label = "name") => (data[name] || [])
      .filter((item) => item.status !== "INACTIVE")
      .map((item) => ({
        value: item[value] ?? item.id,
        label: item[label] ?? item.name ?? item.nombre ?? item.code ?? item.codigo ?? item.id,
      })),
  }), [data, errors, names.join("|")]);
}

export function useReferenceValues(catalogs) {
  const [values, setValues] = useState({});
  useEffect(() => {
    let active = true;
    catalogs.forEach((catalog) => api(`/catalogos/valores?catalogo=${encodeURIComponent(catalog)}`)
      .then((rows) => { if (active) setValues((current) => ({ ...current, [catalog]: rows })); })
      .catch(() => { if (active) setValues((current) => ({ ...current, [catalog]: [] })); }));
    return () => { active = false; };
  }, [catalogs.join("|")]);
  return values;
}
