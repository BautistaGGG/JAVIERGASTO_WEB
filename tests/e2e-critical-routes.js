import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const port = '3112';
const baseUrl = `http://127.0.0.1:${port}`;
const apiUrl = `${baseUrl}/api`;

const server = spawn('node', ['server/server.js'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: port,
    CORS_ORIGINS: 'http://localhost:5173',
  },
  stdio: ['ignore', 'ignore', 'ignore'],
});

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
};

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

const waitForServer = async () => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (response.ok) return;
    } catch {
    }
    await delay(500);
  }
  throw new Error('e2e_server_timeout');
};

const publicRoutes = ['/', '/productos', '/producto/1', '/contacto', '/comparar'];

try {
  await waitForServer();

  const distIndexPath = path.join(process.cwd(), 'dist', 'index.html');
  if (fs.existsSync(distIndexPath)) {
    for (const route of publicRoutes) {
      const response = await fetch(`${baseUrl}${route}`);
      const html = await response.text();
      assert.equal(response.status, 200, `route ${route} should return 200`);
      assert.ok(html.includes('<div id="root">'), `route ${route} should return SPA shell`);
    }
  } else {
    console.log('SKIP e2e public route shell checks: dist/index.html no existe.');
  }

  const validContact = await requestJson(`${apiUrl}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'E2E Contact',
      email: 'e2e-contact@example.com',
      phone: '+54 11 5555 4444',
      subject: 'Consulta técnica',
      message: 'Mensaje de prueba E2E para validar formulario y endpoint.',
      website: '',
    }),
  });
  assert.equal(validContact.response.status, 201);
  assert.equal(validContact.payload.status, 'pending');
  assert.equal(validContact.payload.source, 'contact_form');

  const honeypotContact = await requestJson(`${apiUrl}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Bot Contact',
      email: 'bot@example.com',
      phone: '+54 11 3333 2222',
      subject: 'Spam',
      message: 'Este mensaje debería ser bloqueado por honeypot.',
      website: 'https://bot.example.com',
    }),
  });
  assert.equal(honeypotContact.response.status, 400);

  const longMessage = 'x'.repeat(2050);
  const oversizedContact = await requestJson(`${apiUrl}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Long Contact',
      email: 'long@example.com',
      phone: '+54 11 2222 1111',
      subject: 'Validación',
      message: longMessage,
      website: '',
    }),
  });
  assert.equal(oversizedContact.response.status, 400);

  console.log('PASS e2e rutas críticas y hardening contacto');
} finally {
  server.kill('SIGTERM');
  await waitForChildExit(server);
}
