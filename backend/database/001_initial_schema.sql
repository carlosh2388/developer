/* ============================================================================
   AVINEXT - BASE DE DATOS INICIAL
   Motor: PostgreSQL 15 o superior

   Este archivo se ejecuta una sola vez sobre una base de datos vacía.
   Incluye:
     1. Empresas o clientes de AVINEXT.
     2. Usuarios, roles y permisos.
     3. Licencias por instalación.
     4. Bitácora de auditoría.
     5. Datos y credenciales iniciales.

   Importante:
     - El acceso se realiza con nombre de usuario, no con correo.
     - Las contraseñas se guardan cifradas mediante bcrypt.
     - Los nombres técnicos están en inglés porque coinciden con la API.
============================================================================ */

BEGIN;

-- Permite generar UUID y cifrar contraseñas con bcrypt.
CREATE EXTENSION IF NOT EXISTS pgcrypto;


/* ============================================================================
   1. EMPRESAS O CLIENTES
   Tabla técnica: organizations
============================================================================ */

CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(160) NOT NULL,
    tax_id          VARCHAR(40),
    contact_email   VARCHAR(180),
    contact_phone   VARCHAR(40),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT organizations_status_check
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

COMMENT ON TABLE organizations IS 'Empresas o clientes que utilizan la plataforma AVINEXT.';
COMMENT ON COLUMN organizations.tax_id IS 'NIT o número de identificación fiscal.';
COMMENT ON COLUMN organizations.contact_email IS 'Correo de contacto; no se utiliza para iniciar sesión.';


/* ============================================================================
   2. ROLES
============================================================================ */

CREATE TABLE roles (
    id              SMALLSERIAL PRIMARY KEY,
    code            VARCHAR(30) NOT NULL UNIQUE,
    name            VARCHAR(60) NOT NULL UNIQUE,
    description     VARCHAR(240) NOT NULL
);

COMMENT ON TABLE roles IS 'Roles disponibles para los usuarios de AVINEXT.';


/* ============================================================================
   3. PERMISOS
============================================================================ */

CREATE TABLE permissions (
    id              SMALLSERIAL PRIMARY KEY,
    code            VARCHAR(80) NOT NULL UNIQUE,
    description     VARCHAR(240) NOT NULL
);

CREATE TABLE role_permissions (
    role_id         SMALLINT NOT NULL,
    permission_id   SMALLINT NOT NULL,

    PRIMARY KEY (role_id, permission_id),

    CONSTRAINT role_permissions_role_fk
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,

    CONSTRAINT role_permissions_permission_fk
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

COMMENT ON TABLE permissions IS 'Acciones que pueden realizarse dentro de la plataforma.';
COMMENT ON TABLE role_permissions IS 'Permisos asignados a cada rol.';


/* ============================================================================
   4. USUARIOS
============================================================================ */

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID,
    role_id             SMALLINT NOT NULL,
    full_name           VARCHAR(140) NOT NULL,
    username            VARCHAR(60) NOT NULL,
    password_hash       TEXT NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    is_platform_admin   BOOLEAN NOT NULL DEFAULT FALSE,
    user_scope          VARCHAR(20) NOT NULL DEFAULT 'CLIENT',
    token_version       INTEGER NOT NULL DEFAULT 0,
    failed_attempts     SMALLINT NOT NULL DEFAULT 0,
    locked_until        TIMESTAMPTZ,
    last_login_at       TIMESTAMPTZ,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT users_organization_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id),

    CONSTRAINT users_role_fk
        FOREIGN KEY (role_id) REFERENCES roles(id),

    CONSTRAINT users_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users(id),

    CONSTRAINT users_username_format_check
        CHECK (username ~ '^[a-z0-9._-]{3,60}$'),

    CONSTRAINT users_status_check
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED')),

    CONSTRAINT users_scope_check
        CHECK (user_scope IN ('PLATFORM', 'CLIENT')),

    CONSTRAINT users_scope_organization_check
        CHECK ((user_scope='PLATFORM' AND organization_id IS NULL) OR
               (user_scope='CLIENT' AND organization_id IS NOT NULL)),

    CONSTRAINT users_failed_attempts_check
        CHECK (failed_attempts >= 0)
);

COMMENT ON TABLE users IS 'Usuarios autorizados para acceder a AVINEXT.';
COMMENT ON COLUMN users.username IS 'Nombre único utilizado para iniciar sesión.';
COMMENT ON COLUMN users.password_hash IS 'Contraseña cifrada; nunca contiene la contraseña en texto visible.';
COMMENT ON COLUMN users.token_version IS 'Número utilizado para invalidar inmediatamente las sesiones anteriores.';
COMMENT ON COLUMN users.is_platform_admin IS 'Autoriza el acceso al portal central de licencias.';


/* ============================================================================
   5. LICENCIAS Y CERTIFICADOS DE INSTALACIÓN
============================================================================ */

CREATE TABLE licenses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL,
    installation_id     VARCHAR(120) NOT NULL UNIQUE,
    license_key_hash    TEXT NOT NULL UNIQUE,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    starts_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at          TIMESTAMPTZ NOT NULL,
    grace_days          SMALLINT NOT NULL DEFAULT 0,
    max_users           INTEGER NOT NULL DEFAULT 1,
    last_check_at       TIMESTAMPTZ,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT licenses_organization_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,

    CONSTRAINT licenses_status_check
        CHECK (status IN ('ACTIVE', 'EXPIRING', 'SUSPENDED', 'EXPIRED', 'REVOKED')),

    CONSTRAINT licenses_grace_days_check
        CHECK (grace_days BETWEEN 0 AND 90),

    CONSTRAINT licenses_max_users_check
        CHECK (max_users BETWEEN 1 AND 10000),

    CONSTRAINT licenses_dates_check
        CHECK (expires_at > starts_at)
);

COMMENT ON TABLE licenses IS 'Licencias emitidas para cada instalación de AVINEXT.';
COMMENT ON COLUMN licenses.installation_id IS 'Identificador único del equipo o servidor autorizado.';
COMMENT ON COLUMN licenses.license_key_hash IS 'Huella SHA-256 de la clave; la clave original nunca se almacena.';
COMMENT ON COLUMN licenses.grace_days IS 'Días adicionales permitidos después del vencimiento.';

-- Historial cifrado de claves emitidas para cada licencia.
CREATE TABLE license_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id      UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    encrypted_key   TEXT NOT NULL,
    encryption_iv   VARCHAR(40) NOT NULL,
    auth_tag        VARCHAR(40) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    replaced_at     TIMESTAMPTZ,
    CONSTRAINT license_keys_status_check CHECK (status IN ('ACTIVE', 'REPLACED', 'REVOKED'))
);

CREATE INDEX idx_license_keys_license ON license_keys (license_id, created_at DESC);
CREATE UNIQUE INDEX idx_license_keys_one_active ON license_keys (license_id) WHERE status = 'ACTIVE';
COMMENT ON TABLE license_keys IS 'Historial cifrado de claves de activación emitidas por licencia.';

CREATE TABLE active_user_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    token_id        UUID NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    ip_address      INET,
    user_agent      VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_active_user_sessions_expiration ON active_user_sessions (expires_at);


/* ============================================================================
   6. BITÁCORA DE AUDITORÍA
============================================================================ */

CREATE TABLE audit_logs (
    id                  BIGSERIAL PRIMARY KEY,
    actor_user_id       UUID,
    organization_id     UUID,
    action              VARCHAR(80) NOT NULL,
    entity              VARCHAR(80) NOT NULL,
    entity_id           VARCHAR(120),
    details             JSONB NOT NULL DEFAULT '{}'::JSONB,
    ip_address          INET,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT audit_logs_user_fk
        FOREIGN KEY (actor_user_id) REFERENCES users(id),

    CONSTRAINT audit_logs_organization_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

COMMENT ON TABLE audit_logs IS 'Historial de acciones administrativas y cambios sensibles.';


/* ============================================================================
   7. ÍNDICES PARA MEJORAR CONSULTAS
============================================================================ */

CREATE INDEX idx_users_organization
    ON users (organization_id);

CREATE UNIQUE INDEX uq_users_platform_username
    ON users (LOWER(username)) WHERE user_scope='PLATFORM';

CREATE UNIQUE INDEX uq_users_client_username
    ON users (organization_id, LOWER(username)) WHERE user_scope='CLIENT';

CREATE INDEX idx_users_role
    ON users (role_id);

CREATE INDEX idx_licenses_organization
    ON licenses (organization_id);

CREATE INDEX idx_licenses_status_expiration
    ON licenses (status, expires_at);

CREATE INDEX idx_audit_logs_created_at
    ON audit_logs (created_at DESC);

CREATE INDEX idx_audit_logs_actor
    ON audit_logs (actor_user_id);


/* ============================================================================
   8. ROLES INICIALES
============================================================================ */

INSERT INTO roles (code, name, description) VALUES
    ('ADMINISTRATOR', 'Administrador',
     'Control completo de usuarios, configuración, operaciones y reportes.'),

    ('SUPERVISOR', 'Supervisor',
     'Supervisión de operaciones, autorizaciones y consulta de reportes.'),

    ('OPERATOR', 'Operador',
     'Registro y consulta de las operaciones asignadas.');


/* ============================================================================
   9. PERMISOS INICIALES
============================================================================ */

INSERT INTO permissions (code, description) VALUES
    ('users.read',         'Consultar usuarios'),
    ('users.create',       'Crear usuarios'),
    ('users.update',       'Modificar usuarios'),
    ('users.disable',      'Activar o dar de baja usuarios'),
    ('operations.read',    'Consultar operaciones'),
    ('operations.create',  'Registrar operaciones'),
    ('operations.approve', 'Autorizar operaciones'),
    ('reports.read',       'Consultar reportes'),
    ('settings.manage',    'Administrar la configuración del sistema');


/* ============================================================================
   10. ASIGNACIÓN DE PERMISOS A LOS ROLES
============================================================================ */

-- El administrador recibe todos los permisos.
INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
CROSS JOIN permissions
WHERE roles.code = 'ADMINISTRATOR';

-- El supervisor consulta, registra, autoriza y revisa reportes.
INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
CROSS JOIN permissions
WHERE roles.code = 'SUPERVISOR'
  AND permissions.code IN (
      'operations.read',
      'operations.create',
      'operations.approve',
      'reports.read'
  );

-- El operador consulta y registra operaciones.
INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
CROSS JOIN permissions
WHERE roles.code = 'OPERATOR'
  AND permissions.code IN (
      'operations.read',
      'operations.create'
  );


/* ============================================================================
   11. EMPRESA Y ADMINISTRADOR INICIALES
============================================================================ */

INSERT INTO organizations (
    id,
    name,
    contact_email,
    status
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'AVINEXT Administración',
    NULL,
    'ACTIVE'
);

INSERT INTO users (
    role_id,
    full_name,
    username,
    password_hash,
    status,
    is_platform_admin,
    user_scope
)
SELECT
    roles.id,
    'Administrador AVINEXT',
    'admin',
    crypt('Cambiar123!', gen_salt('bf', 12)),
    'ACTIVE',
    TRUE,
    'PLATFORM'
FROM roles
WHERE roles.code = 'ADMINISTRATOR';


/* ============================================================================
   CREDENCIALES TEMPORALES

   Usuario:    admin
   Contraseña: Cambiar123!

   Cambia esta contraseña inmediatamente después del primer acceso.
============================================================================ */

COMMIT;
