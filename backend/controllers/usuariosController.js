const bcrypt = require("bcryptjs");
const db = require("../config/database");
const HttpError = require("../utils/httpError");
const audit = require("../utils/audit");
const { getOrganizationQuota, assertUserCapacity } = require("../services/userAccessService");

const publicFields = `u.id,u.full_name,u.username,u.status,u.last_login_at,u.created_at,u.personnel_id,p.code AS personnel_code,p.full_name AS personnel_name,
                      EXISTS(SELECT 1 FROM active_user_sessions s WHERE s.user_id=u.id AND s.expires_at>NOW()) AS session_active,
                      r.code AS role_code,r.name AS role_name`;

async function obtenerUsuarios(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT ${publicFields} FROM users u JOIN roles r ON r.id=u.role_id LEFT JOIN personnel p ON p.id=u.personnel_id AND p.organization_id=u.organization_id
       WHERE u.organization_id=$1 AND u.user_scope='CLIENT' ORDER BY u.full_name`, [req.user.organizationId]
    );
    res.json(rows);
  } catch (error) { next(error); }
}

async function obtenerCuota(req, res, next) {
  try { res.json(await getOrganizationQuota(db, req.user.organizationId)); }
  catch (error) { next(error); }
}

async function obtenerRoles(_req, res, next) {
  try { const { rows } = await db.query("SELECT id,code,name,description FROM roles ORDER BY id"); res.json(rows); }
  catch (error) { next(error); }
}

async function crearUsuario(req, res, next) {
  const client = await db.connect();
  try {
    let { fullName } = req.body; const { username, password, roleCode, personnelId } = req.body;
    if (!fullName || !username || !password || !roleCode) throw new HttpError(400, "Completa todos los campos obligatorios.", "VALIDATION_ERROR");
    if (!/^[a-zA-Z0-9._-]{3,60}$/.test(username)) throw new HttpError(400, "El usuario debe tener entre 3 y 60 caracteres y sólo puede usar letras, números, punto, guion o guion bajo.", "INVALID_USERNAME");
    if (password.length < 8) throw new HttpError(400, "La contraseña debe tener al menos 8 caracteres.", "WEAK_PASSWORD");
    await client.query("BEGIN");
    await assertUserCapacity(client, req.user.organizationId);
    const role = await client.query("SELECT id FROM roles WHERE code=$1", [roleCode]);
    if (!role.rows[0]) throw new HttpError(400, "El rol seleccionado no es válido.", "INVALID_ROLE");
    let linkedPersonnelId = null;
    if (personnelId) {
      const personnel = await client.query("SELECT id,full_name FROM personnel WHERE id=$1 AND organization_id=$2 AND status='ACTIVE' FOR UPDATE", [personnelId, req.user.organizationId]);
      if (!personnel.rows[0]) throw new HttpError(400, "El empleado seleccionado no existe o está inactivo.", "INVALID_PERSONNEL");
      const linked = await client.query("SELECT 1 FROM users WHERE organization_id=$1 AND personnel_id=$2", [req.user.organizationId, personnelId]);
      if (linked.rows[0]) throw new HttpError(409, "El empleado ya está asociado con otro usuario.", "PERSONNEL_ALREADY_LINKED");
      linkedPersonnelId = personnelId;
      fullName = personnel.rows[0].full_name;
    }
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await client.query(
      `INSERT INTO users(organization_id,role_id,full_name,username,password_hash,user_scope,is_platform_admin,created_by,personnel_id)
       VALUES($1,$2,$3,LOWER($4),$5,'CLIENT',FALSE,$6,$7) RETURNING id`,
      [req.user.organizationId,role.rows[0].id,fullName.trim(),username.trim(),hash,req.user.id,linkedPersonnelId]
    );
    await client.query("COMMIT");
    await audit(req,"USER_CREATED","users",rows[0].id,{ username,roleCode });
    res.status(201).json({ id:rows[0].id,message:"Usuario creado correctamente." });
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

async function actualizarUsuario(req, res, next) {
  const client = await db.connect();
  try {
    let { fullName }=req.body; const { username,roleCode,status,personnelId } = req.body;
    if (!fullName || !username || !roleCode || !["ACTIVE","INACTIVE","LOCKED"].includes(status)) throw new HttpError(400,"Los datos enviados no son válidos.","VALIDATION_ERROR");
    if (!/^[a-zA-Z0-9._-]{3,60}$/.test(username)) throw new HttpError(400,"El nombre de usuario no tiene un formato válido.","INVALID_USERNAME");
    if (req.params.id === req.user.id && status !== "ACTIVE") throw new HttpError(400,"No puedes dar de baja tu propia cuenta.","SELF_DISABLE");
    await client.query("BEGIN");
    const current = await client.query("SELECT status FROM users WHERE id=$1 AND organization_id=$2 AND user_scope='CLIENT' FOR UPDATE",[req.params.id,req.user.organizationId]);
    if (!current.rows[0]) throw new HttpError(404,"Usuario no encontrado.","USER_NOT_FOUND");
    if (status === "ACTIVE" && current.rows[0].status !== "ACTIVE") await assertUserCapacity(client,req.user.organizationId,req.params.id);
    let linkedPersonnelId = null;
    if (personnelId) {
      const personnel = await client.query("SELECT id,full_name FROM personnel WHERE id=$1 AND organization_id=$2 AND status='ACTIVE'", [personnelId,req.user.organizationId]);
      if (!personnel.rows[0]) throw new HttpError(400,"El empleado seleccionado no existe o está inactivo.","INVALID_PERSONNEL");
      const linked = await client.query("SELECT 1 FROM users WHERE organization_id=$1 AND personnel_id=$2 AND id<>$3",[req.user.organizationId,personnelId,req.params.id]);
      if(linked.rows[0]) throw new HttpError(409,"El empleado ya está asociado con otro usuario.","PERSONNEL_ALREADY_LINKED");
      linkedPersonnelId=personnelId;
      fullName=personnel.rows[0].full_name;
    }
    await client.query(
      `UPDATE users SET full_name=$1,username=LOWER($2),status=$3,token_version=token_version+1,
         role_id=(SELECT id FROM roles WHERE code=$4),personnel_id=$7,updated_at=NOW()
       WHERE id=$5 AND organization_id=$6 AND user_scope='CLIENT'`,
      [fullName.trim(),username.trim(),status,roleCode,req.params.id,req.user.organizationId,linkedPersonnelId]
    );
    await client.query("DELETE FROM active_user_sessions WHERE user_id=$1",[req.params.id]);
    await client.query("COMMIT");
    await audit(req,"USER_UPDATED","users",req.params.id,{ username,roleCode,status });
    res.json({ message:"Usuario actualizado correctamente." });
  } catch (error) { await client.query("ROLLBACK"); next(error); }
  finally { client.release(); }
}

async function cambiarEstado(req,res,next) {
  const client=await db.connect();
  try {
    const { status }=req.body;
    if (!["ACTIVE","INACTIVE"].includes(status)) throw new HttpError(400,"Estado no válido.","INVALID_STATUS");
    if (req.params.id===req.user.id) throw new HttpError(400,"No puedes cambiar el estado de tu propia cuenta.","SELF_DISABLE");
    await client.query("BEGIN");
    const current=await client.query("SELECT status FROM users WHERE id=$1 AND organization_id=$2 AND user_scope='CLIENT' FOR UPDATE",[req.params.id,req.user.organizationId]);
    if (!current.rows[0]) throw new HttpError(404,"Usuario no encontrado.","USER_NOT_FOUND");
    if (status==="ACTIVE" && current.rows[0].status!=="ACTIVE") await assertUserCapacity(client,req.user.organizationId,req.params.id);
    await client.query("UPDATE users SET status=$1,token_version=token_version+1,updated_at=NOW() WHERE id=$2",[status,req.params.id]);
    await client.query("DELETE FROM active_user_sessions WHERE user_id=$1",[req.params.id]);
    await client.query("COMMIT");
    await audit(req,status==="ACTIVE"?"USER_ENABLED":"USER_DISABLED","users",req.params.id);
    res.json({ message:status==="ACTIVE"?"Acceso del usuario reactivado.":"El usuario fue dado de baja y su sesión fue revocada." });
  } catch(error){ await client.query("ROLLBACK"); next(error); }
  finally{ client.release(); }
}

async function restablecerPassword(req,res,next){
  try{
    if(!req.body.password || req.body.password.length<8) throw new HttpError(400,"La contraseña debe tener al menos 8 caracteres.","WEAK_PASSWORD");
    const hash=await bcrypt.hash(req.body.password,12);
    const result=await db.query("UPDATE users SET password_hash=$1,token_version=token_version+1,updated_at=NOW() WHERE id=$2 AND organization_id=$3 AND user_scope='CLIENT'",[hash,req.params.id,req.user.organizationId]);
    if(!result.rowCount) throw new HttpError(404,"Usuario no encontrado.","USER_NOT_FOUND");
    await db.query("DELETE FROM active_user_sessions WHERE user_id=$1",[req.params.id]);
    await audit(req,"PASSWORD_RESET","users",req.params.id);
    res.json({ message:"Contraseña actualizada; las sesiones anteriores fueron cerradas." });
  }catch(error){ next(error); }
}

async function cerrarSesion(req,res,next){
  try{
    const result=await db.query(
      `DELETE FROM active_user_sessions s USING users u
       WHERE s.user_id=u.id AND u.id=$1 AND u.organization_id=$2 AND u.user_scope='CLIENT' RETURNING s.user_id`,
      [req.params.id,req.user.organizationId]
    );
    res.json({ message:result.rowCount?"Sesión cerrada correctamente.":"El usuario no tenía una sesión activa." });
  }catch(error){ next(error); }
}

module.exports={ obtenerUsuarios,obtenerCuota,obtenerRoles,crearUsuario,actualizarUsuario,cambiarEstado,restablecerPassword,cerrarSesion };
