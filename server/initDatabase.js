import db, { ensureSchema } from './db.js';
import { categories, brands, products, mockInquiries } from '../src/data/products.js';

function seedCategories() {
  const insertCategory = db.prepare(`
    INSERT INTO categories (name, slug, icon, color)
    VALUES (@name, @slug, @icon, @color)
    ON CONFLICT(slug) DO UPDATE SET
      name = excluded.name,
      icon = excluded.icon,
      color = excluded.color
  `);

  for (const category of categories) {
    insertCategory.run({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      color: category.color,
    });
  }
}

function seedBrands() {
  const insertBrand = db.prepare(`
    INSERT INTO brands (name, active)
    VALUES (@name, @active)
    ON CONFLICT(name) DO UPDATE SET
      active = excluded.active
  `);

  for (const brand of brands) {
    insertBrand.run({
      name: brand.name,
      active: brand.isActive ? 1 : 0,
    });
  }
}

function seedProducts() {
  const categoryRows = db.prepare('SELECT id, name FROM categories').all();
  const brandRows = db.prepare('SELECT id, name FROM brands').all();

  const categoryMap = new Map(categoryRows.map((row) => [row.name, row.id]));
  const brandMap = new Map(brandRows.map((row) => [row.name, row.id]));

  const insertProduct = db.prepare(`
    INSERT INTO products (
      name, description, price, stock, category, brand, image_url, featured, active,
      category_id, brand_id, specs, images, sku, badge, stock_status
    ) VALUES (
      @name, @description, @price, @stock, @category, @brand, @image_url, @featured, @active,
      @category_id, @brand_id, @specs, @images, @sku, @badge, @stock_status
    )
  `);

  const count = db.prepare('SELECT COUNT(*) AS count FROM products').get();
  if (count.count > 0) return;

  for (const product of products) {
    insertProduct.run({
      name: product.name,
      description: product.description || '',
      price: product.price || 0,
      stock: product.stock || 0,
      category: product.category || '',
      brand: product.brand || '',
      image_url: product.image || product.image_url || '',
      featured: product.isFeatured ? 1 : 0,
      active: product.isActive !== false ? 1 : 0,
      category_id: categoryMap.get(product.category) || product.categoryId || null,
      brand_id: brandMap.get(product.brand) || product.brandId || null,
      specs: JSON.stringify(product.specs || {}),
      images: JSON.stringify(product.images || []),
      sku: product.sku || '',
      badge: product.badge || null,
      stock_status: product.stockStatus || 'in_stock',
    });
  }
}

function seedContacts() {
  const count = db.prepare('SELECT COUNT(*) AS count FROM contacts').get();
  if (count.count > 0) return;

  const insertContact = db.prepare(`
    INSERT INTO contacts (
      name, email, phone, message, created_at, subject, product_id, product_name, status, source
    ) VALUES (
      @name, @email, @phone, @message, @created_at, @subject, @product_id, @product_name, @status, @source
    )
  `);

  for (const inquiry of mockInquiries) {
    insertContact.run({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone || '',
      message: inquiry.message,
      created_at: inquiry.date ? `${inquiry.date} 00:00:00` : new Date().toISOString(),
      subject: inquiry.subject || 'Consulta de productos',
      product_id: inquiry.productId || null,
      product_name: inquiry.productName || 'Consulta general',
      status: inquiry.status || 'pending',
      source: inquiry.source || 'contact_form',
    });
  }
}

export function initDatabase() {
  ensureSchema();

  const transaction = db.transaction(() => {
    seedCategories();
    seedBrands();
    seedProducts();
    seedContacts();
  });

  transaction();
  return db;
}

const isMain = process.argv[1]?.endsWith('initDatabase.js');

if (isMain) {
  initDatabase();
  console.log('SQLite database initialized at server/database.db');
}
