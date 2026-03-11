import { Router } from 'express';
import db, { formatBrand, formatCategory } from '../db.js';
import { requireAdmin } from '../auth.js';
import { validateBrandPayload, validateCategoryPayload } from '../validators.js';

const router = Router();

const createSlug = (value = '') =>
  value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

router.get('/categories', (_req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
  return res.json(rows.map(formatCategory));
});

router.post('/categories', requireAdmin, (req, res) => {
  const errors = validateCategoryPayload(req.body);
  if (errors.length > 0) return res.status(400).json({ error: errors.join('. ') });

  const { name, icon, color } = req.body || {};
  const result = db.prepare(`
    INSERT INTO categories (name, slug, icon, color)
    VALUES (?, ?, ?, ?)
  `).run(name.trim(), createSlug(name), icon || '??', color || 'from-slate-500 to-slate-700');

  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(formatCategory(row));
});

router.put('/categories/:id', requireAdmin, (req, res) => {
  const errors = validateCategoryPayload(req.body, { partial: true });
  if (errors.length > 0) return res.status(400).json({ error: errors.join('. ') });

  const current = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!current) return res.status(404).json({ error: 'Categoría no encontrada' });

  const name = req.body?.name ?? current.name;
  const icon = req.body?.icon ?? current.icon;
  const color = req.body?.color ?? current.color;
  const slug = createSlug(name);

  db.prepare(`
    UPDATE categories
    SET name = ?, slug = ?, icon = ?, color = ?
    WHERE id = ?
  `).run(name, slug, icon, color, req.params.id);

  if (name !== current.name) {
    db.prepare('UPDATE products SET category = ? WHERE category_id = ?').run(name, req.params.id);
  }

  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  return res.json(formatCategory(row));
});

router.delete('/categories/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  return res.json({ success: true });
});

router.get('/brands', (_req, res) => {
  const rows = db.prepare('SELECT * FROM brands ORDER BY name ASC').all();
  return res.json(rows.map(formatBrand));
});

router.post('/brands', requireAdmin, (req, res) => {
  const errors = validateBrandPayload(req.body);
  if (errors.length > 0) return res.status(400).json({ error: errors.join('. ') });

  const { name } = req.body || {};
  const result = db.prepare('INSERT INTO brands (name, active) VALUES (?, 1)').run(name.trim());
  const row = db.prepare('SELECT * FROM brands WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(formatBrand(row));
});

router.put('/brands/:id', requireAdmin, (req, res) => {
  const errors = validateBrandPayload(req.body, { partial: true });
  if (errors.length > 0) return res.status(400).json({ error: errors.join('. ') });

  const current = db.prepare('SELECT * FROM brands WHERE id = ?').get(req.params.id);
  if (!current) return res.status(404).json({ error: 'Marca no encontrada' });

  const name = req.body?.name ?? current.name;
  const active = req.body?.isActive ?? req.body?.active;
  db.prepare('UPDATE brands SET name = ?, active = ? WHERE id = ?').run(
    name,
    active === undefined ? current.active : active ? 1 : 0,
    req.params.id
  );

  if (name !== current.name) {
    db.prepare('UPDATE products SET brand = ? WHERE brand_id = ?').run(name, req.params.id);
  }

  const row = db.prepare('SELECT * FROM brands WHERE id = ?').get(req.params.id);
  return res.json(formatBrand(row));
});

router.delete('/brands/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM brands WHERE id = ?').run(req.params.id);
  return res.json({ success: true });
});

export default router;
