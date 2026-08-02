const router = require("express").Router();
const controller = require("../controllers/usuariosController");
const { authenticate, requirePermission } = require("../middleware/auth");

router.use(authenticate);
router.get("/roles", requirePermission("users.read"), controller.obtenerRoles);
router.get("/quota", requirePermission("users.read"), controller.obtenerCuota);
router.get("/", requirePermission("users.read"), controller.obtenerUsuarios);
router.post("/", requirePermission("users.create"), controller.crearUsuario);
router.put("/:id", requirePermission("users.update"), controller.actualizarUsuario);
router.patch("/:id/status", requirePermission("users.disable"), controller.cambiarEstado);
router.patch("/:id/password", requirePermission("users.update"), controller.restablecerPassword);
router.delete("/:id/session", requirePermission("users.update"), controller.cerrarSesion);

module.exports = router;

