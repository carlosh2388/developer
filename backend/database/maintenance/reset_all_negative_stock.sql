-- Corrige todas las existencias negativas de todas las empresas.
-- Conserva intactos los movimientos históricos y ajusta opening_stock
-- solamente por la cantidad necesaria para que el saldo actual quede en cero.

BEGIN;

-- Bloquea temporalmente el inventario de todos los productos mientras se calcula
-- y aplica la corrección, usando las mismas llaves que utiliza el backend.
SELECT pg_advisory_xact_lock(
  hashtext(organization_id::text || ':INVENTORY:' || id::text)
)
FROM products
ORDER BY organization_id, id;

CREATE TEMP TABLE negative_inventory_to_fix ON COMMIT DROP AS
SELECT
  p.organization_id,
  p.id AS product_id,
  p.code,
  p.name,
  COALESCE(p.opening_stock, 0) AS previous_opening_stock,
  COALESCE(p.opening_stock, 0) + COALESCE(
    SUM(
      CASE
        WHEN d.movement_type IN ('INPUT', 'ADJUSTMENT_IN') THEN l.quantity
        ELSE -l.quantity
      END
    ) FILTER (WHERE d.status = 'POSTED'),
    0
  ) AS previous_current_stock
FROM products p
LEFT JOIN inventory_document_lines l
  ON l.product_id = p.id
 AND l.organization_id = p.organization_id
LEFT JOIN inventory_documents d
  ON d.id = l.document_id
 AND d.organization_id = l.organization_id
GROUP BY
  p.organization_id,
  p.id,
  p.code,
  p.name,
  p.opening_stock
HAVING
  COALESCE(p.opening_stock, 0) + COALESCE(
    SUM(
      CASE
        WHEN d.movement_type IN ('INPUT', 'ADJUSTMENT_IN') THEN l.quantity
        ELSE -l.quantity
      END
    ) FILTER (WHERE d.status = 'POSTED'),
    0
  ) < 0;

-- Muestra los productos que serán corregidos antes de actualizarlos.
SELECT
  n.organization_id,
  o.name AS empresa,
  n.code,
  n.name AS producto,
  n.previous_opening_stock AS existencia_inicial_anterior,
  n.previous_current_stock AS existencia_actual_anterior,
  -n.previous_current_stock AS ajuste_aplicado
FROM negative_inventory_to_fix n
JOIN organizations o ON o.id = n.organization_id
ORDER BY o.name, n.code;

UPDATE products p
SET
  opening_stock = COALESCE(p.opening_stock, 0) - n.previous_current_stock,
  updated_at = NOW()
FROM negative_inventory_to_fix n
WHERE p.id = n.product_id
  AND p.organization_id = n.organization_id;

-- Comprobación: esta consulta debe devolver cero filas.
WITH current_inventory AS (
  SELECT
    p.organization_id,
    p.id AS product_id,
    p.code,
    p.name,
    COALESCE(p.opening_stock, 0) + COALESCE(
      SUM(
        CASE
          WHEN d.movement_type IN ('INPUT', 'ADJUSTMENT_IN') THEN l.quantity
          ELSE -l.quantity
        END
      ) FILTER (WHERE d.status = 'POSTED'),
      0
    ) AS current_stock
  FROM products p
  LEFT JOIN inventory_document_lines l
    ON l.product_id = p.id
   AND l.organization_id = p.organization_id
  LEFT JOIN inventory_documents d
    ON d.id = l.document_id
   AND d.organization_id = l.organization_id
  GROUP BY p.organization_id, p.id, p.code, p.name, p.opening_stock
)
SELECT *
FROM current_inventory
WHERE current_stock < 0
ORDER BY organization_id, code;

COMMIT;
