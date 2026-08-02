const jwt = require("jsonwebtoken");
const db = require("../config/database");
const HttpError = require("../utils/httpError");

async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new HttpError(401, "Debes iniciar sesión para continuar.", "TOKEN_REQUIRED");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await db.query(
      `SELECT u.id,u.organization_id,u.full_name,u.username,u.status,u.token_version,
              u.is_platform_admin,u.user_scope,r.code AS role,
              COALESCE(array_agg(p.code) FILTER (WHERE p.code IS NOT NULL), '{}') AS permissions
       FROM users u JOIN roles r ON r.id=u.role_id
       LEFT JOIN role_permissions rp ON rp.role_id=r.id
       LEFT JOIN permissions p ON p.id=rp.permission_id
       WHERE u.id=$1 GROUP BY u.id,r.code`, [payload.sub]
    );
    const user = rows[0];
    if (!user || user.status !== "ACTIVE" || user.token_version !== payload.ver) throw new HttpError(401, "Tu sesión ya no es válida. Inicia sesión nuevamente.", "SESSION_REVOKED");
    if (user.user_scope === "CLIENT") {
      const session = await db.query("SELECT 1 FROM active_user_sessions WHERE user_id=$1 AND token_id=$2 AND expires_at>NOW()", [user.id, payload.sid || null]);
      if (!session.rows[0]) throw new HttpError(401, "Tu sesión ya no está activa. Inicia sesión nuevamente.", "SESSION_REVOKED");
      await db.query("UPDATE active_user_sessions SET last_seen_at=NOW() WHERE user_id=$1 AND token_id=$2", [user.id, payload.sid]);
    }
    req.tokenPayload = payload;
    req.user = { id:user.id,organizationId:user.organization_id,name:user.full_name,username:user.username,role:user.role,
      permissions:user.permissions,isPlatformAdmin:user.is_platform_admin,userScope:user.user_scope };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") return next(new HttpError(401, "Tu sesión ha expirado por seguridad.", "TOKEN_EXPIRED"));
    if (error.name === "JsonWebTokenError") return next(new HttpError(401, "El token de acceso no es válido.", "TOKEN_INVALID"));
    next(error);
  }
}

const requirePermission = (permission) => (req, _res, next) => {
  if (!req.user.permissions.includes(permission)) return next(new HttpError(403, "No tienes permisos para realizar esta acción.", "FORBIDDEN"));
  next();
};
const requirePlatformAdmin = (req, _res, next) => {
  if (!req.user.isPlatformAdmin || req.user.userScope !== "PLATFORM") return next(new HttpError(403, "Esta función es exclusiva del administrador de la plataforma.", "PLATFORM_ADMIN_REQUIRED"));
  next();
};

module.exports = { authenticate, requirePermission, requirePlatformAdmin };
