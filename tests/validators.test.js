import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAdminLogin,
  validateProductPayload,
  validateContactPayload,
  validateInquiryStatus,
  validateCategoryPayload,
  validateBrandPayload,
} from '../server/validators.js';

test('validateAdminLogin exige usuario y contraseña', () => {
  assert.deepEqual(validateAdminLogin({}), ['El usuario es obligatorio', 'La contraseña es obligatoria']);
  assert.deepEqual(validateAdminLogin({ email: 'admin@test.com', password: '1234' }), []);
});

test('validateProductPayload valida campos mínimos del producto', () => {
  const invalid = validateProductPayload({ name: '', price: -1, stock: -5, stockStatus: 'otro' });
  assert.equal(invalid.length, 4);

  const valid = validateProductPayload({ name: 'Producto', price: 100, stock: 4, stockStatus: 'in_stock' });
  assert.deepEqual(valid, []);
});

test('validateContactPayload valida nombre, email y mensaje', () => {
  assert.equal(validateContactPayload({}).length >= 3, true);
  assert.deepEqual(validateContactPayload({
    name: 'Juan Pérez',
    email: 'juan@empresa.com',
    phone: '+54 11 1234 5678',
    message: 'Necesito cotización por 10 unidades',
  }), []);
});

test('validateInquiryStatus solo acepta estados permitidos', () => {
  assert.deepEqual(validateInquiryStatus('pending'), []);
  assert.deepEqual(validateInquiryStatus('replied'), []);
  assert.equal(validateInquiryStatus('closed').length, 1);
});

test('validateCategoryPayload y validateBrandPayload exigen nombre', () => {
  assert.equal(validateCategoryPayload({}).length, 1);
  assert.equal(validateBrandPayload({}).length, 1);
  assert.deepEqual(validateCategoryPayload({ name: 'Herramientas' }), []);
  assert.deepEqual(validateBrandPayload({ name: 'Bosch' }), []);
});
