const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
async function save(samples, size = samples.length) {
  const saved = [];
  const client = { release() {}, async query(sql, params) {
    if (sql.startsWith('INSERT INTO bird_weight_samples')) saved.push(params);
    if (sql.startsWith('INSERT INTO bird_weight_controls')) return { rows: [{ id: 'control', sample_size: params[5], average: params[8] }] };
    return { rows: [{ id: 'catalog' }] };
  } };
  const sandbox = { require: (name) => name === '../config/database' ? { connect: async () => client } : require('../utils/httpError'), module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(require.resolve('../controllers/operacionesController'), 'utf8'), sandbox);
  let error, result;
  await sandbox.module.exports.crearPesoAves({ user: { organizationId: 'org', id: 'user' }, params: {}, body: { fecha: '2026-10-27', lote: 'L1', semana: 8, tamanoMuestra: size, muestras: samples } }, { status() { return this; }, json(value) { result = value; } }, (value) => { error = value; });
  return { error, result, saved };
}
for (const sex of ['F', 'M']) {
  test(`saves all 30 samples for ${sex} and calculates full average`, async () => {
    const { error, result, saved } = await save(Array.from({ length: 30 }, () => ({ sexo: sex, pesoGramos: 100 })));
    assert.ifError(error);
    assert.equal(result.sample_size, 30);
    assert.equal(Number(result.average), 100);
    assert.equal(saved.length, 30);
    assert.ok(saved.every((params) => params[2] === sex));
  });
}
test('accepts odd sample counts for one sex', async () => {
  assert.ifError((await save([{ sexo: 'F', pesoGramos: 120 }])).error);
});
test('rejects mixed sexes, invalid sex, incomplete samples and zero weights', async () => {
  for (const [samples, size] of [
    [[{ sexo: 'F', pesoGramos: 100 }, { sexo: 'M', pesoGramos: 100 }], 2],
    [[{ sexo: 'X', pesoGramos: 100 }], 1],
    [[{ sexo: 'F', pesoGramos: 100 }], 30],
    [[{ sexo: 'F', pesoGramos: 0 }], 1],
  ]) {
    const { error, saved } = await save(samples, size);
    assert.equal(error.status || error.statusCode, 400);
    assert.equal(saved.length, 0);
  }
});
