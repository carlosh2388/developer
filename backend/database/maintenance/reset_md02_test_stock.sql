-- PostgreSQL. Primero consulte la empresa y sustituya el UUID abajo.
SELECT p.organization_id, o.name AS empresa, p.code, p.name
FROM products p JOIN organizations o ON o.id=p.organization_id
WHERE p.code='MD02';

-- Correcci?n del saldo inicial de pruebas; conserva los movimientos existentes.
BEGIN;
DO $$
DECLARE
  target_org uuid := 'REEMPLAZAR_UUID_EMPRESA';
  target_product uuid;
  current_stock numeric;
BEGIN
  SELECT id INTO STRICT target_product FROM products
  WHERE organization_id=target_org AND code='MD02' AND product_type='MD';
  PERFORM pg_advisory_xact_lock(hashtext(target_org::text || ':INVENTORY:' || target_product::text));
  PERFORM 1 FROM products WHERE id=target_product FOR UPDATE;
  SELECT p.opening_stock + COALESCE(SUM(
    CASE WHEN d.movement_type IN ('INPUT','ADJUSTMENT_IN') THEN l.quantity ELSE -l.quantity END
  ) FILTER (WHERE d.status='POSTED'),0)
  INTO current_stock
  FROM products p
  LEFT JOIN inventory_document_lines l ON l.product_id=p.id AND l.organization_id=p.organization_id
  LEFT JOIN inventory_documents d ON d.id=l.document_id AND d.organization_id=l.organization_id
  WHERE p.id=target_product AND p.organization_id=target_org GROUP BY p.id;
  IF current_stock <> -23 THEN
    RAISE EXCEPTION 'No se modific? MD02: se esperaba -23 y el saldo actual es %', current_stock;
  END IF;
  UPDATE products SET opening_stock=opening_stock-current_stock, updated_at=NOW()
  WHERE id=target_product AND organization_id=target_org;
  RAISE NOTICE 'MD02 corregido: saldo anterior %, saldo nuevo 0', current_stock;
END $$;
COMMIT;
