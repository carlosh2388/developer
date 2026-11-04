BEGIN;

INSERT INTO roles(code,name,description) VALUES
 ('FARM_MANAGER','Encargado Granja','Acceso operativo, datos maestros y reportes. Sin ajustes de entrada/salida ni administración de usuarios.'),
 ('HATCHERY_MANAGER','Encargado Incubadora','Acceso operativo, datos maestros y reportes. Sin ajustes de entrada/salida ni administración de usuarios.'),
 ('PRODUCTION_MANAGER','Gerente Producción','Acceso operativo, datos maestros y reportes, incluyendo ajustes de entrada y salida. Sin administración de usuarios.'),
 ('READ_ONLY','Consultas','Solo lectura de registros y reportes. Hasta dos sesiones simultáneas por cuenta, igual que los demás perfiles.')
ON CONFLICT(code) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description;

INSERT INTO permissions(code,description) VALUES
 ('adjustments.manage','Registrar, modificar y anular ajustes de entrada y salida')
ON CONFLICT(code) DO NOTHING;

INSERT INTO role_permissions(role_id,permission_id)
 SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
 WHERE (r.code='ADMINISTRATOR' AND p.code='adjustments.manage')
 OR (r.code IN ('FARM_MANAGER','HATCHERY_MANAGER','PRODUCTION_MANAGER')
     AND p.code IN ('operations.read','operations.create','operations.approve','reports.read','settings.manage'))
 OR (r.code='PRODUCTION_MANAGER' AND p.code='adjustments.manage')
 OR (r.code='READ_ONLY' AND p.code IN ('operations.read','reports.read'))
ON CONFLICT DO NOTHING;

ALTER TABLE active_user_sessions DROP CONSTRAINT IF EXISTS active_user_sessions_user_id_key;
CREATE INDEX IF NOT EXISTS idx_active_user_sessions_user ON active_user_sessions(user_id);
COMMENT ON TABLE active_user_sessions IS 'Sesiones independientes: máximo dos simultáneas por cuenta cliente, sin excepción por rol.';

-- Preserve the original movement kind; egg adjustments historically used INPUT/OUTPUT.
ALTER TABLE egg_movements ADD COLUMN IF NOT EXISTS is_adjustment BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE egg_movements m SET is_adjustment=TRUE
 WHERE NOT m.is_adjustment AND (
   m.movement_type IN ('ADJUSTMENT_IN','ADJUSTMENT_OUT')
   OR EXISTS(SELECT 1 FROM inventory_documents d WHERE d.id=m.inventory_document_id
             AND d.movement_type IN ('ADJUSTMENT_IN','ADJUSTMENT_OUT'))
   OR (m.movement_type='INPUT' AND m.destination_warehouse_id IS NOT NULL
       AND NOT EXISTS(SELECT 1 FROM egg_movement_lines l WHERE l.movement_id=m.id
                      AND (l.collector_id IS NOT NULL OR l.classifier_id IS NOT NULL)))
   OR (m.movement_type='OUTPUT' AND m.source_warehouse_id IS NOT NULL AND m.shipment_number IS NULL
       AND m.destination_type IS NULL AND m.destination_name IS NULL AND m.customer_id IS NULL
       AND m.vehicle_id IS NULL AND m.driver_id IS NULL)
 );

COMMIT;
