import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const safeJsonParse = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export function ensureSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      icon TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      category TEXT,
      brand TEXT,
      image_url TEXT,
      featured BOOLEAN DEFAULT 0,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      category_id INTEGER,
      brand_id INTEGER,
      specs TEXT DEFAULT '{}',
      images TEXT DEFAULT '[]',
      sku TEXT,
      badge TEXT,
      stock_status TEXT DEFAULT 'in_stock',
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      subject TEXT,
      product_id INTEGER,
      product_name TEXT,
      status TEXT DEFAULT 'pending',
      source TEXT DEFAULT 'contact_form'
    );

    CREATE TABLE IF NOT EXISTS admin_revoked_tokens (
      token_hash TEXT PRIMARY KEY,
      expires_at DATETIME NOT NULL,
      revoked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku_unique
      ON products(sku)
      WHERE sku IS NOT NULL AND TRIM(sku) <> '';
  `);

  const productColumns = db.prepare('PRAGMA table_info(products)').all();
  const hasShowPrice = productColumns.some((column) => column.name === 'show_price');
  if (!hasShowPrice) {
    db.exec('ALTER TABLE products ADD COLUMN show_price BOOLEAN DEFAULT 1');
  }
}

export function formatProduct(row) {
  if (!row) return null;
  const specs = safeJsonParse(row.specs, {});
  const adminMeta = specs && typeof specs.__admin === 'object' ? specs.__admin : {};
  const publishStatus = ['draft', 'published', 'archived'].includes(adminMeta.publishStatus)
    ? adminMeta.publishStatus
    : (Boolean(row.active) ? 'published' : 'draft');
  const version = Number(adminMeta.version || 1);
  const versions = Array.isArray(adminMeta.versions) ? adminMeta.versions : [];

  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    price: Number(row.price || 0),
    stock: Number(row.stock || 0),
    category: row.category || '',
    brand: row.brand || '',
    image_url: row.image_url || '',
    image: row.image_url || '',
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    created_at: row.created_at,
    categoryId: row.category_id ?? null,
    brandId: row.brand_id ?? null,
    specs,
    images: safeJsonParse(row.images, []),
    sku: row.sku || '',
    badge: row.badge || null,
    stockStatus: row.stock_status || 'in_stock',
    showPrice: row.show_price !== 0,
    isFeatured: Boolean(row.featured),
    isActive: Boolean(row.active),
    publishStatus,
    version,
    versionCount: versions.length,
    lastUpdatedAt: adminMeta.updatedAt || row.created_at,
    lastUpdatedBy: adminMeta.updatedBy || null,
  };
}

export function formatCategory(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon || '??',
    color: row.color || 'from-slate-500 to-slate-700',
  };
}

export function formatBrand(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    active: Boolean(row.active),
    isActive: Boolean(row.active),
  };
}

export function formatContact(row) {
  if (!row) return null;
  const date = row.created_at ? String(row.created_at).split(' ')[0] : null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    message: row.message,
    created_at: row.created_at,
    createdAt: row.created_at,
    date,
    subject: row.subject || '',
    productId: row.product_id ?? null,
    productName: row.product_name || 'Consulta general',
    status: row.status || 'pending',
    source: row.source || 'contact_form',
  };
}

export default db;
