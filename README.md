# JAVIERGASTO_WEB

Aplicacion web catalogo + panel admin para gestion de productos industriales.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Base de datos: SQLite (`better-sqlite3`)

## Requisitos
- Node.js `20.19+` (recomendado `22 LTS`)
- npm `10+`
- Referencia de runtime del repo: `.nvmrc` (`22.12.0`)

## Variables de entorno
Copiar `.env.example` a `.env` y ajustar valores:

- `PORT`: puerto del backend (default `3001`)
- `ADMIN_USER`: usuario admin inicial
- `ADMIN_PASSWORD`: password admin inicial
- `ADMIN_TOKEN_SECRET`: secreto para firma del token admin (obligatorio en produccion)
- `ADMIN_TOKEN_SECRETS`: lista separada por coma de secretos validos para rotacion sin downtime (el primero firma nuevos tokens)
- `ADMIN_TOKEN_TTL_SECONDS`: vida del token en segundos (default `43200`, 12h)
- `CORS_ORIGINS`: origenes permitidos para la API separados por coma (ej: `https://tu-dominio.com,https://admin.tu-dominio.com`)
- `VITE_API_URL`: base URL de la API para frontend (default `/api`)
- `VITE_ENABLE_MOCK_FALLBACK`: `true/false`

Comportamiento de fallback mock:
- Si `VITE_ENABLE_MOCK_FALLBACK` esta definido, usa ese valor.
- Si no esta definido, en `dev` queda habilitado y en `prod` deshabilitado.

## Scripts
- `npm run check-node`: valida runtime soportado (`^20.19.0 || >=22.12.0`)
- `npm install`: instala dependencias
- `npm run init-db`: crea esquema SQLite y seed inicial
- `npm run server`: levanta API/backend
- `npm run dev`: levanta frontend en modo desarrollo
- `npm run backup-db`: genera backup SQLite y aplica retencion (14 dias por default)
- `npm run restore-db -- <backup-file>`: restaura base desde backup
- `npm run smoke:postdeploy`: smoke tecnico post-deploy
- `npm test`: ejecuta pruebas unitarias base
- `npm run build`: compila frontend de produccion

Nota:
- `npm test` y `npm run build` ejecutan chequeo de runtime automáticamente.
- Solo para troubleshooting local puntual: `SKIP_NODE_VERSION_CHECK=true`.

## Flujo recomendado local
1. `npm install`
2. `npm run init-db`
3. En terminal 1: `npm run server`
4. En terminal 2: `npm run dev`

## Estado actual
- Backend CRUD y endpoints publicos/admin implementados.
- Frontend en modo API-first con fallback mock controlado por flag.
- Tests base de validadores y datos mock disponibles.
- El panel admin esta pensado para un unico usuario operador (single-admin).
- El panel admin exige login explicito y maneja expiracion de sesion en cliente.
- Se agrego manejo robusto de 401/403 para forzar relogin cuando la sesion vence.
- Se optimizo carga del admin con lazy-load de modulos y reduccion de requests duplicadas.

## Operacion
- Checklist de despliegue: `docs/RELEASE_CHECKLIST.md`
- Runbook de incidentes: `docs/RUNBOOK.md`
- Preparación migración DB: `docs/DB_MIGRATION_PREP.md`
