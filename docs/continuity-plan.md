# Continuity Plan (SQLite Runtime)

Date: 2026-03-20

## Objective
Define operational continuity targets and recovery steps for the current single-node SQLite deployment.

## Targets
- RPO target: 24 hours (max acceptable data loss).
- RTO target: 60 minutes (max acceptable service recovery time).

## Controls in Place
- Daily automated backup (`npm run backup-db`) with 14-day retention.
- Pre-deploy manual backup requirement.
- Restore command available (`npm run restore-db -- <backup-file>`).
- Health endpoint for service verification (`GET /api/health`).
- Post-deploy smoke script (`npm run smoke:postdeploy`).

## Incident Recovery Flow
1. Stop backend writes/process.
2. Create emergency backup of current DB state.
3. Select last known-good backup.
4. Run restore command.
5. Start backend.
6. Validate:
   - `GET /api/health`
   - admin login
   - `GET /api/products`
   - `GET /api/contacts` (admin token)
7. Run smoke checks and record incident timing.

## Escalation Rules
- If restore exceeds 60 minutes, escalate as `RTO breach`.
- If missing backup newer than 24 hours, escalate as `RPO breach`.

## Improvement Backlog
- Migrate from local disk backups to offsite/object storage.
- Add scheduled restore drill (monthly).
- Add alerting on backup job failures.
