# Admin Token Secret Rotation Runbook

Date: 2026-03-20

## Scope
- API auth for admin panel (single-admin operation).
- Env vars involved:
  - `ADMIN_TOKEN_SECRET` (legacy single secret)
  - `ADMIN_TOKEN_SECRETS` (current multi-secret rotation mode)

## How Rotation Works
- The API signs new tokens with the first secret in `ADMIN_TOKEN_SECRETS`.
- The API validates tokens against all secrets in `ADMIN_TOKEN_SECRETS`.
- This enables secret rotation without forcing immediate logout.

## No-Downtime Rotation Procedure
1. Current state example:
   - `ADMIN_TOKEN_SECRETS=secret_old`
2. Add the new secret at the beginning:
   - `ADMIN_TOKEN_SECRETS=secret_new,secret_old`
3. Deploy/restart API with updated env.
4. Wait at least one full token TTL (`ADMIN_TOKEN_TTL_SECONDS`, default 12h).
5. Remove old secret:
   - `ADMIN_TOKEN_SECRETS=secret_new`
6. Deploy/restart API again.

## Emergency Compromise Procedure
1. Set only a new secret in `ADMIN_TOKEN_SECRETS`.
2. Restart API immediately.
3. Re-login in admin panel.
4. Review audit events for unusual admin activity.

## Validation Checklist
- Login works after step 3.
- Existing token remains valid during overlap window.
- Old token fails after step 5 (expected).
