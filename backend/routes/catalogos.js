const router = require("express").Router();
const controller = require("../controllers/catalogosController");
const { authenticate, requirePermission } = require("../middleware/auth");

router.use(authenticate);
router.get("/catalogos/valores", requirePermission("operations.read"), controller.listarValores);

function crud(path, name) {
  const handlers = controller.catalogController(name);
  router.get(path, requirePermission("operations.read"), handlers.listar);
  router.get(`${path}/:id`, requirePermission("operations.read"), handlers.obtener);
  router.post(path, requirePermission("settings.manage"), handlers.crear);
  router.put(`${path}/:id`, requirePermission("settings.manage"), handlers.actualizar);
}

crud("/localidades", "localidades");
crud("/bodegas", "bodegas");
crud("/proveedores", "proveedores");
crud("/lineas-avicolas", "lineasAvicolas");
crud("/galeras", "galeras");
crud("/vehiculos", "vehiculos");
crud("/etapas-produccion", "etapasProduccion");
crud("/productos", "productos");
crud("/lotes", "lotes");

router.get("/personal", requirePermission("operations.read"), controller.listarPersonal);
router.post("/personal", requirePermission("settings.manage"), controller.guardarPersonal);
router.put("/personal/:id", requirePermission("settings.manage"), controller.actualizarPersonal);
router.get("/clientes", requirePermission("operations.read"), controller.listarClientes);
router.post("/clientes", requirePermission("settings.manage"), controller.guardarCliente);
router.put("/clientes/:id", requirePermission("settings.manage"), controller.actualizarCliente);

module.exports = router;
