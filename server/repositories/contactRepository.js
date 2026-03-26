import db, { formatContact } from '../db.js';

export function listContacts({ page = 1, pageSize = 20, status = null, search = '' } = {}) {
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

  return {
    items: rows.map(formatContact),
    total,
  };
}

export function createContact(payload = {}) {
  const result = db.prepare(`
    INSERT INTO contacts (
      name, email, phone, message, subject, product_id, product_name, status, source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    String(payload.name || '').trim(),
    String(payload.email || '').trim(),
    String(payload.phone || '').trim(),
    String(payload.message || '').trim(),
    String(payload.subject || '').trim(),
    Number.isInteger(Number(payload.productId)) ? Number(payload.productId) : null,
    String(payload.productName || '').trim() || 'Consulta general',
    String(payload.status || 'pending'),
    String(payload.source || 'contact_form')
  );

  return getContactById(Number(result.lastInsertRowid));
}

export function getContactById(id) {
  const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
  return formatContact(row);
}

export function updateContactStatus(id, status) {
  db.prepare('UPDATE contacts SET status = ? WHERE id = ?').run(status, id);
  return getContactById(id);
}
