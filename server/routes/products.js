import { Router } from 'express';
import db, { formatProduct } from '../db.js';
import { requireAdmin } from '../auth.js';
import { validateProductPayload } from '../validators.js';

const router = Router();

const PRODUCT_COLUMNS = [
  'name', 'description', 'price', 'stock', 'category', 'brand', 'image_url', 'featured', 'active',
  'category_id', 'brand_id', 'specs', 'images', 'sku', 'badge', 'stock_status',
];

const createSlug = (value = '') =>
  value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

function camelCase(value) {
  return value.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

function ensureCategory(name, fallbackId) {
  if (fallbackId) return fallbackId;
  if (!name) return null;

  const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
  if (existing) return existing.id;

  const result = db.prepare(`
    INSERT INTO categories (name, slug, icon, color)
    VALUES (?, ?, ?, ?)
  `).run(name, createSlug(name), '??', 'from-slate-500 to-slate-700');

  return Number(result.lastInsertRowid);
}

function ensureBrand(name, fallbackId) {
  if (fallbackId) return fallbackId;
  if (!name) return null;

  const existing = db.prepare('SELECT id FROM brands WHERE name = ?').get(name);
  if (existing) return existing.id;

  const result = db.prepare('INSERT INTO brands (name, active) VALUES (?, 1)').run(name);
  return Number(result.lastInsertRowid);
}

function normalizeProductInput(input = {}) {
  const categoryId = ensureCategory(input.category, input.categoryId);
  const brandId = ensureBrand(input.brand, input.brandId);

  return {
    name: input.name || '',
    description: input.description || '',
    price: Number(input.price || 0),
    stock: Number(input.stock || 0),
    category: input.category || '',
    brand: input.brand || '',
    image_url: input.image_url || input.image || '',
    featured: input.featured !== undefined ? (input.featured ? 1 : 0) : input.isFeatured ? 1 : 0,
    active: input.active !== undefined ? (input.active ? 1 : 0) : input.isActive !== false ? 1 : 0,
    category_id: categoryId,
    brand_id: brandId,
    specs: JSON.stringify(input.specs || {}),
    images: JSON.stringify(input.images || []),
    sku: input.sku || '',
    badge: input.badge || null,
    stock_status: input.stock_status || input.stockStatus || 'in_stock',
  };
}

router.get('/', (req, res) => {
  try {
    const { all, featured, category, brand, search } = req.query;
    const conditions = [];
    const params = [];
    let sql = 'SELECT * FROM products';

    if (all !== 'true') conditions.push('active = 1');
    if (featured === 'true') conditions.push('featured = 1');

    if (category) {
      if (/^\d+$/.test(String(category))) {
        conditions.push('category_id = ?');
        params.push(Number(category));
      } else {
        conditions.push('category = ?');
        params.push(String(category));
      }
    }

    if (brand) {
      if (/^\d+$/.test(String(brand))) {
        conditions.push('brand_id = ?');
        params.push(Number(brand));
      } else {
        conditions.push('brand = ?');
        params.push(String(brand));
      }
    }

    if (search) {
      const term = `%${String(search).trim()}%`;
      conditions.push('(name LIKE ? OR description LIKE ? OR category LIKE ? OR brand LIKE ? OR sku LIKE ?)');
      params.push(term, term, term, term, term);
    }

    if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
    sql += ' ORDER BY created_at DESC, id DESC';

    const rows = db.prepare(sql).all(...params);
    return res.json(rows.map(formatProduct));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
  return res.json(formatProduct(row));
});

router.post('/', requireAdmin, (req, res) => {
  const errors = validateProductPayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('. ') });
  }

  try {
    const payload = normalizeProductInput(req.body);
    const placeholders = PRODUCT_COLUMNS.map((column) => `@${column}`).join(', ');
    const result = db.prepare(`
      INSERT INTO products (${PRODUCT_COLUMNS.join(', ')})
      VALUES (${placeholders})
    `).run(payload);

    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(formatProduct(row));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:id', requireAdmin, (req, res) => {
  const errors = validateProductPayload(req.body, { partial: true });
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('. ') });
  }

  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

    const normalized = normalizeProductInput({ ...formatProduct(existing), ...req.body });
    const updates = [];
    const values = [];

    for (const column of PRODUCT_COLUMNS) {
      const provided = Object.prototype.hasOwnProperty.call(req.body, column) ||
        Object.prototype.hasOwnProperty.call(req.body, camelCase(column)) ||
        (column === 'image_url' && Object.prototype.hasOwnProperty.call(req.body, 'image')) ||
        (column === 'featured' && Object.prototype.hasOwnProperty.call(req.body, 'isFeatured')) ||
        (column === 'active' && Object.prototype.hasOwnProperty.call(req.body, 'isActive')) ||
        (column === 'stock_status' && Object.prototype.hasOwnProperty.call(req.body, 'stockStatus'));

      if (provided) {
        updates.push(`${column} = ?`);
        values.push(normalized[column]);
      }
    }

    if (!updates.length) return res.status(400).json({ error: 'No hay campos para actualizar' });

    values.push(req.params.id);
    db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    return res.json(formatProduct(row));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  return res.json({ success: true });
});

export default router;
