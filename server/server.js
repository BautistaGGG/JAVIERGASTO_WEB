import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { initDatabase } from './initDatabase.js';
import db from './db.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contacts.js';
import productRoutes from './routes/products.js';
import taxonomyRoutes from './routes/taxonomy.js';
import { logError, logInfo } from './logger.js';
import { sendError } from './http.js';
import { recordRequestMetric, recordUnhandledError } from './metrics.js';
import { buildCorsOptions, createRateLimiter, securityHeaders } from './security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const distPath = path.join(__dirname, '..', 'dist');

initDatabase();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(cors(buildCorsOptions()));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.json({ limit: '5mb' }));
app.use('/api', createRateLimiter({ windowMs: 60_000, max: 120 }));
app.use('/api/admin/login', createRateLimiter({ windowMs: 60_000, max: 10 }));
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    recordRequestMetric({
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    });
    logInfo('http_request', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    });
  });
  next();
});

app.get('/api/health', (req, res) => {
  try {
    const result = db.prepare('SELECT 1 AS ok').get();
    return res.json({
      status: result?.ok === 1 ? 'ok' : 'degraded',
      db: result?.ok === 1 ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    });
  } catch (error) {
    logError('health_check_failed', {
      requestId: req.requestId,
      message: error?.message,
    });
    return sendError(res, req, 500, 'HEALTHCHECK_FAILED', 'Healthcheck fallido');
  }
});

app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api', taxonomyRoutes);
app.use('/api/*', (req, res) =>
  sendError(res, req, 404, 'NOT_FOUND', 'Endpoint no encontrado')
);

app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) {
    return sendError(res, req, 404, 'NOT_FOUND', 'Endpoint no encontrado');
  }
  return res.sendFile(path.join(distPath, 'index.html'));
});
app.use((error, req, res, _next) => {
  recordUnhandledError();
  logError('unhandled_error', {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    message: error?.message,
    stack: error?.stack,
  });

  if (res.headersSent) return;
  sendError(res, req, 500, 'INTERNAL_ERROR', 'Ocurrio un error interno. Intenta nuevamente.');
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}/api`);
});
