const db = require("../config/database");

async function audit(req, action, entity, entityId, details = {}) {
  await db.query(
    `INSERT INTO audit_logs (actor_user_id, organization_id, action, entity, entity_id, details, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [req.user?.id || null, req.user?.organizationId || null, action, entity, entityId, details, req.ip]
  );
}

module.exports = audit;

