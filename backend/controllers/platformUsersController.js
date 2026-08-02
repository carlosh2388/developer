const bcrypt = require("bcryptjs");
const db = require("../config/database");
const HttpError = require("../utils/httpError");
const audit = require("../utils/audit");
const { USER_SCOPES, normalizeScope, getOrganizationQuota, assertUserCapacity } = require("../services/userAccessService");

const fields = `u.id,u.organization_id,u.user_scope,u.full_name,u.username,u.status,u.last_login_at,u.created_at,
                EXISTS(SELECT 1 FROM active_user_sessions s WHERE s.user_id=u.id AND s.expires_at>NOW()) AS session_active,
                r.code AS role_code,r.name AS role_name,o.name AS organization_name`;

function validateInput(body, editing = false) {
  const scope = normalizeScope(body.userScope);
  const fullName = String(body.fullName || "").trim();
  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");
  const status = body.status || "ACTIVE";
  if (!fullName || !/^[a-zA-Z0-9._-]{3,60}$/.test(username)) {
    throw new HttpError(400, "Nombre y usuario son obligatorios; el usuario sólo admite letras, números, punto, guion y guion bajo.", "VALIDATION_ERROR");
  }
  if (!editing && password.length < 8) throw new HttpError(400, "La contraseña debe tener al menos 8 caracteres.", "WEAK_PASSWORD");
  if (!['ACTIVE','INACTIVE','LOCKED'].includes(status)) throw new HttpError(400, "Estado no válido.", "INVALID_STATUS");
  if (scope === USER_SCOPES.CLIENT && !body.organizationId) throw new HttpError(400, "Selecciona el cliente del usuario.", "ORGANIZATION_REQUIRED");
  return { scope, fullName, username, password, status };
}

async function listUsers(req, res, next) {
  try {
    const scope = normalizeScope(req.query.scope || USER_SCOPES.CLIENT);
    const organizationId = req.query.organizationId || null;
    if (scope === USER_SCOPES.CLIENT && !organizationId) throw new HttpError(400, "Selecciona un cliente.", "ORGANIZATION_REQUIRED");
    const { rows } = await db.query(
      `SELECT ${fields} FROM users u
       JOIN roles r ON r.id=u.role_id LEFT JOIN organizations o ON o.id=u.organization_id
       WHERE u.user_scope=$1 AND ($2::uuid IS NULL OR u.organization_id=$2)
       ORDER BY u.full_name`, [scope, organizationId]
    );
    const quota = scope === USER_SCOPES.CLIENT ? await getOrganizationQuota(db, organizationId) : null;
    res.json({ users: rows, quota });
  } catch (error) { next(error); }
}

async function listRoles(_req, res, next) {
  try { const { rows } = await db.query("SELECT id,code,name,description FROM roles ORDER BY id"); res.json(rows); }
  catch (error) { next(error); }
}

async function createUser(req, res, next) {
  const client = await db.connect();
  try {
    const input = validateInput(req.body);
    await client.query("BEGIN");
    if (input.scope === USER_SCOPES.CLIENT) await assertUserCapacity(client, req.body.organizationId);
    const roleCode = input.scope === USER_SCOPES.PLATFORM ? "ADMINISTRATOR" : req.body.roleCode;
    const role = await client.query("SELECT id FROM roles WHERE code=$1", [roleCode]);
    if (!role.rows[0]) throw new HttpError(400, "Rol no válido.", "INVALID_ROLE");
    const hash = await bcrypt.hash(input.password, 12);
    const { rows } = await client.query(
      `INSERT INTO users(organization_id,role_id,full_name,username,password_hash,status,is_platform_admin,user_scope,created_by)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [input.scope === USER_SCOPES.CLIENT ? req.body.organizationId : null, role.rows[0].id, input.fullName,
       input.username, hash, input.status, input.scope === USER_SCOPES.PLATFORM, input.scope, req.user.id]
    );
    await client.query("COMMIT");
    await audit(req, "USER_CREATED", "users", rows[0].id, { username: input.username, userScope: input.scope, organizationId: req.body.organizationId || null });
    res.status(201).json({ id: rows[0].id, message: "Usuario creado correctamente." });
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

async function updateUser(req, res, next) {
  const client = await db.connect();
  try {
    const input = validateInput(req.body, true);
    await client.query("BEGIN");
    const current = await client.query("SELECT id,user_scope,organization_id,status FROM users WHERE id=$1 FOR UPDATE", [req.params.id]);
    if (!current.rows[0] || current.rows[0].user_scope !== input.scope) throw new HttpError(404, "Usuario no encontrado.", "USER_NOT_FOUND");
    if (req.params.id === req.user.id && input.status !== "ACTIVE") throw new HttpError(400, "No puedes desactivar tu propia cuenta.", "SELF_DISABLE");
    const organizationId = input.scope === USER_SCOPES.CLIENT ? req.body.organizationId : null;
    if (input.scope === USER_SCOPES.CLIENT && input.status === "ACTIVE" &&
        (current.rows[0].status !== "ACTIVE" || current.rows[0].organization_id !== organizationId)) {
      await assertUserCapacity(client, organizationId, req.params.id);
    }
    const roleCode = input.scope === USER_SCOPES.PLATFORM ? "ADMINISTRATOR" : req.body.roleCode;
    const result = await client.query(
      `UPDATE users SET organization_id=$1,full_name=$2,username=$3,status=$4,
         role_id=(SELECT id FROM roles WHERE code=$5),is_platform_admin=$6,token_version=token_version+1,updated_at=NOW()
       WHERE id=$7 AND user_scope=$8`,
      [organizationId,input.fullName,input.username,input.status,roleCode,input.scope === USER_SCOPES.PLATFORM,req.params.id,input.scope]
    );
    if (!result.rowCount) throw new HttpError(404, "Usuario no encontrado.", "USER_NOT_FOUND");
    await client.query("DELETE FROM active_user_sessions WHERE user_id=$1", [req.params.id]);
    await client.query("COMMIT");
    await audit(req, "USER_UPDATED", "users", req.params.id, { username: input.username, userScope: input.scope, organizationId });
    res.json({ message: "Usuario actualizado correctamente." });
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

async function resetPassword(req, res, next) {
  try {
    const password = String(req.body.password || "");
    if (password.length < 8) throw new HttpError(400, "La contraseña debe tener al menos 8 caracteres.", "WEAK_PASSWORD");
    const hash = await bcrypt.hash(password, 12);
    const result = await db.query(
      `UPDATE users SET password_hash=$1,token_version=token_version+1,updated_at=NOW()
       WHERE id=$2 RETURNING id,user_scope,organization_id`, [hash, req.params.id]
    );
    if (!result.rows[0]) throw new HttpError(404, "Usuario no encontrado.", "USER_NOT_FOUND");
    await db.query("DELETE FROM active_user_sessions WHERE user_id=$1", [req.params.id]);
    await audit(req, "PASSWORD_RESET", "users", req.params.id, { userScope: result.rows[0].user_scope });
    res.json({ message: "Contraseña actualizada y sesiones anteriores cerradas." });
  } catch (error) { next(error); }
}

async function closeSession(req, res, next) {
  try {
    const result = await db.query("DELETE FROM active_user_sessions WHERE user_id=$1 RETURNING user_id", [req.params.id]);
    res.json({ message: result.rowCount ? "Sesión cerrada correctamente." : "El usuario no tenía una sesión activa." });
  } catch (error) { next(error); }
}

module.exports = { listUsers, listRoles, createUser, updateUser, resetPassword, closeSession };
