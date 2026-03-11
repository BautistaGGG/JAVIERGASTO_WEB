import test from 'node:test';
import assert from 'node:assert/strict';
import { categories, brands, products, mockInquiries } from '../src/data/products.js';

test('mock data base tiene contenido suficiente para la UI pública', () => {
  assert.ok(categories.length > 0);
  assert.ok(brands.length > 0);
  assert.ok(products.length > 0);
  assert.ok(mockInquiries.length > 0);
});

test('cada producto mock tiene los campos mínimos esperados por la UI', () => {
  for (const product of products) {
    assert.equal(typeof product.id, 'number');
    assert.equal(typeof product.name, 'string');
    assert.equal(typeof product.price, 'number');
    assert.equal(typeof product.category, 'string');
    assert.equal(typeof product.brand, 'string');
    assert.equal(typeof product.image, 'string');
    assert.equal(Array.isArray(product.images), true);
    assert.equal(typeof product.isActive, 'boolean');
  }
});
