function notFound(req, res) {
  res.status(404).json({ message: "El recurso solicitado no existe.", code: "NOT_FOUND" });
}

function errorHandler(error, _req, res, _next) {
  if (error.code === "23505") return res.status(409).json({ message: "Ya existe un registro con esos datos.", code: "DUPLICATE" });
  if (error.code === "23503") return res.status(400).json({ message: "El registro relacionado no existe o pertenece a otro cliente.", code: "INVALID_REFERENCE" });
  if (error.code === "23514" || error.code === "22P02") return res.status(400).json({ message: "Uno o más valores enviados no son válidos.", code: "VALIDATION_ERROR" });
  const status = error.status || 500;
  if (status === 500) console.error(error);
  res.status(status).json({ message: status === 500 ? "Ocurrió un error interno. Inténtalo nuevamente." : error.message, code: error.code || "INTERNAL_ERROR" });
}

module.exports = { notFound, errorHandler };

