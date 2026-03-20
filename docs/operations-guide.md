# Operations Guide

Date: 2026-03-20

## Daily Startup
1. Verify environment variables are loaded.
2. Run backend: `npm run server`.
3. Verify API health with `GET /api/products`.

## Routine Controls
- Check error logs for `level:error`.
- Verify admin login once per day.
- Confirm at least one contact write/read flow weekly.

## Backup Routine
- Run `npm run backup-db` daily.
- Copy backup file from `server/backups/` to external storage.
- Keep minimum 14 daily backups.

## Incident Quick Actions
- API unavailable: check backend process, then CORS/env values.
- Admin login failing: verify credentials and `ADMIN_TOKEN_SECRET`.
- Data inconsistency: stop writes, create emergency backup, then assess restore plan.

