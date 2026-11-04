const test = require('node:test');
const assert = require('node:assert/strict');
const { assertAdjustmentAccess, sessionLimit } = require('../services/roleAccessService');

test('solo administrador y gerente de producción pueden modificar ajustes', () => {
  for (const role of ['ADMINISTRATOR', 'PRODUCTION_MANAGER']) {
    assert.doesNotThrow(() => assertAdjustmentAccess({ role }, 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', true));
  }
  for (const role of ['FARM_MANAGER', 'HATCHERY_MANAGER', 'READ_ONLY', 'SUPERVISOR', 'OPERATOR']) {
    for (const movement of ['ADJUSTMENT_IN', 'ADJUSTMENT_OUT', true]) {
      assert.throws(() => assertAdjustmentAccess({ role }, movement), (error) => error.status === 403 && error.code === 'ADJUSTMENT_FORBIDDEN');
    }
    assert.doesNotThrow(() => assertAdjustmentAccess({ role }, 'INPUT', 'OUTPUT', false));
  }
});

test('todos los perfiles permiten como máximo dos sesiones independientes', () => {
  for (const role of ['READ_ONLY', 'ADMINISTRATOR', 'FARM_MANAGER', 'HATCHERY_MANAGER', 'PRODUCTION_MANAGER', 'SUPERVISOR', 'OPERATOR']) assert.equal(sessionLimit(role), 2);
});

test('roles, sesiones concurrentes y restricciones de API', { skip: !process.env.TEST_DATABASE_URL }, async (t) => {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.JWT_SECRET = 'role-access-integration-secret-for-isolated-database';
  process.env.LICENSE_ENFORCEMENT = 'false';
  const db = require('../config/database');
  const fs = require('node:fs');
  const crypto = require('node:crypto');
  const bcrypt = require('bcryptjs');
  const app = require('../app');
  const migration = fs.readFileSync(require.resolve('../database/023_client_roles_and_shared_sessions.sql'), 'utf8');
  await db.query(migration);
  await db.query(migration); // Reapplying must preserve roles and existing users.
  const organization = (await db.query("INSERT INTO organizations(name,status) VALUES('Role access integration','ACTIVE') RETURNING id")).rows[0].id;
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await db.end(); });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const request = async (path, token, method = 'GET', body) => {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: await response.json().catch(() => null) };
  };
  const password = crypto.randomBytes(18).toString('hex');
  const hash = await bcrypt.hash(password, 4);
  const users = {};
  for (const role of ['READ_ONLY', 'FARM_MANAGER', 'HATCHERY_MANAGER', 'PRODUCTION_MANAGER', 'ADMINISTRATOR']) {
    const username = `test.${role.toLowerCase()}.${crypto.randomBytes(3).toString('hex')}`;
    const result = await db.query("INSERT INTO users(organization_id,role_id,full_name,username,password_hash,status,user_scope) SELECT $1,id,$2,$2,$3,'ACTIVE','CLIENT' FROM roles WHERE code=$4 RETURNING id", [organization, username, hash, role]);
    users[role] = { id: result.rows[0].id, username };
  }
  const login = (role) => request('/auth/login', null, 'POST', { username: users[role].username, password });
  const parallel = await Promise.all(Array.from({ length: 3 }, () => login('READ_ONLY')));
  assert.deepEqual(parallel.map(result => result.status).sort(), [200, 200, 409]);
  const readerTokens = parallel.filter(result => result.status === 200).map(result => result.body.token);
  for (const token of readerTokens) assert.equal((await request('/auth/me', token)).status, 200);
  const reader = readerTokens[0];
  assert.equal((await request('/inventario/documentos', reader)).status, 200);
  for (const [path, method] of [['/inventario/documentos', 'POST'], ['/huevos/movimientos', 'POST'], ['/productos', 'POST'], ['/personal', 'POST'], ['/usuarios', 'POST']]) {
    assert.equal((await request(path, reader, method, {})).status, 403, `${method} ${path}`);
  }
  const sessions = await Promise.all([login('FARM_MANAGER'), login('FARM_MANAGER'), login('FARM_MANAGER')]);
  assert.deepEqual(sessions.map(result => result.status).sort(), [200, 200, 409]);
  const farm = sessions.find(result => result.status === 200).body.token;
  assert.equal((await request('/usuarios', farm)).status, 403);
  for (const path of ['/inventario/documentos', '/huevos/movimientos']) {
    for (const tipoMovimiento of ['ADJUSTMENT_IN', 'ADJUSTMENT_OUT']) assert.equal((await request(path, farm, 'POST', { tipoMovimiento })).status, 403);
    assert.equal((await request(path, farm, 'POST', { tipoMovimiento: 'INPUT' })).status, 400); // Ordinary operation passes authorization, reaches validation.
  }
  const production = (await login('PRODUCTION_MANAGER')).body.token;
  assert.equal((await request('/huevos/movimientos', production, 'POST', { tipoMovimiento: 'ADJUSTMENT_IN' })).status, 400);
  const adjustment = (await db.query("INSERT INTO inventory_documents(organization_id,movement_type,module_code,movement_date,created_by) VALUES($1,'ADJUSTMENT_IN','OTHER',CURRENT_DATE,$2) RETURNING id", [organization, users.ADMINISTRATOR.id])).rows[0].id;
  const editBody = { tipoMovimiento: 'INPUT', modulo: 'OTHER', detalles: [{}] };
  assert.equal((await request(`/inventario/documentos/${adjustment}`, farm, 'PUT', editBody)).status, 403);
  assert.equal((await request(`/inventario/documentos/${adjustment}/anular`, farm, 'PATCH')).status, 403);
  const linked = (await db.query("INSERT INTO inventory_documents(organization_id,movement_type,module_code,movement_date,created_by) VALUES($1,'INPUT','OTHER',CURRENT_DATE,$2) RETURNING id", [organization, users.ADMINISTRATOR.id])).rows[0].id;
  const egg = (await db.query("INSERT INTO egg_movements(organization_id,movement_type,movement_date,created_by,is_adjustment,inventory_document_id) VALUES($1,'INPUT',CURRENT_DATE,$2,TRUE,$3) RETURNING id", [organization, users.ADMINISTRATOR.id, linked])).rows[0].id;
  assert.equal((await request(`/huevos/movimientos/${egg}`, farm, 'PUT', editBody)).status, 403);
  assert.equal((await request(`/operaciones/huevos/${egg}/anular`, farm, 'PATCH')).status, 403);
  assert.equal((await request(`/inventario/documentos/${linked}`, farm, 'PUT', editBody)).status, 403);
  assert.equal((await request(`/inventario/documentos/${linked}/anular`, farm, 'PATCH')).status, 403);
  const admin = (await login('ADMINISTRATOR')).body.token;
  const roles = await request('/usuarios/roles', admin);
  assert.equal(roles.status, 200);
  for (const code of Object.keys(users)) assert.ok(roles.body.some(role => role.code === code));
  assert.equal((await request('/auth/logout', readerTokens[0], 'POST')).status, 204);
  assert.equal((await request('/auth/me', readerTokens[1])).status, 200);
  assert.equal((await login('READ_ONLY')).status, 200);
});
