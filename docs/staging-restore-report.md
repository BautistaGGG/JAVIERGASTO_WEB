# Staging Restore Drill Report

Date: 2026-03-20

## Environment
- Workspace: `D:\WEB_JG\JAVIERGASTO_WEB`
- Runtime used for checks: Node 20.12.0 (with `SKIP_NODE_VERSION_CHECK=true` for test/build commands)
- Database: SQLite (`server/database.db`)

## Drill Steps and Timings
1. Backup before restore drill:
   - Command: `npm run backup-db`
   - Artifact: `server/backups/database_20260320_142205.db`
2. Restore execution:
   - Command: `npm run restore-db -- D:\WEB_JG\JAVIERGASTO_WEB\server\backups\database_20260320_142205.db`
   - Measured restore time: `1577.26 ms` (1.58 s)
3. Post-restore validation:
   - `GET /api/health` -> `status: ok`
   - `GET /api/products` -> `200`
   - `POST /api/admin/login` -> `200` + token
   - `GET /api/contacts?page=1&pageSize=5` (admin token) -> `200`

## Incident Found During Drill
- Initial backend boot failed after restore with:
  - `SqliteError: no such table: admin_revoked_tokens`
- Fix applied:
  - `server/auth.js` now ensures `admin_revoked_tokens` table/index exist at startup.
- Result:
  - Backend starts correctly even if restored backup predates auth revocation schema.

## Outcome
- Restore drill completed successfully.
- Current observed recovery execution is within the defined RTO objective (60 min).
