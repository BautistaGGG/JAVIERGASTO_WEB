import { Router } from 'express';
import { requireAdmin } from '../auth.js';
import { handleUnexpectedError, sendError } from '../http.js';
import { logInfo } from '../logger.js';
import { createRateLimiter } from '../security.js';
import { validateContactPayload, validateInquiryStatus } from '../validators.js';
import { addAuditEvent } from '../auditLog.js';
import { createContact, listContacts, updateContactStatus } from '../repositories/contactRepository.js';

const router = Router();

const contactSubmitLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 8,
  keyFn: (req) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const email = String(req.body?.email || '').trim().toLowerCase() || 'no-email';
    return `${ip}:${email}`;
  },
});

router.get('/', requireAdmin, (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 20)));
    const status = req.query.status ? String(req.query.status) : null;
    const search = req.query.search ? String(req.query.search).trim() : '';
    const flatMode = req.query.flat === 'true';

    const { items, total } = listContacts({ page, pageSize, status, search });

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

router.post('/', contactSubmitLimiter, (req, res) => {
  const errors = validateContactPayload(req.body);
  if (errors.length > 0) {
    return sendError(res, req, 400, 'VALIDATION_ERROR', errors.join('. '));
  }

  try {
    const body = req.body || {};
    const contact = createContact({
      ...body,
      status: 'pending',
      source: 'contact_form',
    });
    return res.status(201).json(contact);
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
    const row = updateContactStatus(req.params.id, status);
    if (!row) return sendError(res, req, 404, 'NOT_FOUND', 'Consulta no encontrada');
    logInfo('admin_contact_status_update', {
      requestId: req.requestId,
      user: req.user?.email,
      contactId: row?.id,
      status,
    });
    addAuditEvent({
      actor: req.user?.email,
      action: 'contact.status.update',
      entity: 'contact',
      entityId: row?.id,
      detail: `Consulta ${row?.id} marcada como ${status}`,
      requestId: req.requestId,
    });
    return res.json(row);
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'contacts_update_status');
  }
});

export default router;
