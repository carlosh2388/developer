BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS user_scope VARCHAR(20) NOT NULL DEFAULT 'CLIENT';

UPDATE users SET user_scope='PLATFORM' WHERE is_platform_admin=TRUE;
UPDATE users SET user_scope='CLIENT' WHERE is_platform_admin=FALSE;
UPDATE users SET organization_id=NULL WHERE user_scope='PLATFORM';

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
DROP INDEX IF EXISTS users_username_key;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_scope_check;
ALTER TABLE users ADD CONSTRAINT users_scope_check
  CHECK (user_scope IN ('PLATFORM','CLIENT'));

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_scope_organization_check;
ALTER TABLE users ADD CONSTRAINT users_scope_organization_check
  CHECK ((user_scope='PLATFORM' AND organization_id IS NULL) OR
         (user_scope='CLIENT' AND organization_id IS NOT NULL));

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_platform_username
  ON users (LOWER(username)) WHERE user_scope='PLATFORM';
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_client_username
  ON users (organization_id, LOWER(username)) WHERE user_scope='CLIENT';
CREATE INDEX IF NOT EXISTS idx_users_scope_organization
  ON users (user_scope, organization_id, status);

ALTER TABLE licenses ADD COLUMN IF NOT EXISTS max_users INTEGER NOT NULL DEFAULT 1;
ALTER TABLE licenses DROP CONSTRAINT IF EXISTS licenses_max_users_check;
ALTER TABLE licenses ADD CONSTRAINT licenses_max_users_check
  CHECK (max_users BETWEEN 1 AND 10000);

CREATE TABLE IF NOT EXISTS active_user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  token_id UUID NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  user_agent VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_active_user_sessions_expiration
  ON active_user_sessions (expires_at);

COMMENT ON COLUMN users.user_scope IS 'PLATFORM para el control central; CLIENT para usuarios aislados por organización.';
COMMENT ON COLUMN licenses.max_users IS 'Cantidad máxima de usuarios cliente activos permitidos para la organización.';
COMMENT ON TABLE active_user_sessions IS 'Sesión exclusiva vigente para cada usuario de la aplicación cliente.';

COMMIT;
