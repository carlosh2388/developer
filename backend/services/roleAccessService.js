const HttpError = require('../utils/httpError');

const isAdjustment = (type) => ['ADJUSTMENT_IN', 'ADJUSTMENT_OUT'].includes(type);
const sessionLimit = () => 2;

function assertAdjustmentAccess(user, ...types) {
  if (types.some((type) => type === true || isAdjustment(type)) &&
      !['ADMINISTRATOR', 'PRODUCTION_MANAGER'].includes(user.role)) {
    throw new HttpError(403, 'Solo el administrador y el gerente de producción pueden realizar ajustes de entrada y salida.', 'ADJUSTMENT_FORBIDDEN');
  }
}

module.exports = { isAdjustment, sessionLimit, assertAdjustmentAccess };
