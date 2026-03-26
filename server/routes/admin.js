import { Router } from 'express';
import { authenticateAdmin, logoutAdmin, requireAdmin } from '../auth.js';
import { sendError } from '../http.js';
import { logInfo, logWarn } from '../logger.js';
import { getMetricsSnapshot } from '../metrics.js';
import { validateAdminLogin } from '../validators.js';
import { addAuditEvent, getAuditEvents } from '../auditLog.js';

const router = Router();

router.post('/login', (req, res) => {
  const errors = validateAdminLogin(req.body);
  if (errors.length > 0) {
    return sendError(res, req, 400, 'VALIDATION_ERROR', errors.join('. '));
  }

  const username = req.body?.username || req.body?.email;
  const password = req.body?.password;
  const session = authenticateAdmin(username, password);

  if (!session) {
    logWarn('admin_login_failed', {
      requestId: req.requestId,
      username,
      ip: req.ip,
    });
    addAuditEvent({
      actor: username || 'unknown',
      action: 'admin.login.failed',
      entity: 'auth',
      detail: 'Intento de login fallido',
      requestId: req.requestId,
    });
    return sendError(res, req, 401, 'INVALID_CREDENTIALS', 'Credenciales incorrectas');
  }

  logInfo('admin_login_success', {
    requestId: req.requestId,
    username,
    expiresAt: session.expiresAt,
    ip: req.ip,
  });

  addAuditEvent({
    actor: session.user?.email || username,
    action: 'admin.login.success',
    entity: 'auth',
    detail: 'Inicio de sesión exitoso',
    requestId: req.requestId,
  });

  return res.json({
    success: true,
    token: session.token,
    user: session.user,
    expiresAt: session.expiresAt,
  });
});

router.post('/logout', requireAdmin, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  logoutAdmin(token, req.user?.expiresAt);
  logInfo('admin_logout', {
    requestId: req.requestId,
    user: req.user?.email || null,
    ip: req.ip,
  });
  addAuditEvent({
    actor: req.user?.email || 'admin',
    action: 'admin.logout',
    entity: 'auth',
    detail: 'Cierre de sesión',
    requestId: req.requestId,
  });
  return res.json({ success: true });
});

router.get('/metrics', requireAdmin, (req, res) => {
  const snapshot = getMetricsSnapshot();
  return res.json(snapshot);
});

router.get('/audit', requireAdmin, (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  return res.json({
    items: getAuditEvents({ limit }),
  });
});

export default router;
