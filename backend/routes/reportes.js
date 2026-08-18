const router = require("express").Router();
const { authenticate, requirePermission } = require("../middleware/auth");
const controller = require("../controllers/reportesController");
router.use(authenticate);
router.get("/alertas-inventario", requirePermission("operations.read"), controller.inventoryAlerts);
router.get("/dashboard", requirePermission("operations.read"), controller.dashboard);
router.get("/produccion", requirePermission("operations.read"), controller.produccion);
module.exports = router;
