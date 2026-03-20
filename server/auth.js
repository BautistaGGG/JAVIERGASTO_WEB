import crypto from 'crypto';
import db from './db.js';

const ADMIN_USER = process.env.ADMIN_USER || 'admin@industrialpro.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOKEN_TTL_SECONDS = Number(process.env.ADMIN_TOKEN_TTL_SECONDS || 60 * 60 * 12);

const parseSecrets = () => {
  const rawSecrets = process.env.ADMIN_TOKEN_SECRETS || process.env.ADMIN_TOKEN_SECRET || 'change-me-before-production';
  return String(rawSecrets)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const TOKEN_SECRETS = parseSecrets();
const SIGNING_SECRET = TOKEN_SECRETS[0];

const base64UrlEncode = (value) => Buffer.from(value).toString('base64url');
const base64UrlDecode = (value) => Buffer.from(value, 'base64url').toString('utf8');

const sign = (value, secret) =>
  crypto
    .createHmac('sha256', secret)
    .update(value)
    .digest('base64url');

const timingSafeEqual = (a, b) => {
  const first = Buffer.from(a);
  const second = Buffer.from(b);
  if (first.length !== second.length) return false;
  return crypto.timingSafeEqual(first, second);
};

const parseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getBearerToken = (authorizationHeader) =>
  typeof authorizationHeader === 'string' && authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : null;

const hashToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

// Ensure auth tables exist even after restoring an older backup.
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_revoked_tokens (
    token_hash TEXT PRIMARY KEY,
    revoked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_admin_revoked_tokens_expires_at
  ON admin_revoked_tokens (expires_at);
`);

const insertRevokedToken = db.prepare(`
  INSERT INTO admin_revoked_tokens (token_hash, expires_at)
  VALUES (?, ?)
  ON CONFLICT(token_hash) DO UPDATE SET
    expires_at = excluded.expires_at,
    revoked_at = CURRENT_TIMESTAMP
`);

const findRevokedToken = db.prepare('SELECT token_hash FROM admin_revoked_tokens WHERE token_hash = ?');
const deleteExpiredRevokedTokens = db.prepare("DELETE FROM admin_revoked_tokens WHERE expires_at <= datetime('now')");

function cleanupRevokedTokenStore() {
  try {
    deleteExpiredRevokedTokens.run();
  } catch {
  }
}

function buildToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.email,
    role: user.role,
    name: user.name,
    iat: now,
    exp: now + ADMIN_TOKEN_TTL_SECONDS,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = sign(unsignedToken, SIGNING_SECRET);
  return { token: `${unsignedToken}.${signature}`, payload };
}

function decodeTokenPayload(token) {
  const [, payloadPart] = String(token).split('.');
  if (!payloadPart) return null;
  return parseJson(base64UrlDecode(payloadPart));
}

function isTokenRevoked(token) {
  const tokenHash = hashToken(token);
  return Boolean(findRevokedToken.get(tokenHash));
}

function verifyToken(token) {
  if (!token) return null;

  cleanupRevokedTokenStore();
  if (isTokenRevoked(token)) return null;

  const [headerPart, payloadPart, signaturePart] = String(token).split('.');
  if (!headerPart || !payloadPart || !signaturePart) return null;

  const unsignedToken = `${headerPart}.${payloadPart}`;
  const isSignedByKnownSecret = TOKEN_SECRETS.some((secret) =>
    timingSafeEqual(signaturePart, sign(unsignedToken, secret))
  );
  if (!isSignedByKnownSecret) return null;

  const header = parseJson(base64UrlDecode(headerPart));
  const payload = parseJson(base64UrlDecode(payloadPart));
  if (!header || !payload || header.alg !== 'HS256' || header.typ !== 'JWT') return null;

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= now) return null;

  return {
    username: payload.sub,
    email: payload.sub,
    name: payload.name || 'Administrador',
    role: payload.role || 'admin',
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
}

export function getAdminUser() {
  return {
    username: ADMIN_USER,
    email: ADMIN_USER,
    name: 'Administrador',
    role: 'admin',
  };
}

export function authenticateAdmin(username, password) {
  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return null;
  }

  const user = getAdminUser();
  const { token, payload } = buildToken(user);
  return {
    token,
    user,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
}

export function logoutAdmin(token, expiresAt) {
  if (!token) return;

  const decoded = decodeTokenPayload(token);
  const expiresAtDate = expiresAt
    ? new Date(expiresAt)
    : decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + ADMIN_TOKEN_TTL_SECONDS * 1000);

  insertRevokedToken.run(hashToken(token), expiresAtDate.toISOString());
  cleanupRevokedTokenStore();
}

export function requireAdmin(req, res, next) {
  const token = getBearerToken(req.headers.authorization);
  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  req.user = user;
  req.token = token;
  return next();
}
