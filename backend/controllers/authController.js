const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const HttpError = require("../utils/httpError");
const { validateCertificate } = require("../services/licenseService");

async function login(req, res, next) {
  try {
    const username = String(req.body.username || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const certificate = req.headers["x-license-certificate"];
    if (!username || !password) throw new HttpError(400, "Ingresa tu usuario y contraseña.", "VALIDATION_ERROR");

    const { rows } = await db.query(
      `SELECT u.*,r.code AS role,
              COALESCE(array_agg(p.code) FILTER (WHERE p.code IS NOT NULL), '{}') AS permissions
       FROM users u JOIN roles r ON r.id=u.role_id
       LEFT JOIN role_permissions rp ON rp.role_id=r.id
       LEFT JOIN permissions p ON p.id=rp.permission_id
       WHERE u.username=$1 GROUP BY u.id,r.code`, [username]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new HttpError(401, "El usuario o la contraseña ingresados no son correctos.", "INVALID_CREDENTIALS");
    }
    if (user.status !== "ACTIVE") {
      throw new HttpError(403, "Tu cuenta se encuentra inactiva. Comunícate con el administrador del sistema.", "USER_INACTIVE");
    }

    // El portal central no envía certificado y sólo acepta administradores de plataforma.
    // La aplicación cliente siempre envía el certificado guardado durante la activación.
    if (process.env.LICENSE_ENFORCEMENT === "true" && (!user.is_platform_admin || certificate)) {
      await validateCertificate(certificate, user.organization_id);
    }

    const token = jwt.sign({ sub: user.id, ver: user.token_version }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "15m" });
    await db.query("UPDATE users SET last_login_at=NOW(),failed_attempts=0 WHERE id=$1", [user.id]);
    res.json({
      token,
      user: { id: user.id, name: user.full_name, username: user.username, role: user.role, permissions: user.permissions, isPlatformAdmin: user.is_platform_admin },
    });
  } catch (error) { next(error); }
}

async function me(req, res, next) {
  try {
    const certificate = req.headers["x-license-certificate"];
    let licenseValidatedAt = null;
    if (process.env.LICENSE_ENFORCEMENT === "true" && (!req.user.isPlatformAdmin || certificate)) {
      const license = await validateCertificate(certificate, req.user.organizationId);
      licenseValidatedAt = license.validatedAt;
    }
    res.json({ user: req.user, licenseValidatedAt });
  } catch (error) { next(error); }
}

async function logout(req, res, next) {
  try {
    await db.query("UPDATE users SET token_version=token_version+1 WHERE id=$1", [req.user.id]);
    res.status(204).end();
  } catch (error) { next(error); }
}

async function changePassword(req, res, next) {
  try {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");
    if (!currentPassword || newPassword.length < 8) {
      throw new HttpError(400, "La nueva contraseña debe tener al menos 8 caracteres.", "WEAK_PASSWORD");
    }
    if (currentPassword === newPassword) {
      throw new HttpError(400, "La nueva contraseña debe ser diferente de la actual.", "SAME_PASSWORD");
    }
    const { rows } = await db.query("SELECT password_hash FROM users WHERE id=$1", [req.user.id]);
    if (!rows[0] || !(await bcrypt.compare(currentPassword, rows[0].password_hash))) {
      throw new HttpError(400, "La contraseña actual no es correcta.", "INVALID_CURRENT_PASSWORD");
    }
    const hash = await bcrypt.hash(newPassword, 12);
    await db.query(
      "UPDATE users SET password_hash=$1,token_version=token_version+1,updated_at=NOW() WHERE id=$2",
      [hash, req.user.id]
    );
    res.json({ message: "Contraseña actualizada correctamente. Inicia sesión nuevamente." });
  } catch (error) { next(error); }
}

module.exports = { login, me, logout, changePassword };
