const HttpError = require("../utils/httpError");

const USER_SCOPES = Object.freeze({ PLATFORM: "PLATFORM", CLIENT: "CLIENT" });

function normalizeScope(value) {
  const scope = String(value || "CLIENT").trim().toUpperCase();
  if (!Object.values(USER_SCOPES).includes(scope)) {
    throw new HttpError(400, "El tipo de usuario no es válido.", "INVALID_USER_SCOPE");
  }
  return scope;
}

async function getOrganizationQuota(client, organizationId, lock = false) {
  if (!organizationId) throw new HttpError(400, "Selecciona un cliente.", "ORGANIZATION_REQUIRED");
  if (lock) {
    const organization = await client.query("SELECT id FROM organizations WHERE id=$1 FOR UPDATE", [organizationId]);
    if (!organization.rows[0]) throw new HttpError(404, "Cliente no encontrado.", "ORGANIZATION_NOT_FOUND");
  }
  const { rows } = await client.query(
    `SELECT
       COALESCE(MAX(l.max_users) FILTER (
         WHERE l.status IN ('ACTIVE','EXPIRING')
           AND l.expires_at + (l.grace_days || ' days')::interval >= NOW()
       ),0)::int AS max_users,
       COUNT(DISTINCT u.id) FILTER (WHERE u.status='ACTIVE')::int AS active_users
     FROM organizations o
     LEFT JOIN licenses l ON l.organization_id=o.id
     LEFT JOIN users u ON u.organization_id=o.id AND u.user_scope='CLIENT'
     WHERE o.id=$1 GROUP BY o.id`,
    [organizationId]
  );
  if (!rows[0]) throw new HttpError(404, "Cliente no encontrado.", "ORGANIZATION_NOT_FOUND");
  return rows[0];
}

async function assertUserCapacity(client, organizationId, excludeUserId = null) {
  const quota = await getOrganizationQuota(client, organizationId, true);
  if (quota.max_users < 1) {
    throw new HttpError(409, "El cliente necesita una licencia vigente antes de crear usuarios.", "LICENSE_REQUIRED_FOR_USERS");
  }
  let activeUsers = quota.active_users;
  if (excludeUserId) {
    const result = await client.query(
      "SELECT 1 FROM users WHERE id=$1 AND organization_id=$2 AND user_scope='CLIENT' AND status='ACTIVE'",
      [excludeUserId, organizationId]
    );
    if (result.rows[0]) activeUsers -= 1;
  }
  if (activeUsers >= quota.max_users) {
    throw new HttpError(409, `El cliente alcanzó el límite de ${quota.max_users} usuario(s) activos permitido por su licencia.`, "USER_LIMIT_REACHED");
  }
  return quota;
}

module.exports = { USER_SCOPES, normalizeScope, getOrganizationQuota, assertUserCapacity };
