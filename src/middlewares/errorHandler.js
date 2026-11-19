const createError = require('http-errors');
const logger = require('../utils/logger');

exports.notFound = (req, res, next) => {
  next(createError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    err = createError(400, 'JSON inválido en el body', { field: 'body' });
  }

  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    logger.critical(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }

  if (status === 400 || status === 409) {
    logger.validation(err.field || 'desconocido', err.message);
  }

  res.status(status).json({
    error: err.message,
    ...(err.field && { field: err.field }),
  });
};
