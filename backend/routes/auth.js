const router = require("express").Router();
const { login, me, refresh, logout, changePassword } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

router.post("/login", login);
router.get("/me", authenticate, me);
router.post("/refresh", authenticate, refresh);
router.post("/logout", authenticate, logout);
router.post("/change-password", authenticate, changePassword);

module.exports = router;
