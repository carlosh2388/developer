const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const HttpError = require("../utils/httpError");

const paymentMessage = "Tu licencia de AVINEXT se encuentra pendiente de renovación. Para reactivar el acceso, realiza el pago correspondiente o comunícate con el área administrativa.";

function certificateSecret() {
  return process.env.LICENSE_CERT_SECRET || process.env.JWT_SECRET;
}

async function activateInstallation(installationId, licenseKey) {
  const normalizedId = String(installationId || "").trim();
  const normalizedKey = String(licenseKey || "").trim();
  if (!normalizedId || !normalizedKey) throw new HttpError(400, "Ingresa el identificador y la clave de activación.", "ACTIVATION_DATA_REQUIRED");
  const keyHash = crypto.createHash("sha256").update(normalizedKey).digest("hex");
  const { rows } = await db.query(
    `SELECT l.id,l.organization_id,l.installation_id,l.status,l.expires_at,l.grace_days,o.name AS organization_name,o.status AS organization_status
     FROM licenses l JOIN organizations o ON o.id=l.organization_id
     WHERE l.installation_id=$1 AND l.license_key_hash=$2 LIMIT 1`, [normalizedId, keyHash]
  );
  const license = rows[0];
  assertUsable(license);
  const certificate = jwt.sign(
    { type: "license-certificate", licenseId: license.id, organizationId: license.organization_id, installationId: license.installation_id },
    certificateSecret(), { expiresIn: "10y", issuer: "AVINEXT" }
  );
  await db.query(
    `UPDATE licenses SET last_check_at=NOW(),updated_at=NOW() WHERE id=$1`, [license.id]
  );
  await db.query(
    `INSERT INTO audit_logs(organization_id,action,entity,entity_id,details)
     VALUES($1,'LICENSE_ACTIVATED','licenses',$2,$3)`,
    [license.organization_id, license.id, { installationId: normalizedId }]
  );
  return { certificate, organization: license.organization_name, installationId: license.installation_id, expiresAt: license.expires_at };
}

function assertUsable(license) {
  const validUntil = license && new Date(license.expires_at).getTime() + Number(license.grace_days || 0) * 86400000;
  if (!license || license.organization_status === "INACTIVE" || !["ACTIVE", "EXPIRING"].includes(license.status) || validUntil < Date.now()) {
    throw new HttpError(402, paymentMessage, "LICENSE_PAYMENT_REQUIRED");
  }
}

async function validateCertificate(certificate, expectedOrganizationId) {
  if (!certificate) throw new HttpError(403, "Esta instalación de AVINEXT no está activada.", "ACTIVATION_REQUIRED");
  let payload;
  try {
    payload = jwt.verify(certificate, certificateSecret(), { issuer: "AVINEXT" });
  } catch (_error) {
    throw new HttpError(403, "El certificado de esta instalación no es válido. Activa nuevamente AVINEXT.", "CERTIFICATE_INVALID");
  }
  if (payload.type !== "license-certificate") throw new HttpError(403, "Certificado de instalación no válido.", "CERTIFICATE_INVALID");
  const { rows } = await db.query(
    `SELECT l.id,l.organization_id,l.installation_id,l.status,l.expires_at,l.grace_days,o.status AS organization_status
     FROM licenses l JOIN organizations o ON o.id=l.organization_id WHERE l.id=$1`, [payload.licenseId]
  );
  const license = rows[0];
  if (expectedOrganizationId && license?.organization_id !== expectedOrganizationId) {
    throw new HttpError(403, "La licencia no corresponde a la organización de este usuario.", "LICENSE_ORGANIZATION_MISMATCH");
  }
  assertUsable(license);
  const result = await db.query(
    "UPDATE licenses SET last_check_at=NOW(),updated_at=NOW() WHERE id=$1 RETURNING last_check_at", [license.id]
  );
  return { ...license, validatedAt: result.rows[0].last_check_at };
}

module.exports = { activateInstallation, validateCertificate, paymentMessage };

