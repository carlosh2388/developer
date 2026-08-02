const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const HttpError = require("../utils/httpError");
const { validateCertificate } = require("../services/licenseService");
const { USER_SCOPES, normalizeScope } = require("../services/userAccessService");

async function login(req, res, next) {
  const client = await db.connect();
  try {
    const username = String(req.body.username || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const userScope = normalizeScope(req.body.userScope || USER_SCOPES.CLIENT);
    const certificate = req.headers["x-license-certificate"];
    if (!username || !password) throw new HttpError(400, "Ingresa tu usuario y contraseña.", "VALIDATION_ERROR");

    let organizationId = null;
    if (userScope === USER_SCOPES.CLIENT && certificate) {
      const license = await validateCertificate(certificate);
      organizationId = license.organization_id;
    } else if (userScope === USER_SCOPES.CLIENT && process.env.LICENSE_ENFORCEMENT === "true") {
      throw new HttpError(403, "Esta instalación no está activada.", "ACTIVATION_REQUIRED");
    }

    await client.query("BEGIN");
    const { rows } = await client.query(
      `SELECT u.*,r.code AS role,
              COALESCE(array_agg(p.code) FILTER (WHERE p.code IS NOT NULL), '{}') AS permissions
       FROM users u JOIN roles r ON r.id=u.role_id
       LEFT JOIN role_permissions rp ON rp.role_id=r.id
       LEFT JOIN permissions p ON p.id=rp.permission_id
       WHERE u.username=$1 AND u.user_scope=$2
         AND ($3::uuid IS NULL OR u.organization_id=$3)
       GROUP BY u.id,r.code`, [username, userScope, organizationId]
    );
    if (rows.length > 1) throw new HttpError(409, "El usuario existe en más de un cliente; activa esta instalación para identificar la organización.", "ORGANIZATION_CONTEXT_REQUIRED");
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new HttpError(401, "El usuario o la contraseña ingresados no son correctos.", "INVALID_CREDENTIALS");
    }
    if (user.status !== "ACTIVE") throw new HttpError(403, "Tu cuenta se encuentra inactiva. Comunícate con el administrador del sistema.", "USER_INACTIVE");
    if (userScope === USER_SCOPES.PLATFORM && !user.is_platform_admin) {
      throw new HttpError(403, "Esta cuenta no pertenece al control central.", "PLATFORM_ADMIN_REQUIRED");
    }
    await client.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [user.id]);

    const sessionId = userScope === USER_SCOPES.CLIENT ? crypto.randomUUID() : null;
    if (sessionId) {
      await client.query("DELETE FROM active_user_sessions WHERE expires_at<=NOW()");
      const active = await client.query("SELECT 1 FROM active_user_sessions WHERE user_id=$1", [user.id]);
      if (active.rows[0]) throw new HttpError(409, "Su sesión ya se encuentra abierta. Cierre la sesión anterior o solicite al administrador que la libere.", "SESSION_ALREADY_ACTIVE");
    }

    const token = jwt.sign({ sub: user.id, ver: user.token_version, sid: sessionId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "15m" });
    if (sessionId) {
      const decoded = jwt.decode(token);
      await client.query(
        `INSERT INTO active_user_sessions(user_id,token_id,expires_at,ip_address,user_agent)
         VALUES($1,$2,to_timestamp($3),$4,$5)`,
        [user.id, sessionId, decoded.exp, req.ip || null, String(req.headers["user-agent"] || "").slice(0, 500) || null]
      );
    }
    await client.query("UPDATE users SET last_login_at=NOW(),failed_attempts=0 WHERE id=$1", [user.id]);
    await client.query("COMMIT");
    res.json({
      token,
      user: { id: user.id, name: user.full_name, username: user.username, role: user.role, permissions: user.permissions, isPlatformAdmin: user.is_platform_admin, userScope: user.user_scope },
    });
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

async function me(req, res, next) {
  try {
    const certificate = req.headers["x-license-certificate"];
    let licenseValidatedAt = null;
    if (process.env.LICENSE_ENFORCEMENT === "true" && req.user.userScope === USER_SCOPES.CLIENT) {
      const license = await validateCertificate(certificate, req.user.organizationId);
      licenseValidatedAt = license.validatedAt;
    }
    res.json({ user: req.user, licenseValidatedAt });
  } catch (error) { next(error); }
}

async function logout(req, res, next) {
  try {
    if (req.tokenPayload.sid) await db.query("DELETE FROM active_user_sessions WHERE user_id=$1 AND token_id=$2", [req.user.id, req.tokenPayload.sid]);
    await db.query("UPDATE users SET token_version=token_version+1 WHERE id=$1", [req.user.id]);
    res.status(204).end();
  } catch (error) { next(error); }
}

async function changePassword(req, res, next) {
  try {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");
    if (!currentPassword || newPassword.length < 8) throw new HttpError(400, "La nueva contraseña debe tener al menos 8 caracteres.", "WEAK_PASSWORD");
    if (currentPassword === newPassword) throw new HttpError(400, "La nueva contraseña debe ser diferente de la actual.", "SAME_PASSWORD");
    const { rows } = await db.query("SELECT password_hash FROM users WHERE id=$1", [req.user.id]);
    if (!rows[0] || !(await bcrypt.compare(currentPassword, rows[0].password_hash))) throw new HttpError(400, "La contraseña actual no es correcta.", "INVALID_CURRENT_PASSWORD");
    const hash = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE users SET password_hash=$1,token_version=token_version+1,updated_at=NOW() WHERE id=$2", [hash, req.user.id]);
    await db.query("DELETE FROM active_user_sessions WHERE user_id=$1", [req.user.id]);
    res.json({ message: "Contraseña actualizada correctamente. Inicia sesión nuevamente." });
  } catch (error) { next(error); }
}

module.exports = { login, me, logout, changePassword };
