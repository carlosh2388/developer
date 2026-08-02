const router = require("express").Router();
const controller = require("../controllers/licensesController");
const users = require("../controllers/platformUsersController");
const { authenticate, requirePlatformAdmin } = require("../middleware/auth");

router.use(authenticate, requirePlatformAdmin);
router.get("/organizations", controller.listOrganizations);
router.post("/organizations", controller.createOrganization);
router.put("/organizations/:id", controller.updateOrganization);
router.get("/licenses", controller.listLicenses);
router.post("/licenses", controller.createLicense);
router.put("/licenses/:id", controller.updateLicense);
router.post("/licenses/:id/regenerate-key", controller.regenerateLicenseKey);
router.get("/licenses/:id/keys", controller.listLicenseKeys);
router.get("/audit-logs", controller.listAuditLogs);
router.get("/users/roles", users.listRoles);
router.get("/users", users.listUsers);
router.post("/users", users.createUser);
router.put("/users/:id", users.updateUser);
router.patch("/users/:id/password", users.resetPassword);
router.delete("/users/:id/session", users.closeSession);

module.exports = router;
