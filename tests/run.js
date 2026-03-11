import assert from 'node:assert/strict';
import {
  validateAdminLogin,
  validateProductPayload,
  validateContactPayload,
  validateInquiryStatus,
  validateCategoryPayload,
  validateBrandPayload,
} from '../server/validators.js';
import { categories, brands, products, mockInquiries } from '../src/data/products.js';
import {
  buildCartQuoteWhatsAppMessage,
  buildGeneralWhatsAppMessage,
  buildProductInquiryWhatsAppMessage,
  generateWhatsAppLink,
} from '../src/services/productService.js';

const tests = [
  {
    name: 'validateAdminLogin exige usuario y contraseña',
    run() {
      const errors = validateAdminLogin({});
      assert.equal(errors.length, 2);
      assert.ok(errors[0].toLowerCase().includes('usuario'));
      assert.ok(errors[1].toLowerCase().includes('contras'));
      assert.deepEqual(validateAdminLogin({ email: 'admin@test.com', password: '1234' }), []);
    },
  },
  {
    name: 'validateProductPayload valida los campos mínimos',
    run() {
      assert.equal(validateProductPayload({ name: '', price: -1, stock: -5, stockStatus: 'otro' }).length, 4);
      assert.deepEqual(validateProductPayload({ name: 'Producto', price: 100, stock: 4, stockStatus: 'in_stock' }), []);
    },
  },
  {
    name: 'validateContactPayload valida nombre, email y mensaje',
    run() {
      assert.equal(validateContactPayload({}).length >= 3, true);
      assert.deepEqual(validateContactPayload({
        name: 'Juan Pérez',
        email: 'juan@empresa.com',
        phone: '+54 11 1234 5678',
        message: 'Necesito cotización por 10 unidades',
      }), []);
    },
  },
  {
    name: 'validateInquiryStatus restringe estados',
    run() {
      assert.deepEqual(validateInquiryStatus('pending'), []);
      assert.deepEqual(validateInquiryStatus('replied'), []);
      assert.equal(validateInquiryStatus('closed').length, 1);
    },
  },
  {
    name: 'category y brand payload exigen nombre',
    run() {
      assert.equal(validateCategoryPayload({}).length, 1);
      assert.equal(validateBrandPayload({}).length, 1);
      assert.deepEqual(validateCategoryPayload({ name: 'Herramientas' }), []);
      assert.deepEqual(validateBrandPayload({ name: 'Bosch' }), []);
    },
  },
  {
    name: 'mock data pública tiene contenido mínimo',
    run() {
      assert.ok(categories.length > 0);
      assert.ok(brands.length > 0);
      assert.ok(products.length > 0);
      assert.ok(mockInquiries.length > 0);
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
    },
  },
  {
    name: 'whatsapp genera link encodeado',
    run() {
      const url = generateWhatsAppLink('541112345678', 'Hola mundo');
      assert.equal(url, 'https://wa.me/541112345678?text=Hola%20mundo');
    },
  },
  {
    name: 'whatsapp plantilla general cambia por contexto',
    run() {
      assert.equal(buildGeneralWhatsAppMessage(), 'Hola, quiero consultar sobre sus productos industriales. ¿Podrían asesorarme?');
      assert.equal(buildGeneralWhatsAppMessage('catalog_help'), 'Hola, necesito ayuda para encontrar un producto en su catálogo.');
    },
  },
  {
    name: 'whatsapp plantilla de producto incluye campos clave',
    run() {
      const msg = buildProductInquiryWhatsAppMessage({
        name: 'Taladro',
        sku: 'SKU-123',
        priceText: '$ 10.000',
        quantity: 2,
      });
      assert.ok(msg.includes('*Taladro*'));
      assert.ok(msg.includes('SKU: SKU-123'));
      assert.ok(msg.includes('Cantidad: 2'));
    },
  },
  {
    name: 'whatsapp plantilla de cotización incluye total',
    run() {
      const msg = buildCartQuoteWhatsAppMessage({
        items: [
          { name: 'Producto A', quantity: 2, price: 100 },
          { name: 'Producto B', quantity: 1, price: 50 },
        ],
        formatPrice: (value) => `$${value}`,
      });
      assert.ok(msg.includes('Producto A x2'));
      assert.ok(msg.includes('Producto B x1'));
      assert.ok(msg.includes('Total estimado: $250'));
    },
  },
];

let failed = 0;
for (const test of tests) {
  try {
    test.run();
    console.log(`PASS ${test.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${test.name}`);
    console.error(error.stack || error.message);
  }
}

if (failed > 0) {
  console.error(`\n${failed} test(s) failed.`);
  process.exit(1);
}

console.log(`\n${tests.length} test(s) passed.`);

