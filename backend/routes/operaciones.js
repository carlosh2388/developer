const router = require("express").Router();
const controller = require("../controllers/operacionesController");
const { authenticate, requirePermission } = require("../middleware/auth");

router.use(authenticate);

router.get("/inventario/documentos", requirePermission("operations.read"), controller.listarInventario);
router.get("/inventario/documentos/:id", requirePermission("operations.read"), controller.obtenerInventario);
router.post("/inventario/documentos", requirePermission("operations.create"), controller.crearInventario);
router.put("/inventario/documentos/:id", requirePermission("operations.approve"), controller.actualizarInventario);
router.patch("/inventario/documentos/:id/anular", requirePermission("operations.approve"), controller.anularInventario);
router.patch("/operaciones/:tipo/:id/anular", requirePermission("operations.approve"), controller.anularOperacion);

router.get("/huevos/clasificaciones", requirePermission("operations.read"), controller.listarClasificacionesHuevos);
router.get("/huevos/existencias", requirePermission("operations.read"), controller.listarExistenciasHuevos);
router.get("/huevos/envios/siguiente", requirePermission("operations.read"), controller.siguienteEnvioHuevos);
router.get("/huevos/movimientos", requirePermission("operations.read"), controller.listarHuevos);
router.get("/huevos/movimientos/:id", requirePermission("operations.read"), controller.obtenerHuevos);
router.post("/huevos/movimientos", requirePermission("operations.create"), controller.crearMovimientoHuevos);
router.put("/huevos/movimientos/:id", requirePermission("operations.approve"), controller.crearMovimientoHuevos);

router.get("/reproductores/egresos", requirePermission("operations.read"), controller.listarEgresosAves);
router.get("/reproductores/egresos/:id", requirePermission("operations.read"), controller.obtenerEgresoAves);
router.post("/reproductores/egresos", requirePermission("operations.create"), controller.crearEgresoAves);
router.put("/reproductores/egresos/:id", requirePermission("operations.approve"), controller.crearEgresoAves);

router.get("/controles/peso-aves", requirePermission("operations.read"), controller.listarPesoAves);
router.get("/controles/peso-aves/:id", requirePermission("operations.read"), controller.obtenerPesoAves);
router.post("/controles/peso-aves", requirePermission("operations.create"), controller.crearPesoAves);
router.put("/controles/peso-aves/:id", requirePermission("operations.approve"), controller.crearPesoAves);
router.get("/controles/peso-huevos", requirePermission("operations.read"), controller.listarPesoHuevos);
router.get("/controles/peso-huevos/:id", requirePermission("operations.read"), controller.obtenerPesoHuevos);
router.post("/controles/peso-huevos", requirePermission("operations.create"), controller.crearPesoHuevos);
router.put("/controles/peso-huevos/:id", requirePermission("operations.approve"), controller.crearPesoHuevos);

module.exports = router;
