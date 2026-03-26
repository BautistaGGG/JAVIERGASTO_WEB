import { Router } from 'express';
import { sendError } from '../http.js';
import { recordWhatsAppClick } from '../metrics.js';

const router = Router();

router.post('/whatsapp-click', (req, res) => {
  const source = String(req.body?.source || '').trim();
  if (!source) {
    return sendError(res, req, 400, 'VALIDATION_ERROR', 'El origen del evento es obligatorio');
  }

  recordWhatsAppClick({
    source,
    metadata: req.body?.metadata && typeof req.body.metadata === 'object' ? req.body.metadata : {},
  });

  return res.status(202).json({ success: true });
});

export default router;
