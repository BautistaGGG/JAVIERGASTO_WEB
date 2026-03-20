const API_BASE = process.env.SMOKE_API_BASE || 'http://127.0.0.1:3001/api';
const ADMIN_USER = process.env.SMOKE_ADMIN_USER || process.env.ADMIN_USER || 'admin@industrialpro.com';
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123';

const checks = [];

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, options);
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
};

const addCheck = (name, ok, detail = '') => {
  checks.push({ name, ok, detail });
};

const fail = (message) => {
  addCheck(message, false);
  console.error(`FAIL ${message}`);
  process.exit(1);
};

try {
  const health = await requestJson('/health');
  addCheck('GET /health', health.response.status === 200, `status=${health.response.status}`);
  if (health.response.status !== 200) fail('GET /health');

  const products = await requestJson('/products');
  addCheck('GET /products', products.response.status === 200, `status=${products.response.status}`);
  if (products.response.status !== 200) fail('GET /products');

  const login = await requestJson('/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASSWORD }),
  });
  addCheck('POST /admin/login', login.response.status === 200, `status=${login.response.status}`);
  if (login.response.status !== 200 || !login.payload?.token) fail('POST /admin/login');

  const authHeaders = {
    Authorization: `Bearer ${login.payload.token}`,
    'Content-Type': 'application/json',
  };

  const contacts = await requestJson('/contacts?page=1&pageSize=5', {
    headers: { Authorization: `Bearer ${login.payload.token}` },
  });
  addCheck('GET /contacts', contacts.response.status === 200, `status=${contacts.response.status}`);
  if (contacts.response.status !== 200) fail('GET /contacts');

  const metrics = await requestJson('/admin/metrics', {
    headers: { Authorization: `Bearer ${login.payload.token}` },
  });
  addCheck('GET /admin/metrics', metrics.response.status === 200, `status=${metrics.response.status}`);
  if (metrics.response.status !== 200) fail('GET /admin/metrics');

  const contactCreate = await requestJson('/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Smoke Deploy',
      email: 'smoke.deploy@example.com',
      phone: '+54 11 1000 1000',
      message: 'Smoke test post deploy',
      subject: 'Smoke',
    }),
  });
  addCheck('POST /contacts', contactCreate.response.status === 201, `status=${contactCreate.response.status}`);
  if (contactCreate.response.status !== 201) fail('POST /contacts');

  const productCreate = await requestJson('/products', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Smoke Deploy Product',
      price: 1,
      stock: 1,
      category: 'Herramientas Eléctricas',
      categoryId: 1,
      brand: 'Bosch',
      brandId: 1,
      sku: `SMK-${Date.now()}`,
      stockStatus: 'in_stock',
    }),
  });
  addCheck('POST /products', productCreate.response.status === 201, `status=${productCreate.response.status}`);
  if (productCreate.response.status !== 201) fail('POST /products');

  const productDelete = await requestJson(`/products/${productCreate.payload.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${login.payload.token}` },
  });
  addCheck('DELETE /products/:id', productDelete.response.status === 200, `status=${productDelete.response.status}`);
  if (productDelete.response.status !== 200) fail('DELETE /products/:id');

  await requestJson('/admin/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${login.payload.token}` },
  });
  addCheck('POST /admin/logout', true);

  console.log('\nPost-deploy smoke summary');
  for (const check of checks) {
    console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.name}${check.detail ? ` (${check.detail})` : ''}`);
  }
} catch (error) {
  console.error('Smoke failed with unexpected error');
  console.error(error.stack || error.message);
  process.exit(1);
}
