const router = require("express").Router();
const controller = require("../controllers/catalogosController");
const { authenticate, requirePermission } = require("../middleware/auth");

router.use(authenticate);
router.get("/catalogos/valores", requirePermission("operations.read"), controller.listarValores);
router.post("/catalogos/valores", requirePermission("settings.manage"), controller.crearValorCatalogo);
router.get("/catalogos/regiones/siguiente", requirePermission("operations.read"), controller.siguienteRegion);
router.post("/catalogos/regiones", requirePermission("settings.manage"), controller.crearRegion);
router.get("/catalogos/unidades/siguiente", requirePermission("operations.read"), controller.siguienteUnidad);
router.post("/catalogos/unidades", requirePermission("settings.manage"), controller.crearUnidad);

function crud(path, name, options = {}) {
  const handlers = controller.catalogController(name);
  router.get(path, requirePermission("operations.read"), handlers.listar);
  router.get(`${path}/:id`, requirePermission("operations.read"), handlers.obtener);
  if (options.create !== false) router.post(path, requirePermission("settings.manage"), handlers.crear);
  if (options.update !== false) router.put(`${path}/:id`, requirePermission("settings.manage"), handlers.actualizar);
}

crud("/localidades", "localidades");
router.get("/bodegas/siguiente", requirePermission("operations.read"), controller.siguienteBodega);
router.post("/bodegas", requirePermission("settings.manage"), controller.crearBodega);
crud("/bodegas", "bodegas", { create: false });
router.get("/proveedores/siguiente", requirePermission("operations.read"), controller.siguienteProveedor);
router.post("/proveedores", requirePermission("settings.manage"), controller.crearProveedor);
crud("/proveedores", "proveedores", { create: false });
crud("/lineas-avicolas", "lineasAvicolas");
router.post("/galeras", requirePermission("settings.manage"), controller.crearGalera);
crud("/galeras", "galeras", { create: false });
crud("/vehiculos", "vehiculos");
crud("/etapas-produccion", "etapasProduccion");
router.get("/productos/siguiente", requirePermission("operations.read"), controller.siguienteProducto);
router.post("/productos", requirePermission("settings.manage"), controller.crearProducto);
crud("/productos", "productos", { create: false });
router.get("/lotes/siguientes", requirePermission("operations.read"), controller.listarSiguientesLotes);
router.post("/lotes/trasladar-produccion", requirePermission("settings.manage"), controller.trasladarLoteProduccion);
router.post("/lotes", requirePermission("settings.manage"), controller.crearLote);
router.put("/lotes/:id", requirePermission("settings.manage"), controller.actualizarLote);
crud("/lotes", "lotes", { create: false, update: false });

router.get("/personal", requirePermission("operations.read"), controller.listarPersonal);
router.post("/personal", requirePermission("settings.manage"), controller.guardarPersonal);
router.put("/personal/:id", requirePermission("settings.manage"), controller.actualizarPersonal);
router.get("/clientes", requirePermission("operations.read"), controller.listarClientes);
router.get("/clientes/siguiente", requirePermission("operations.read"), controller.siguienteCliente);
router.post("/clientes", requirePermission("settings.manage"), controller.guardarCliente);
router.put("/clientes/:id", requirePermission("settings.manage"), controller.actualizarCliente);

module.exports = router;
