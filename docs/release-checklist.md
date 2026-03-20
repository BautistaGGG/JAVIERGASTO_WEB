# Release Checklist (Production)

Date: 2026-03-20

## Pre-Release
- Confirm `npm test` passes.
- Confirm `npm run build` passes.
- Confirm `.env` contains:
  - `ADMIN_USER`
  - `ADMIN_PASSWORD`
  - `ADMIN_TOKEN_SECRET`
  - `ADMIN_TOKEN_TTL_SECONDS`
  - `CORS_ORIGINS`
  - `VITE_API_URL`
  - `VITE_ENABLE_MOCK_FALLBACK=false`
- Run `npm run backup-db` and store backup externally.

## Deployment
- Deploy frontend bundle (`dist`).
- Deploy backend (`server/`).
- Ensure `server/database.db` is present and readable.
- Start backend process and verify logs for startup errors.

## Post-Deploy Smoke
- `GET /api/products` returns 200.
- Admin login succeeds (`/api/admin/login`).
- Contact creation succeeds (`/api/contacts`).
- One admin CRUD operation succeeds for products.

## Rollback
- Stop backend process.
- Restore latest known-good backup:
  - `npm run restore-db -- <backup-file>`
- Re-deploy last stable frontend/backend bundle.

