import crypto from 'crypto';

const sessions = new Map();

const ADMIN_USER = process.env.ADMIN_USER || 'admin@industrialpro.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

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

  const token = crypto.randomBytes(32).toString('hex');
  const user = getAdminUser();
  sessions.set(token, user);
  return { token, user };
}

export function logoutAdmin(token) {
  if (token) sessions.delete(token);
}

export function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = token ? sessions.get(token) : null;

  if (!user) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  req.user = user;
  req.token = token;
  return next();
}
