import { Router } from 'express';
import db, { formatProduct } from '../db.js';
import { requireAdmin } from '../auth.js';
import { handleUnexpectedError, sendError } from '../http.js';
import { logInfo } from '../logger.js';
import { validateProductPayload } from '../validators.js';
import { addAuditEvent } from '../auditLog.js';
import { getProductById, listProducts } from '../repositories/productRepository.js';

const router = Router();

const PRODUCT_COLUMNS = [
  'name', 'description', 'price', 'stock', 'category', 'brand', 'image_url', 'featured', 'active',
  'category_id', 'brand_id', 'specs', 'images', 'sku', 'badge', 'stock_status', 'show_price',
];
const MAX_VERSION_HISTORY = 20;

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
    show_price: input.show_price !== undefined
      ? (input.show_price ? 1 : 0)
      : (input.showPrice !== undefined ? (input.showPrice ? 1 : 0) : 1),
  };
}

function extractAdminMeta(specs) {
  const source = specs && typeof specs === 'object' ? specs : {};
  const meta = source.__admin && typeof source.__admin === 'object' ? source.__admin : {};
  return {
    publishStatus: ['draft', 'published', 'archived'].includes(meta.publishStatus) ? meta.publishStatus : null,
    version: Number(meta.version || 1),
    versions: Array.isArray(meta.versions) ? meta.versions : [],
    updatedAt: meta.updatedAt || null,
    updatedBy: meta.updatedBy || null,
  };
}

function stripAdminSpec(specs) {
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return {};
  const clone = { ...specs };
  delete clone.__admin;
  return clone;
}

function withAdminSpec(specs, adminMeta) {
  return {
    ...stripAdminSpec(specs),
    __admin: {
      publishStatus: adminMeta.publishStatus,
      version: Number(adminMeta.version || 1),
      versions: Array.isArray(adminMeta.versions) ? adminMeta.versions.slice(0, MAX_VERSION_HISTORY) : [],
      updatedAt: adminMeta.updatedAt || new Date().toISOString(),
      updatedBy: adminMeta.updatedBy || null,
    },
  };
}

function resolvePublishStatus(payload = {}, fallbackStatus = 'published') {
  const candidate = payload.publishStatus || payload.status;
  if (candidate === 'draft' || candidate === 'published' || candidate === 'archived') return candidate;
  return fallbackStatus;
}

function buildVersionSnapshot(product, reason = 'update') {
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    category: product.category || '',
    brand: product.brand || '',
    image: product.image || product.image_url || '',
    categoryId: product.categoryId ?? null,
    brandId: product.brandId ?? null,
    sku: product.sku || '',
    badge: product.badge || null,
    stockStatus: product.stockStatus || 'in_stock',
    showPrice: product.showPrice !== false,
    isFeatured: Boolean(product.isFeatured ?? product.featured),
    isActive: Boolean(product.isActive ?? product.active),
    publishStatus: product.publishStatus || (Boolean(product.isActive ?? product.active) ? 'published' : 'draft'),
    specs: stripAdminSpec(product.specs),
    images: Array.isArray(product.images) ? product.images : [],
    savedAt: new Date().toISOString(),
    reason,
  };
}

function buildManagedPayload(inputPayload, existingProduct, actor, reason = 'update') {
  const existingMeta = extractAdminMeta(existingProduct?.specs);
  const fallbackStatus = existingMeta.publishStatus || (existingProduct?.isActive ? 'published' : 'draft');
  const merged = existingProduct ? { ...existingProduct, ...inputPayload } : { ...inputPayload };
  const publishStatus = resolvePublishStatus(inputPayload, fallbackStatus);
  merged.publishStatus = publishStatus;
  merged.isActive = publishStatus === 'published';
  merged.active = publishStatus === 'published';

  const nextVersions = [...existingMeta.versions];
  if (existingProduct) {
    nextVersions.unshift(buildVersionSnapshot(existingProduct, reason));
  }

  const nextMeta = {
    publishStatus,
    version: existingProduct ? Number(existingMeta.version || 1) + 1 : 1,
    versions: nextVersions.slice(0, MAX_VERSION_HISTORY),
    updatedAt: new Date().toISOString(),
    updatedBy: actor || null,
  };

  merged.specs = withAdminSpec(merged.specs || {}, nextMeta);
  return merged;
}

router.get('/', (req, res) => {
  try {
    return res.json(listProducts(req.query || {}));
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'products_list');
  }
});

router.get('/:id', (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) return sendError(res, req, 404, 'NOT_FOUND', 'Producto no encontrado');
  return res.json(product);
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
    const managed = buildManagedPayload(req.body, null, req.user?.email || null, 'create');
    const payload = normalizeProductInput(managed);
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
    addAuditEvent({
      actor: req.user?.email,
      action: 'product.create',
      entity: 'product',
      entityId: row?.id,
      detail: `Producto creado: ${row?.name || row?.id}`,
      requestId: req.requestId,
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

    const existingProduct = formatProduct(existing);
    const managed = buildManagedPayload(req.body, existingProduct, req.user?.email || null);

    const relationErrors = validateProductRelations(
      managed,
      { existingId: Number(req.params.id) }
    );
    if (relationErrors.length > 0) {
      return sendError(res, req, 400, 'VALIDATION_ERROR', relationErrors.join('. '));
    }

    const normalized = normalizeProductInput(managed);
    const updates = [];
    const values = [];

    for (const column of PRODUCT_COLUMNS) {
      const provided = Object.prototype.hasOwnProperty.call(req.body, column) ||
        Object.prototype.hasOwnProperty.call(req.body, camelCase(column)) ||
        (column === 'image_url' && Object.prototype.hasOwnProperty.call(req.body, 'image')) ||
        (column === 'featured' && Object.prototype.hasOwnProperty.call(req.body, 'isFeatured')) ||
        (column === 'active' && Object.prototype.hasOwnProperty.call(req.body, 'isActive')) ||
        (column === 'stock_status' && Object.prototype.hasOwnProperty.call(req.body, 'stockStatus')) ||
        (column === 'show_price' && Object.prototype.hasOwnProperty.call(req.body, 'showPrice'));

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
    addAuditEvent({
      actor: req.user?.email,
      action: 'product.update',
      entity: 'product',
      entityId: row?.id,
      detail: `Producto actualizado: ${row?.name || row?.id}`,
      requestId: req.requestId,
    });
    return res.json(formatProduct(row));
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'products_update');
  }
});

router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const existing = db.prepare('SELECT id, name FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return sendError(res, req, 404, 'NOT_FOUND', 'Producto no encontrado');

    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    logInfo('admin_product_delete', {
      requestId: req.requestId,
      user: req.user?.email,
      productId: Number(req.params.id),
    });
    addAuditEvent({
      actor: req.user?.email,
      action: 'product.delete',
      entity: 'product',
      entityId: Number(req.params.id),
      detail: `Producto eliminado: ${existing?.name || req.params.id}`,
      requestId: req.requestId,
    });
    return res.json({ success: true });
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'products_delete');
  }
});

router.post('/:id/restore-previous', requireAdmin, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return sendError(res, req, 404, 'NOT_FOUND', 'Producto no encontrado');

    const existingProduct = formatProduct(existing);
    const existingMeta = extractAdminMeta(existingProduct.specs);
    const [previous, ...rest] = existingMeta.versions;
    if (!previous) return sendError(res, req, 400, 'VALIDATION_ERROR', 'No hay versiones anteriores para restaurar');

    const restored = buildManagedPayload(
      {
        ...previous,
        specs: previous.specs || {},
        images: previous.images || existingProduct.images || [],
        publishStatus: previous.publishStatus || 'draft',
      },
      existingProduct,
      req.user?.email || null,
      'restore_previous'
    );

    const restoredMeta = extractAdminMeta(restored.specs);
    restored.specs = withAdminSpec(restored.specs, { ...restoredMeta, versions: rest });
    const normalized = normalizeProductInput(restored);

    const updateColumns = PRODUCT_COLUMNS.map((column) => `${column} = ?`).join(', ');
    const values = PRODUCT_COLUMNS.map((column) => normalized[column]);
    values.push(req.params.id);
    db.prepare(`UPDATE products SET ${updateColumns} WHERE id = ?`).run(...values);

    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    addAuditEvent({
      actor: req.user?.email,
      action: 'product.restore_previous',
      entity: 'product',
      entityId: row?.id,
      detail: `Producto restaurado a versión anterior: ${row?.name || row?.id}`,
      requestId: req.requestId,
    });
    return res.json(formatProduct(row));
  } catch (error) {
    return handleUnexpectedError(error, req, res, 'products_restore_previous');
  }
});

export default router;
