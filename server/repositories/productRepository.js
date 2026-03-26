import db, { formatProduct } from '../db.js';

export function listProducts({ all, featured, category, brand, search } = {}) {
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
  return rows.map(formatProduct);
}

export function getProductById(id) {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  return formatProduct(row);
}
