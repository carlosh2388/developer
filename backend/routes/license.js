const router = require("express").Router();
const { activate } = require("../controllers/activationController");

router.post("/activate", activate);

module.exports = router;

