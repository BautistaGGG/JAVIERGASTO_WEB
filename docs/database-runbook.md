# Database Backup and Restore Runbook

Date: 2026-03-20

## Scope
- Database engine: SQLite
- Primary file: `server/database.db`

## Backup Policy
- Frequency: daily (minimum), plus before each deployment.
- Retention: keep at least 14 daily backups.
- Storage: `server/backups/` locally and a secondary external location.

## Create Backup
```bash
npm run backup-db
```

Expected output:
- `Backup created: .../server/backups/database_YYYYMMDD_HHMMSS.db`
- Optional env override: `BACKUP_RETENTION_DAYS` (default `14`)
- Old backups are pruned automatically after retention window.

## Schedule Daily Backup (Windows)
```powershell
powershell -ExecutionPolicy Bypass -File scripts/schedule-backup.ps1 -Time "03:00"
```

## Restore Backup
1. Stop backend process (`npm run server`).
2. Restore from desired backup:
```bash
npm run restore-db -- server/backups/database_YYYYMMDD_HHMMSS.db
```
3. Start backend and validate health endpoints.

## Post-Restore Validation
- Login admin works.
- `GET /api/products` responds 200.
- `GET /api/contacts` with admin token responds 200.

## Rollback Note
- Before restoring, always run one fresh backup of current state.
- Keep the pre-restore backup until validation is complete.
