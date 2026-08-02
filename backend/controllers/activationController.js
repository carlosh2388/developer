const { activateInstallation } = require("../services/licenseService");

async function activate(req, res, next) {
  try {
    const result = await activateInstallation(req.body.installationId, req.body.licenseKey);
    res.json({ ...result, message: "Instalación activada correctamente." });
  } catch (error) { next(error); }
}

module.exports = { activate };

