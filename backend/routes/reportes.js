const router = require("express").Router();
const { authenticate, requirePermission } = require("../middleware/auth");
const controller = require("../controllers/reportesController");
router.use(authenticate);
router.get("/produccion", requirePermission("operations.read"), controller.produccion);
module.exports = router;
