/*
 AVINEXT / PostgreSQL
 Elimina exclusivamente los registros de los formularios:
   Peso en aves, Peso en huevos, Ingreso/Egreso de alimento,
   Otros ingresos/egresos, Ingreso/Egreso de huevos,
   Ajustes de entrada/salida y Egreso de reproductores.

 Alcance: GRANJA AZUL. No afecta a otras empresas.
 No elimina ni modifica catálogos, usuarios, roles, licencias, auditoría,
 saldos iniciales de productos ni cantidades iniciales de lotes.
 No ejecuta reinicios de secuencias de PostgreSQL. Los correlativos calculados
 por la aplicación a partir de los registros existentes podrían comenzar de nuevo.

 Respaldo previo del servidor:
 /home/ubuntu/backups/avinext/before-transaction-cleanup-2026-11-02T15-13-13-327Z.dump

 Ejecutar el archivo COMPLETO en una conexión a la base avinext.
 Para otra empresa, cambiar únicamente el UUID en INSERT INTO cleanup_target.
 Este archivo termina en COMMIT: al ejecutarlo confirma el borrado.
 Para simularlo, cambiar el COMMIT final por ROLLBACK.
*/

BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '5min';

CREATE TEMP TABLE cleanup_target (
  organization_id UUID PRIMARY KEY
) ON COMMIT DROP;

INSERT INTO cleanup_target (organization_id)
VALUES ('123bf01d-8dd6-49e7-95c5-8b790ebea94c'::UUID); -- GRANJA AZUL

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM cleanup_target) <> 1
     OR NOT EXISTS (
       SELECT 1 FROM public.organizations o
       JOIN cleanup_target t ON t.organization_id = o.id
     ) THEN
    RAISE EXCEPTION 'Debe seleccionar exactamente una empresa existente. No se borró ningún registro.';
  END IF;
END $$;

-- Impide nuevos movimientos durante esta transacción y mantiene los conteos estables.
LOCK TABLE
  public.bird_weight_samples, public.bird_weight_controls,
  public.egg_weight_samples, public.egg_weight_controls,
  public.bird_exit_lines, public.bird_exit_documents,
  public.egg_movement_lines, public.egg_movements,
  public.inventory_line_allocations, public.inventory_document_lines,
  public.inventory_documents
IN SHARE ROW EXCLUSIVE MODE;

SELECT o.id AS empresa_id, o.name AS empresa
FROM public.organizations o
JOIN cleanup_target t ON t.organization_id = o.id;

CREATE TEMP TABLE cleanup_result (
  tabla TEXT PRIMARY KEY,
  registros_eliminados BIGINT NOT NULL
) ON COMMIT DROP;

-- Lista cerrada de tablas operativas, ordenada por sus llaves foráneas.
-- Primero detalles y luego encabezados. Los movimientos de huevo se
-- eliminan antes de sus documentos de inventario vinculados.
DO $$
DECLARE
  target_org UUID;
  target_table TEXT;
  affected BIGINT;
BEGIN
  SELECT organization_id INTO STRICT target_org FROM cleanup_target;

  FOREACH target_table IN ARRAY ARRAY[
    'bird_weight_samples',
    'bird_weight_controls',
    'egg_weight_samples',
    'egg_weight_controls',
    'bird_exit_lines',
    'bird_exit_documents',
    'egg_movement_lines',
    'egg_movements',
    'inventory_line_allocations',
    'inventory_document_lines',
    'inventory_documents'
  ] LOOP
    EXECUTE format('DELETE FROM public.%I WHERE organization_id = $1', target_table)
      USING target_org;
    GET DIAGNOSTICS affected = ROW_COUNT;

    INSERT INTO cleanup_result (tabla, registros_eliminados)
    VALUES (target_table, affected);
  END LOOP;
END $$;

-- Resumen del borrado de encabezados y detalles.
SELECT tabla, registros_eliminados
FROM cleanup_result
ORDER BY tabla;

SELECT SUM(registros_eliminados) AS total_registros_eliminados
FROM cleanup_result;

-- Confirmación: todos estos conteos deben quedar en cero para esta empresa.
SELECT 'Peso en aves' AS formulario, COUNT(*) AS restantes
FROM public.bird_weight_controls WHERE organization_id IN (SELECT organization_id FROM cleanup_target)
UNION ALL
SELECT 'Peso en huevos', COUNT(*)
FROM public.egg_weight_controls WHERE organization_id IN (SELECT organization_id FROM cleanup_target)
UNION ALL
SELECT 'Egreso de reproductores', COUNT(*)
FROM public.bird_exit_documents WHERE organization_id IN (SELECT organization_id FROM cleanup_target)
UNION ALL
SELECT 'Ingresos, egresos y ajustes de huevos', COUNT(*)
FROM public.egg_movements WHERE organization_id IN (SELECT organization_id FROM cleanup_target)
UNION ALL
SELECT 'Ingresos, egresos y ajustes de inventario', COUNT(*)
FROM public.inventory_documents WHERE organization_id IN (SELECT organization_id FROM cleanup_target);

COMMIT;
