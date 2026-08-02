/* AVINEXT - Historial cifrado de claves de activación
   Ejecutar una sola vez si la base ya fue creada con 001_initial_schema.sql. */

BEGIN;

CREATE TABLE IF NOT EXISTS license_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id      UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    encrypted_key   TEXT NOT NULL,
    encryption_iv   VARCHAR(40) NOT NULL,
    auth_tag        VARCHAR(40) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    replaced_at     TIMESTAMPTZ,

    CONSTRAINT license_keys_status_check
        CHECK (status IN ('ACTIVE', 'REPLACED', 'REVOKED'))
);

CREATE INDEX IF NOT EXISTS idx_license_keys_license
    ON license_keys (license_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_license_keys_one_active
    ON license_keys (license_id)
    WHERE status = 'ACTIVE';

COMMENT ON TABLE license_keys IS 'Historial cifrado de claves de activación emitidas por licencia.';

COMMIT;

