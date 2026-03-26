import { Router } from 'express';
import db, { formatBrand, formatCategory } from '../db.js';
import { requireAdmin } from '../auth.js';
import { handleUnexpectedError, sendError } from '../http.js';
import { logInfo } from '../logger.js';
import { validateBrandPayload, validateCategoryPayload } from '../validators.js';
import { addAuditEvent } from '../auditLog.js';

const router = Router();

const createSlug = (value = '') =>
  value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

router.get('/categories', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    return res.json(rows.map(formatCategory));
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'categories_list');
  }
});

router.post('/categories', requireAdmin, (req, res) => {
  const errors = validateCategoryPayload(req.body);
  if (errors.length > 0) return sendError(res, req, 400, 'VALIDATION_ERROR', errors.join('. '));

  const { name, icon, color } = req.body || {};

  try {
    const result = db.prepare(`
      INSERT INTO categories (name, slug, icon, color)
      VALUES (?, ?, ?, ?)
    `).run(name.trim(), createSlug(name), icon || '??', color || 'from-slate-500 to-slate-700');

    const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    logInfo('admin_category_create', { requestId: req.requestId, user: req.user?.email, categoryId: row?.id });
    addAuditEvent({
      actor: req.user?.email,
      action: 'category.create',
      entity: 'category',
      entityId: row?.id,
      detail: `Categoría creada: ${row?.name || row?.id}`,
      requestId: req.requestId,
    });
    return res.status(201).json(formatCategory(row));
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'categories_create');
  }
});

router.put('/categories/:id', requireAdmin, (req, res) => {
  const errors = validateCategoryPayload(req.body, { partial: true });
  if (errors.length > 0) return sendError(res, req, 400, 'VALIDATION_ERROR', errors.join('. '));

  const current = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!current) return sendError(res, req, 404, 'NOT_FOUND', 'Categoria no encontrada');

  const name = req.body?.name ?? current.name;
  const icon = req.body?.icon ?? current.icon;
  const color = req.body?.color ?? current.color;
  const slug = createSlug(name);

  try {
    db.prepare(`
      UPDATE categories
      SET name = ?, slug = ?, icon = ?, color = ?
      WHERE id = ?
    `).run(name, slug, icon, color, req.params.id);

    if (name !== current.name) {
      db.prepare('UPDATE products SET category = ? WHERE category_id = ?').run(name, req.params.id);
    }

    const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    logInfo('admin_category_update', { requestId: req.requestId, user: req.user?.email, categoryId: row?.id });
    addAuditEvent({
      actor: req.user?.email,
      action: 'category.update',
      entity: 'category',
      entityId: row?.id,
      detail: `Categoría actualizada: ${row?.name || row?.id}`,
      requestId: req.requestId,
    });
    return res.json(formatCategory(row));
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'categories_update');
  }
});

router.delete('/categories/:id', requireAdmin, (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    const current = db.prepare('SELECT id, name FROM categories WHERE id = ?').get(categoryId);
    if (!current) return sendError(res, req, 404, 'NOT_FOUND', 'Categoria no encontrada');

    const totalCategories = db.prepare('SELECT COUNT(*) AS total FROM categories').get()?.total || 0;
    if (totalCategories <= 1) {
      return sendError(res, req, 409, 'CATEGORY_LAST_ONE', 'No podes eliminar la ultima categoria');
    }

    const fallback = db.prepare('SELECT id, name FROM categories WHERE id != ? ORDER BY id ASC LIMIT 1').get(categoryId);
    if (!fallback) {
      return sendError(res, req, 409, 'CATEGORY_NO_FALLBACK', 'No se encontro una categoria de reemplazo');
    }

    const updated = db.prepare(`
      UPDATE products
      SET category_id = ?, category = ?
      WHERE category_id = ?
    `).run(fallback.id, fallback.name, categoryId);

    db.prepare('DELETE FROM categories WHERE id = ?').run(categoryId);
    logInfo('admin_category_delete', { requestId: req.requestId, user: req.user?.email, categoryId: Number(req.params.id) });
    addAuditEvent({
      actor: req.user?.email,
      action: 'category.delete',
      entity: 'category',
      entityId: Number(req.params.id),
      detail: `Categoría eliminada: ${req.params.id}. Productos reasignados a ${fallback.name}: ${updated?.changes || 0}`,
      requestId: req.requestId,
    });
    return res.json({
      success: true,
      reassignedTo: formatCategory(db.prepare('SELECT * FROM categories WHERE id = ?').get(fallback.id)),
      reassignedProducts: updated?.changes || 0,
    });
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'categories_delete');
  }
});

router.get('/brands', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM brands ORDER BY name ASC').all();
    return res.json(rows.map(formatBrand));
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'brands_list');
  }
});

router.post('/brands', requireAdmin, (req, res) => {
  const errors = validateBrandPayload(req.body);
  if (errors.length > 0) return sendError(res, req, 400, 'VALIDATION_ERROR', errors.join('. '));

  const { name } = req.body || {};

  try {
    const result = db.prepare('INSERT INTO brands (name, active) VALUES (?, 1)').run(name.trim());
    const row = db.prepare('SELECT * FROM brands WHERE id = ?').get(result.lastInsertRowid);
    logInfo('admin_brand_create', { requestId: req.requestId, user: req.user?.email, brandId: row?.id });
    addAuditEvent({
      actor: req.user?.email,
      action: 'brand.create',
      entity: 'brand',
      entityId: row?.id,
      detail: `Marca creada: ${row?.name || row?.id}`,
      requestId: req.requestId,
    });
    return res.status(201).json(formatBrand(row));
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'brands_create');
  }
});

router.put('/brands/:id', requireAdmin, (req, res) => {
  const errors = validateBrandPayload(req.body, { partial: true });
  if (errors.length > 0) return sendError(res, req, 400, 'VALIDATION_ERROR', errors.join('. '));

  const current = db.prepare('SELECT * FROM brands WHERE id = ?').get(req.params.id);
  if (!current) return sendError(res, req, 404, 'NOT_FOUND', 'Marca no encontrada');

  const name = req.body?.name ?? current.name;
  const active = req.body?.isActive ?? req.body?.active;

  try {
    db.prepare('UPDATE brands SET name = ?, active = ? WHERE id = ?').run(
      name,
      active === undefined ? current.active : active ? 1 : 0,
      req.params.id
    );

    if (name !== current.name) {
      db.prepare('UPDATE products SET brand = ? WHERE brand_id = ?').run(name, req.params.id);
    }

    const row = db.prepare('SELECT * FROM brands WHERE id = ?').get(req.params.id);
    logInfo('admin_brand_update', { requestId: req.requestId, user: req.user?.email, brandId: row?.id });
    addAuditEvent({
      actor: req.user?.email,
      action: 'brand.update',
      entity: 'brand',
      entityId: row?.id,
      detail: `Marca actualizada: ${row?.name || row?.id}`,
      requestId: req.requestId,
    });
    return res.json(formatBrand(row));
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'brands_update');
  }
});

router.delete('/brands/:id', requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM brands WHERE id = ?').run(req.params.id);
    logInfo('admin_brand_delete', { requestId: req.requestId, user: req.user?.email, brandId: Number(req.params.id) });
    addAuditEvent({
      actor: req.user?.email,
      action: 'brand.delete',
      entity: 'brand',
      entityId: Number(req.params.id),
      detail: `Marca eliminada: ${req.params.id}`,
      requestId: req.requestId,
    });
    return res.json({ success: true });
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'brands_delete');
  }
});

export default router;
