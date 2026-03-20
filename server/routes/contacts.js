import { Router } from 'express';
import db, { formatContact } from '../db.js';
import { requireAdmin } from '../auth.js';
import { handleUnexpectedError, sendError } from '../http.js';
import { logInfo } from '../logger.js';
import { validateContactPayload, validateInquiryStatus } from '../validators.js';

const router = Router();

router.get('/', requireAdmin, (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 20)));
    const status = req.query.status ? String(req.query.status) : null;
    const search = req.query.search ? String(req.query.search).trim() : '';
    const flatMode = req.query.flat === 'true';

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      const term = `%${search}%`;
      conditions.push('(name LIKE ? OR email LIKE ? OR message LIKE ? OR product_name LIKE ?)');
      params.push(term, term, term, term);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = db.prepare(`SELECT COUNT(*) AS count FROM contacts ${where}`).get(...params)?.count || 0;
    const offset = (page - 1) * pageSize;
    const rows = db.prepare(`
      SELECT * FROM contacts
      ${where}
      ORDER BY created_at DESC, id DESC
      LIMIT ? OFFSET ?
    `).all(...params, pageSize, offset);
    const items = rows.map(formatContact);

    if (flatMode) return res.json(items);
    return res.json({
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
      filters: {
        status: status || null,
        search: search || null,
      },
    });
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'contacts_list');
  }
});

router.post('/', (req, res) => {
  const errors = validateContactPayload(req.body);
  if (errors.length > 0) {
    return sendError(res, req, 400, 'VALIDATION_ERROR', errors.join('. '));
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
    return handleUnexpectedError(error, req, res, 'contacts_create');
  }
});

router.put('/:id/status', requireAdmin, (req, res) => {
  const status = req.body?.status || 'pending';
  const errors = validateInquiryStatus(status);
  if (errors.length > 0) {
    return sendError(res, req, 400, 'VALIDATION_ERROR', errors.join('. '));
  }

  try {
    db.prepare('UPDATE contacts SET status = ? WHERE id = ?').run(status, req.params.id);
    const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);

    if (!row) return sendError(res, req, 404, 'NOT_FOUND', 'Consulta no encontrada');
    logInfo('admin_contact_status_update', {
      requestId: req.requestId,
      user: req.user?.email,
      contactId: row?.id,
      status,
    });
    return res.json(formatContact(row));
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'contacts_update_status');
  }
});

export default router;
