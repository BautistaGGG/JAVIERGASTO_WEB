import { Router } from 'express';
import db, { formatProduct } from '../db.js';
import { requireAdmin } from '../auth.js';
import { handleUnexpectedError, sendError } from '../http.js';
import { logInfo } from '../logger.js';
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

function getCategoryById(categoryId) {
  if (!categoryId) return null;
  return db.prepare('SELECT id, name FROM categories WHERE id = ?').get(categoryId) || null;
}

function getBrandById(brandId) {
  if (!brandId) return null;
  return db.prepare('SELECT id, name FROM brands WHERE id = ?').get(brandId) || null;
}

function validateProductRelations(input = {}, { existingId = null } = {}) {
  const errors = [];

  if (input.categoryId !== undefined && input.categoryId !== null && input.categoryId !== '') {
    const category = getCategoryById(Number(input.categoryId));
    if (!category) {
      errors.push('La categoría seleccionada no existe');
    } else if (input.category && String(input.category).trim() && String(input.category).trim() !== category.name) {
      errors.push('El nombre de categoría no coincide con la categoría seleccionada');
    }
  }

  if (input.brandId !== undefined && input.brandId !== null && input.brandId !== '') {
    const brand = getBrandById(Number(input.brandId));
    if (!brand) {
      errors.push('La marca seleccionada no existe');
    } else if (input.brand && String(input.brand).trim() && String(input.brand).trim() !== brand.name) {
      errors.push('El nombre de marca no coincide con la marca seleccionada');
    }
  }

  if (input.sku !== undefined) {
    const sku = String(input.sku || '').trim();
    if (sku) {
      const duplicate = db
        .prepare('SELECT id FROM products WHERE sku = ? AND (? IS NULL OR id <> ?)')
        .get(sku, existingId, existingId);
      if (duplicate) errors.push('El SKU ya existe en otro producto');
    }
  }

  return errors;
}

function normalizeProductInput(input = {}) {
  const resolvedCategoryId = input.categoryId ? Number(input.categoryId) : null;
  const resolvedBrandId = input.brandId ? Number(input.brandId) : null;
  const existingCategory = getCategoryById(resolvedCategoryId);
  const existingBrand = getBrandById(resolvedBrandId);

  const categoryId = ensureCategory(input.category || existingCategory?.name, resolvedCategoryId);
  const brandId = ensureBrand(input.brand || existingBrand?.name, resolvedBrandId);

  return {
    name: input.name || '',
    description: input.description || '',
    price: Number(input.price || 0),
    stock: Number(input.stock || 0),
    category: input.category || existingCategory?.name || '',
    brand: input.brand || existingBrand?.name || '',
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
    return handleUnexpectedError(error, req, res, 'products_list');
  }
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return sendError(res, req, 404, 'NOT_FOUND', 'Producto no encontrado');
  return res.json(formatProduct(row));
});

router.post('/', requireAdmin, (req, res) => {
  const errors = validateProductPayload(req.body);
  if (errors.length > 0) {
    return sendError(res, req, 400, 'VALIDATION_ERROR', errors.join('. '));
  }

  const relationErrors = validateProductRelations(req.body);
  if (relationErrors.length > 0) {
    return sendError(res, req, 400, 'VALIDATION_ERROR', relationErrors.join('. '));
  }

  try {
    const payload = normalizeProductInput(req.body);
    const placeholders = PRODUCT_COLUMNS.map((column) => `@${column}`).join(', ');
    const result = db.prepare(`
      INSERT INTO products (${PRODUCT_COLUMNS.join(', ')})
      VALUES (${placeholders})
    `).run(payload);

    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    logInfo('admin_product_create', {
      requestId: req.requestId,
      user: req.user?.email,
      productId: row?.id,
    });
    return res.status(201).json(formatProduct(row));
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'products_create');
  }
});

router.put('/:id', requireAdmin, (req, res) => {
  const errors = validateProductPayload(req.body, { partial: true });
  if (errors.length > 0) {
    return sendError(res, req, 400, 'VALIDATION_ERROR', errors.join('. '));
  }

  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return sendError(res, req, 404, 'NOT_FOUND', 'Producto no encontrado');

    const relationErrors = validateProductRelations(
      { ...formatProduct(existing), ...req.body },
      { existingId: Number(req.params.id) }
    );
    if (relationErrors.length > 0) {
      return sendError(res, req, 400, 'VALIDATION_ERROR', relationErrors.join('. '));
    }

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

    if (!updates.length) return sendError(res, req, 400, 'VALIDATION_ERROR', 'No hay campos para actualizar');

    values.push(req.params.id);
    db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    logInfo('admin_product_update', {
      requestId: req.requestId,
      user: req.user?.email,
      productId: row?.id,
      updatedFields: updates.map((item) => item.split(' = ')[0]),
    });
    return res.json(formatProduct(row));
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'products_update');
  }
});

router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return sendError(res, req, 404, 'NOT_FOUND', 'Producto no encontrado');

    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    logInfo('admin_product_delete', {
      requestId: req.requestId,
      user: req.user?.email,
      productId: Number(req.params.id),
    });
    return res.json({ success: true });
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'products_delete');
  }
});

export default router;
