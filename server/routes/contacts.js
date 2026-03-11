import { Router } from 'express';
import db, { formatContact } from '../db.js';
import { requireAdmin } from '../auth.js';
import { validateContactPayload, validateInquiryStatus } from '../validators.js';

const router = Router();

router.get('/', requireAdmin, (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC, id DESC').all();
    return res.json(rows.map(formatContact));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  const errors = validateContactPayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('. ') });
  }

  try {
    const body = req.body || {};
    const result = db.prepare(`
      INSERT INTO contacts (
        name, email, phone, message, subject, product_id, product_name, status, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      body.name.trim(),
      body.email.trim(),
      body.phone || '',
      body.message.trim(),
      body.subject || '',
      body.productId || null,
      body.productName || 'Consulta general',
      body.status || 'pending',
      body.source || 'contact_form'
    );

    const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(formatContact(row));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', requireAdmin, (req, res) => {
  const status = req.body?.status || 'pending';
  const errors = validateInquiryStatus(status);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('. ') });
  }

  db.prepare('UPDATE contacts SET status = ? WHERE id = ?').run(status, req.params.id);
  const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);

  if (!row) return res.status(404).json({ error: 'Consulta no encontrada' });
  return res.json(formatContact(row));
});

export default router;
