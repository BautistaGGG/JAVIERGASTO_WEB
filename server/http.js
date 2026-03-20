import { logError } from './logger.js';
import { recordRouteError } from './metrics.js';

export function sendError(res, req, status, code, message, details) {
  return res.status(status).json({
    error: {
      code,
      message,
      requestId: req.requestId || null,
      details: details || undefined,
    },
  });
}

export function handleUnexpectedError(error, req, res, context = 'unexpected_error') {
  recordRouteError();
  logError('route_error', {
    context,
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    message: error?.message,
    stack: error?.stack,
  });

  return sendError(
    res,
    req,
    500,
    'INTERNAL_ERROR',
    'Ocurrió un error interno. Intentá nuevamente.'
  );
}
