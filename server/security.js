const parseOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export function buildCorsOptions() {
  const configuredOrigins = parseOrigins(process.env.CORS_ORIGINS);
  const devDefaults = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  const allowList = configuredOrigins.length > 0 ? configuredOrigins : devDefaults;

  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowList.includes(origin)) return callback(null, true);
      return callback(new Error('Origen no permitido por CORS'));
    },
  };
}

export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-XSS-Protection', '0');
  next();
}

export function createRateLimiter({ windowMs = 60_000, max = 60, keyFn } = {}) {
  const bucket = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = (typeof keyFn === 'function' ? keyFn(req) : null) || req.ip || req.socket?.remoteAddress || 'unknown';
    const current = bucket.get(key);

    if (!current || now >= current.resetAt) {
      bucket.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;

    if (current.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta nuevamente en unos segundos.' });
    }

    return next();
  };
}

