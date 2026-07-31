const router = require("express").Router();
const controller = require("../controllers/usuariosController");
const { authenticate, requirePermission } = require("../middleware/auth");

router.use(authenticate);
router.get("/roles", requirePermission("users.read"), controller.obtenerRoles);
router.get("/", requirePermission("users.read"), controller.obtenerUsuarios);
router.post("/", requirePermission("users.create"), controller.crearUsuario);
router.put("/:id", requirePermission("users.update"), controller.actualizarUsuario);
router.patch("/:id/status", requirePermission("users.disable"), controller.cambiarEstado);
router.patch("/:id/password", requirePermission("users.update"), controller.restablecerPassword);

module.exports = router;

