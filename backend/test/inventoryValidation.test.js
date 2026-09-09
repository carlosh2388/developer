const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const sandbox = { require: (name) => name === '../config/database' ? {} : require('../utils/httpError'), module: { exports: {} } };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(require.resolve('../controllers/operacionesController'), 'utf8'), sandbox);
const validate = sandbox.validateProjectedInventory;
const client = { query: async (sql) => ({ rows: sql.includes('SELECT p.id') ? [{ id: 'p', name: 'MD02', available: -23 }] : [] }) };
test('permite un ingreso nuevo que recupera parcialmente un saldo negativo', async () => {
  await validate(client, 'org', [{ _productId: 'p', _quantity: 5 }], 'INPUT');
});
test('rechaza egresos sobre saldo negativo', async () => {
  await assert.rejects(validate(client, 'org', [{ _productId: 'p', _quantity: 5 }], 'OUTPUT'), /Existencia insuficiente/);
});
test('editar o anular ingresos mantiene la protecci?n de existencias', async () => {
  await assert.rejects(validate(client, 'org', [{ _productId: 'p', _quantity: 5 }], 'INPUT', 'document'), /Existencia insuficiente/);
});
test('otros egresos exige lotes y permite distribuir entre varios', () => {
  const body = { tipoMovimiento: 'OUTPUT', modulo: 'OTHER' };
  assert.throws(() => sandbox.validateOutputAllocations(body, [{ distribuciones: [{ galera: 'G1' }] }]), /lote/);
  assert.throws(() => sandbox.validateOutputAllocations(body, [{ distribuciones: [] }]), /lote/);
  sandbox.validateOutputAllocations(body, [{ distribuciones: [{ lote: 'L1' }, { lote: 'L2' }] }]);
});

test('egresos de insumos exige lotes', () => {
  const body = { tipoMovimiento: 'OUTPUT', modulo: 'SUPPLIES' };
  assert.throws(() => sandbox.validateOutputAllocations(body, [{ distribuciones: [] }]), /lote/);
  sandbox.validateOutputAllocations(body, [{ distribuciones: [{ lote: 'L1' }] }]);
});
