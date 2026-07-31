const crypto = require("crypto");
const db = require("../config/database");
const HttpError = require("../utils/httpError");
const audit = require("../utils/audit");
const { encryptLicenseKey, decryptLicenseKey } = require("../services/keyVault");

async function listOrganizations(_req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT o.*, COUNT(l.id)::int AS license_count,
              COUNT(l.id) FILTER (WHERE l.status IN ('ACTIVE','EXPIRING'))::int AS active_licenses
       FROM organizations o LEFT JOIN licenses l ON l.organization_id=o.id
       GROUP BY o.id ORDER BY o.name`
    );
    res.json(rows);
  } catch (error) { next(error); }
}

async function createOrganization(req, res, next) {
  try {
    const { name, taxId, contactEmail, contactPhone } = req.body;
    if (!name?.trim()) throw new HttpError(400, "El nombre del cliente es obligatorio.", "VALIDATION_ERROR");
    const { rows } = await db.query(
      `INSERT INTO organizations(name,tax_id,contact_email,contact_phone)
       VALUES($1,$2,$3,$4) RETURNING *`,
      [name.trim(), taxId || null, contactEmail || null, contactPhone || null]
    );
    await audit(req, "ORGANIZATION_CREATED", "organizations", rows[0].id, { name });
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
}

async function updateOrganization(req, res, next) {
  try {
    const { name, taxId, contactEmail, contactPhone, status } = req.body;
    if (!name?.trim() || !["ACTIVE", "INACTIVE"].includes(status)) {
      throw new HttpError(400, "El nombre y el estado del cliente son obligatorios.", "VALIDATION_ERROR");
    }
    const { rows } = await db.query(
      `UPDATE organizations SET name=$1,tax_id=$2,contact_email=$3,contact_phone=$4,status=$5,updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [name.trim(), taxId || null, contactEmail || null, contactPhone || null, status, req.params.id]
    );
    if (!rows[0]) throw new HttpError(404, "Cliente no encontrado.", "ORGANIZATION_NOT_FOUND");
    if (status === "INACTIVE") {
      await db.query(
        `UPDATE licenses SET status='SUSPENDED',updated_at=NOW()
         WHERE organization_id=$1 AND status IN ('ACTIVE','EXPIRING')`, [req.params.id]
      );
    }
    await audit(req, "ORGANIZATION_UPDATED", "organizations", req.params.id, { name, status });
    res.json({ organization: rows[0], message: status === "INACTIVE" ? "Cliente dado de baja y licencias suspendidas." : "Cliente actualizado correctamente." });
  } catch (error) { next(error); }
}

async function listLicenses(_req, res, next) {
  try {
    await db.query(
      `UPDATE licenses SET status='EXPIRED',updated_at=NOW()
       WHERE status IN ('ACTIVE','EXPIRING') AND expires_at + (grace_days || ' days')::interval < NOW()`
    );
    const { rows } = await db.query(
      `SELECT l.id,l.organization_id,o.name AS organization_name,l.installation_id,l.status,l.starts_at,l.expires_at,
              l.grace_days,l.last_check_at,l.notes,l.created_at,l.updated_at
       FROM licenses l JOIN organizations o ON o.id=l.organization_id ORDER BY l.created_at DESC`
    );
    res.json(rows);
  } catch (error) { next(error); }
}

async function createLicense(req, res, next) {
  const client = await db.connect();
  try {
    const { organizationId, installationId, expiresAt, graceDays = 0, notes } = req.body;
    if (!organizationId || !installationId?.trim() || !expiresAt) {
      throw new HttpError(400, "Cliente, instalación y vencimiento son obligatorios.", "VALIDATION_ERROR");
    }
    if (Date.parse(expiresAt) <= Date.now()) throw new HttpError(400, "El vencimiento debe ser una fecha futura.", "INVALID_DATE");
    const rawKey = `AVX-${crypto.randomBytes(24).toString("base64url")}`;
    const hash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const vault = encryptLicenseKey(rawKey);
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO licenses(organization_id,installation_id,license_key_hash,expires_at,grace_days,notes)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING id,status,expires_at`,
      [organizationId, installationId.trim(), hash, expiresAt, graceDays, notes || null]
    );
    await client.query(
      `INSERT INTO license_keys(license_id,encrypted_key,encryption_iv,auth_tag)
       VALUES($1,$2,$3,$4)`, [rows[0].id, vault.encryptedKey, vault.encryptionIv, vault.authTag]
    );
    await client.query("COMMIT");
    await audit(req, "LICENSE_CREATED", "licenses", rows[0].id, { organizationId, installationId });
    res.status(201).json({ ...rows[0], licenseKey: rawKey, message: "Guarda la clave ahora; no volverá a mostrarse." });
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

async function updateLicense(req, res, next) {
  try {
    const { status, expiresAt, graceDays, notes } = req.body;
    const allowed = ["ACTIVE", "EXPIRING", "SUSPENDED", "EXPIRED", "REVOKED"];
    if (!allowed.includes(status)) throw new HttpError(400, "Estado de licencia no válido.", "INVALID_STATUS");
    if (expiresAt && Number.isNaN(Date.parse(expiresAt))) throw new HttpError(400, "La fecha de vencimiento no es válida.", "INVALID_DATE");
    if (graceDays != null && (graceDays < 0 || graceDays > 90)) throw new HttpError(400, "Los días de gracia deben estar entre 0 y 90.", "INVALID_GRACE_DAYS");
    const { rows } = await db.query(
      `UPDATE licenses SET status=$1,expires_at=COALESCE($2,expires_at),grace_days=COALESCE($3,grace_days),
              notes=$4,updated_at=NOW() WHERE id=$5
       RETURNING id,status,expires_at,grace_days,notes`,
      [status, expiresAt || null, graceDays ?? null, notes || null, req.params.id]
    );
    if (!rows[0]) throw new HttpError(404, "Licencia no encontrada.", "LICENSE_NOT_FOUND");
    if (status === "REVOKED") {
      await db.query("UPDATE license_keys SET status='REVOKED',replaced_at=NOW() WHERE license_id=$1 AND status='ACTIVE'", [req.params.id]);
    }
    const action = status === "SUSPENDED" ? "LICENSE_SUSPENDED" : status === "REVOKED" ? "LICENSE_REVOKED" : "LICENSE_UPDATED";
    await audit(req, action, "licenses", req.params.id, { status, expiresAt, graceDays });
    const messages = { SUSPENDED: "Servicio suspendido. El acceso del cliente será bloqueado.", REVOKED: "Licencia dada de baja definitivamente.", ACTIVE: "Licencia reactivada correctamente." };
    res.json({ license: rows[0], message: messages[status] || "Licencia actualizada correctamente." });
  } catch (error) { next(error); }
}

async function regenerateLicenseKey(req, res, next) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query("SELECT status,installation_id FROM licenses WHERE id=$1 FOR UPDATE", [req.params.id]);
    if (!existing.rows[0]) throw new HttpError(404, "Licencia no encontrada.", "LICENSE_NOT_FOUND");
    if (existing.rows[0].status === "REVOKED") throw new HttpError(400, "No se puede generar una clave para una licencia dada de baja.", "LICENSE_REVOKED");
    const rawKey = `AVX-${crypto.randomBytes(24).toString("base64url")}`;
    const hash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const vault = encryptLicenseKey(rawKey);
    await client.query("UPDATE license_keys SET status='REPLACED',replaced_at=NOW() WHERE license_id=$1 AND status='ACTIVE'", [req.params.id]);
    await client.query("UPDATE licenses SET license_key_hash=$1,updated_at=NOW() WHERE id=$2", [hash, req.params.id]);
    await client.query(
      `INSERT INTO license_keys(license_id,encrypted_key,encryption_iv,auth_tag)
       VALUES($1,$2,$3,$4)`, [req.params.id, vault.encryptedKey, vault.encryptionIv, vault.authTag]
    );
    await client.query("COMMIT");
    await audit(req, "LICENSE_KEY_REGENERATED", "licenses", req.params.id, { installationId: existing.rows[0].installation_id });
    res.json({ licenseKey: rawKey, message: "Nueva clave generada. Se mostrará una sola vez." });
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

async function listLicenseKeys(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT k.id,k.encrypted_key,k.encryption_iv,k.auth_tag,k.status,k.created_at,k.replaced_at,
              l.status AS license_status,l.expires_at,l.grace_days
       FROM license_keys k JOIN licenses l ON l.id=k.license_id
       WHERE k.license_id=$1 ORDER BY k.created_at DESC`, [req.params.id]
    );
    const result = rows.map(row => {
      const expired = new Date(row.expires_at).getTime() + Number(row.grace_days || 0) * 86400000 < Date.now();
      const effectiveStatus = row.license_status === "REVOKED" ? "REVOKED" : expired && row.status === "ACTIVE" ? "EXPIRED" : row.status;
      return { id: row.id, licenseKey: decryptLicenseKey(row), status: effectiveStatus, createdAt: row.created_at, replacedAt: row.replaced_at };
    });
    res.json(result);
  } catch (error) { next(error); }
}

async function listAuditLogs(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const action = req.query.action || null;
    const organizationId = req.query.organizationId || null;
    const { rows } = await db.query(
      `SELECT a.id,a.action,a.entity,a.entity_id,a.details,a.ip_address,a.created_at,
              u.full_name AS actor_name,u.username AS actor_username,o.name AS organization_name
       FROM audit_logs a
       LEFT JOIN users u ON u.id=a.actor_user_id
       LEFT JOIN organizations o ON o.id=a.organization_id
       WHERE ($1::text IS NULL OR a.action=$1)
         AND ($2::uuid IS NULL OR a.organization_id=$2)
       ORDER BY a.created_at DESC LIMIT $3`,
      [action, organizationId, limit]
    );
    res.json(rows);
  } catch (error) { next(error); }
}

module.exports = { listOrganizations, createOrganization, updateOrganization, listLicenses, createLicense, updateLicense, regenerateLicenseKey, listLicenseKeys, listAuditLogs };
