import { Router } from 'express';
import { authenticateAdmin, logoutAdmin } from '../auth.js';
import { validateAdminLogin } from '../validators.js';

const router = Router();

router.post('/login', (req, res) => {
  const errors = validateAdminLogin(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: errors.join('. ') });
  }

  const username = req.body?.username || req.body?.email;
  const password = req.body?.password;
  const session = authenticateAdmin(username, password);

  if (!session) {
    return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
  }

  return res.json({
    success: true,
    token: session.token,
    user: session.user,
  });
});

router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  logoutAdmin(token);
  return res.json({ success: true });
});

export default router;
