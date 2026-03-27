import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import {
  validateAdminLogin,
  validateProductPayload,
  validateContactPayload,
  validateInquiryStatus,
  validateCategoryPayload,
  validateBrandPayload,
} from '../server/validators.js';
import { authenticateAdmin, logoutAdmin, requireAdmin } from '../server/auth.js';
import { categories, brands, products, mockInquiries } from '../src/data/products.js';
import {
  buildCartQuoteWhatsAppMessage,
  buildGeneralWhatsAppMessage,
  buildProductInquiryWhatsAppMessage,
  generateWhatsAppLink,
} from '../src/services/productService.js';

const waitForChildExit = async (child, timeoutMs = 5000) =>
  new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const timer = setTimeout(() => {
      try {
        child.kill('SIGKILL');
      } catch {
      }
      finish();
    }, timeoutMs);

    child.once('exit', () => {
      clearTimeout(timer);
      finish();
    });
  });

const tests = [
  {
    name: 'validateAdminLogin exige usuario y contrasena',
    run() {
      const errors = validateAdminLogin({});
      assert.equal(errors.length, 2);
      assert.ok(errors[0].toLowerCase().includes('usuario'));
      assert.ok(errors[1].toLowerCase().includes('contras'));
      assert.deepEqual(validateAdminLogin({ email: 'admin@test.com', password: '1234' }), []);
    },
  },
  {
    name: 'validateProductPayload valida los campos minimos',
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
        name: 'Juan Perez',
        email: 'juan@empresa.com',
        phone: '+54 11 1234 5678',
        message: 'Necesito cotizacion por 10 unidades',
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
    name: 'mock data publica tiene contenido minimo',
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
    name: 'whatsapp plantilla de cotizacion incluye total',
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
  {
    name: 'auth admin emite token y permite acceso a ruta protegida',
    run() {
      const adminUser = process.env.ADMIN_USER || 'admin@industrialpro.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const session = authenticateAdmin(adminUser, adminPassword);
      assert.ok(session?.token);
      assert.equal(session.user.email, adminUser);
      assert.ok(session.expiresAt);

      const req = { headers: { authorization: `Bearer ${session.token}` } };
      let statusCode = 200;
      let payload = null;
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          payload = body;
          return body;
        },
      };
      let nextCalled = false;

      requireAdmin(req, res, () => {
        nextCalled = true;
      });

      assert.equal(statusCode, 200);
      assert.equal(payload, null);
      assert.equal(nextCalled, true);
      assert.equal(req.user.email, adminUser);
    },
  },
  {
    name: 'auth admin revoca token al cerrar sesion',
    run() {
      const adminUser = process.env.ADMIN_USER || 'admin@industrialpro.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const session = authenticateAdmin(adminUser, adminPassword);
      assert.ok(session?.token);
      logoutAdmin(session.token);

      const req = { headers: { authorization: `Bearer ${session.token}` } };
      let statusCode = 200;
      let payload = null;
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          payload = body;
          return body;
        },
      };
      let nextCalled = false;

      requireAdmin(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, false);
      assert.equal(statusCode, 401);
      assert.equal(payload?.error, 'No autorizado');
    },
  },
  {
    name: 'api REST publica y admin cubre flujo critico',
    async run() {
      const adminUser = process.env.ADMIN_USER || 'admin@industrialpro.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const port = '3110';
      const baseUrl = `http://127.0.0.1:${port}/api`;

      const server = spawn('node', ['server/server.js'], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PORT: port,
          CORS_ORIGINS: 'http://localhost:5173',
        },
        stdio: ['ignore', 'ignore', 'ignore'],
      });

      const requestJson = async (path, options = {}) => {
        const response = await fetch(`${baseUrl}${path}`, options);
        const payload = await response.json().catch(() => ({}));
        return { response, payload };
      };

      const waitForServer = async () => {
        for (let attempt = 0; attempt < 80; attempt += 1) {
          try {
            const { response } = await requestJson('/products');
            if (response.ok) return;
          } catch {
          }
          await delay(500);
        }
        throw new Error('server_test_timeout');
      };

      try {
        await waitForServer();

        const productsList = await requestJson('/products');
        assert.equal(productsList.response.status, 200);
        assert.equal(Array.isArray(productsList.payload), true);

        const health = await requestJson('/health');
        assert.equal(health.response.status, 200);
        assert.equal(health.payload.status, 'ok');
        assert.equal(health.payload.db, 'ok');

        const categoriesList = await requestJson('/categories');
        assert.equal(categoriesList.response.status, 200);

        const brandsList = await requestJson('/brands');
        assert.equal(brandsList.response.status, 200);

        const contactCreate = await requestJson('/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test API',
            email: 'testapi@example.com',
            phone: '+54 11 1111 1111',
            message: 'Mensaje de prueba para integracion REST',
            subject: 'Prueba',
          }),
        });
        assert.equal(contactCreate.response.status, 201);

        const login = await requestJson('/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: adminUser, password: adminPassword }),
        });
        assert.equal(login.response.status, 200);
        assert.ok(login.payload.token);

        const authHeaders = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${login.payload.token}`,
        };

        const categoryCreate = await requestJson('/categories', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ name: 'Test Category', icon: 'T', color: 'from-blue-500 to-blue-700' }),
        });
        assert.equal(categoryCreate.response.status, 201);

        const brandCreate = await requestJson('/brands', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ name: 'Test Brand' }),
        });
        assert.equal(brandCreate.response.status, 201);

        const productCreate = await requestJson('/products', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            name: 'Test Product',
            price: 999,
            stock: 3,
            category: 'Test Category',
            categoryId: categoryCreate.payload.id,
            brand: 'Test Brand',
            brandId: brandCreate.payload.id,
            stockStatus: 'in_stock',
          }),
        });
        assert.equal(productCreate.response.status, 201);

        const productUpdate = await requestJson(`/products/${productCreate.payload.id}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ stockStatus: 'low_stock', price: 1200 }),
        });
        assert.equal(productUpdate.response.status, 200);

        const hidePriceUpdate = await requestJson(`/products/${productCreate.payload.id}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ showPrice: false }),
        });
        assert.equal(hidePriceUpdate.response.status, 200);
        assert.equal(hidePriceUpdate.payload.showPrice, false);

        const showPriceUpdate = await requestJson(`/products/${productCreate.payload.id}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ showPrice: true }),
        });
        assert.equal(showPriceUpdate.response.status, 200);
        assert.equal(showPriceUpdate.payload.showPrice, true);

        const contactUpdate = await requestJson(`/contacts/${contactCreate.payload.id}/status`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ status: 'replied' }),
        });
        assert.equal(contactUpdate.response.status, 200);

        const contactsList = await requestJson('/contacts', {
          headers: { Authorization: `Bearer ${login.payload.token}` },
        });
        assert.equal(contactsList.response.status, 200);
        assert.equal(Array.isArray(contactsList.payload.items), true);
        assert.ok(contactsList.payload.pagination);

        const contactsFiltered = await requestJson('/contacts?page=1&pageSize=2&status=replied&search=Test', {
          headers: { Authorization: `Bearer ${login.payload.token}` },
        });
        assert.equal(contactsFiltered.response.status, 200);
        assert.equal(Array.isArray(contactsFiltered.payload.items), true);
        assert.ok(contactsFiltered.payload.pagination.pageSize === 2);

        const metrics = await requestJson('/admin/metrics', {
          headers: { Authorization: `Bearer ${login.payload.token}` },
        });
        assert.equal(metrics.response.status, 200);
        assert.ok(metrics.payload.requests);
        assert.ok(metrics.payload.latency);
        assert.ok(metrics.payload.errors);

        const unknownEndpoint = await requestJson('/does-not-exist', {
          headers: { Authorization: `Bearer ${login.payload.token}` },
        });
        assert.equal(unknownEndpoint.response.status, 404);
        assert.ok(unknownEndpoint.payload.error?.requestId);

        const categoryDelete = await requestJson(`/categories/${categoryCreate.payload.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${login.payload.token}` },
        });
        assert.equal(categoryDelete.response.status, 200);
        assert.equal(categoryDelete.payload.success, true);
        assert.ok(categoryDelete.payload.reassignedTo?.id);

        const productAfterCategoryDelete = await requestJson(`/products/${productCreate.payload.id}`);
        assert.equal(productAfterCategoryDelete.response.status, 200);
        assert.equal(productAfterCategoryDelete.payload.categoryId, categoryDelete.payload.reassignedTo.id);
        assert.equal(productAfterCategoryDelete.payload.category, categoryDelete.payload.reassignedTo.name);

        assert.equal((await requestJson(`/products/${productCreate.payload.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${login.payload.token}` },
        })).response.status, 200);

        assert.equal((await requestJson(`/brands/${brandCreate.payload.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${login.payload.token}` },
        })).response.status, 200);

        const currentCategories = await requestJson('/categories');
        assert.equal(currentCategories.response.status, 200);
        assert.ok(Array.isArray(currentCategories.payload));
        const categoryIds = currentCategories.payload.map((item) => item.id);
        if (categoryIds.length >= 2) {
          const keepId = categoryIds[categoryIds.length - 1];
          const toDelete = categoryIds.filter((id) => id !== keepId);
          for (const categoryId of toDelete) {
            assert.equal((await requestJson(`/categories/${categoryId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${login.payload.token}` },
            })).response.status, 200);
          }
          const deleteLastCategoryAttempt = await requestJson(`/categories/${keepId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${login.payload.token}` },
          });
          assert.equal(deleteLastCategoryAttempt.response.status, 409);
        }

        assert.equal((await requestJson('/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${login.payload.token}` },
        })).response.status, 200);
      } finally {
        server.kill('SIGTERM');
        await waitForChildExit(server);
      }
    },
  },
  {
    name: 'ui route smoke publica y admin devuelve shell',
    async run() {
      const port = '3111';
      const origin = `http://127.0.0.1:${port}`;
      const server = spawn('node', ['server/server.js'], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PORT: port,
          CORS_ORIGINS: 'http://localhost:5173',
        },
        stdio: ['ignore', 'ignore', 'ignore'],
      });

      const routes = ['/', '/productos', '/producto/1', '/contacto', '/admin'];

      const waitForServer = async () => {
        for (let attempt = 0; attempt < 80; attempt += 1) {
          try {
            const response = await fetch(`${origin}/`);
            if (response.ok) return;
          } catch {
          }
          await delay(500);
        }
        throw new Error('server_ui_test_timeout');
      };

      try {
        await waitForServer();
        for (const route of routes) {
          const response = await fetch(`${origin}${route}`);
          assert.equal(response.status, 200, `route ${route} should return 200`);
          const html = await response.text();
          assert.ok(html.includes('<div id="root">'), `route ${route} should return SPA shell`);
        }
      } finally {
        server.kill('SIGTERM');
        await waitForChildExit(server);
      }
    },
  },
];

let failed = 0;
for (const test of tests) {
  try {
    await test.run();
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
